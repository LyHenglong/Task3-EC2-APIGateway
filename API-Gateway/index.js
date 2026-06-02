const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const proxy = httpProxy.createProxyServer();

// 1. Define the routing map for your microservices
const routes = {
    '/register': 'http://localhost:5001',   // Registration Service
    '/login':    'http://localhost:5002',   // Authentication Service
    '/student':  'http://localhost:5003',   // Student Service
    '/teacher':  'http://localhost:5004'    // Teacher Service
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
    console.log(`=====> API Gateway active on http://localhost:${PORT} <=====`);
});