const crypto = require('crypto');

// The secret key MUST perfectly match the JWT_SECRET from your Auth service .env file!
const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretJWTKey_2024_Registration@Service"; 

// Helper to decode base64url strings back to normal text
function base64urlDecode(str) {
    // Add back stripped padding characters if necessary
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
}

const verifyToken = (requiredRole) => {
    return (req, res, next) => {
        // 1. Extract the passport token from the incoming Authorization header
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(403).json({ message: "No token provided. Access Denied." });
        }

        // Split "Bearer <TOKEN_STRING>" to extract just the token
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }

        try {
            // Split the token into its 3 components: Header, Payload, Signature
            const [headerB64, bodyB64, sigB64] = token.split('.');
            if (!headerB64 || !bodyB64 || !sigB64) {
                return res.status(401).json({ message: "Invalid or expired token." });
            }

            // 2. Cryptographically re-verify the signature match natively
            const expectedSig = crypto
                .createHmac('sha256', JWT_SECRET)
                .update(`${headerB64}.${bodyB64}`)
                .digest('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            if (expectedSig !== sigB64) {
                console.log("⚠️ Token signature verification failed.");
                return res.status(401).json({ message: "Invalid or expired token." });
            }

            // 3. Parse out the body payload data
            const payload = JSON.parse(base64urlDecode(bodyB64));

            // 4. Verify expiration date (if present)
            if (payload.exp && Date.now() / 1000 > payload.exp) {
                return res.status(401).json({ message: "Invalid or expired token." });
            }

            // 5. Role validation check
            // 5. Role validation check (Updated to be case-insensitive)
            if (requiredRole && payload.role.toLowerCase().trim() !== requiredRole.toLowerCase().trim()) {
                return res.status(403).json({ message: "Forbidden: Unauthorized Role access." });
            }

            // Token is perfectly valid! Attach user info to request and pass control to the route
            req.user = payload;
            next(); 
        } catch (err) {
            console.error("Middleware validation crash error:", err);
            return res.status(401).json({ message: "Invalid or expired token." });
        }
    };
};

module.exports = verifyToken;