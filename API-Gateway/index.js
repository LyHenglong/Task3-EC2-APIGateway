const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const proxy = httpProxy.createProxyServer();

// =========================================================================
// AWS NETWORK CONFIGURATION (Step 9 Requirements)
// Replace these placeholders with your actual EC2 Instance Public IPs
// =========================================================================
const STUDENT_EC2_IP = '54.210.xx.xx';  // Public IP of Student EC2 (Step 10.1)
const TEACHER_EC2_IP = '3.85.xx.xx';    // Public IP of Teacher EC2 (Step 10.2)

// Define the routing map pointing across your EC2 instances
const routes = {
    // Reg & Login live on the SAME EC2 instance as this gateway (Step 10.3),
    // so they can safely keep using 'localhost' but with their assigned ports.
    '/register': 'http://localhost:5001',   // Registration Service
    '/login':    'http://localhost:5002',   // Authentication Service
    
    // Student & Teacher live on separate external EC2 instances (Steps 10.1 & 10.2)
    '/student':  `http://${STUDENT_EC2_IP}:5003`,   // Student Service (Port 5003)
    '/teacher':  `http://${TEACHER_EC2_IP}:5004`    // Teacher Service (Port 5004)
};

// 2. Catch all incoming requests to Port 5000
app.use((req, res) => {
    // Check if the incoming URL starts with any of our defined route keys
    const match = Object.keys(routes).find(route => req.url.startsWith(route));
    
    if (match) {
        console.log(`[API Gateway]: Routing ${req.method} ${req.url} -> ${routes[match]}`);
        
        // Forward the request and its headers seamlessly to the target microservice
        proxy.web(req, res, { target: routes[match] }, (err) => {
            console.error(`[API Gateway Error]: Failed to connect to service at ${routes[match]}`);
            res.status(500).json({ 
                error: "Service temporarily unavailable.", 
                details: err.message 
            });
        });
    } else {
        // If the path doesn't match anything in our map
        console.log(`[API Gateway]: Blocked unknown route ${req.url}`);
        res.status(404).json({ error: "Route not found in API Gateway configuration." });
    }
});

// 3. Start the Gateway on Port 5000
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`=====> API Gateway active on AWS EC2 Port ${PORT} <=====`);
});