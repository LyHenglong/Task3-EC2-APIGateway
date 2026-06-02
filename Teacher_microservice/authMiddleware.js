const crypto = require('crypto');

// The secret key MUST perfectly match the JWT_SECRET from your Auth service .env file!
const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretJWTKey_2024_Registration@Service"; 

// Helper to decode base64url strings back to standard readable JSON text strings
function base64urlDecode(str) {
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

        // Split "Bearer <TOKEN_STRING>" to isolate the actual signature string asset
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }

        try {
            // Split the custom token structure into Header, Payload, and Signature segments
            const [headerB64, bodyB64, sigB64] = token.split('.');
            if (!headerB64 || !bodyB64 || !sigB64) {
                return res.status(401).json({ message: "Invalid or expired token." });
            }

            // 2. Cryptographically re-verify the signature integrity natively
            const expectedSig = crypto
                .createHmac('sha256', JWT_SECRET)
                .update(`${headerB64}.${bodyB64}`)
                .digest('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            if (expectedSig !== sigB64) {
                console.log("⚠️ Signature integrity mismatch encountered.");
                return res.status(401).json({ message: "Invalid or expired token." });
            }

            // 3. Extract and parse out the body payload collection
            const payload = JSON.parse(base64urlDecode(bodyB64));

            // 4. Verify epoch expiration timestamps
            if (payload.exp && Date.now() / 1000 > payload.exp) {
                return res.status(401).json({ message: "Invalid or expired token." });
            }

            // 5. Dynamic Role Validation Check
            if (requiredRole && payload.role !== requiredRole) {
                return res.status(403).json({ message: "Forbidden: Unauthorized Role access." });
            }

            // Token configuration valid! Save data back onto request thread context hook
            req.user = payload;
            next(); 
        } catch (err) {
            console.error("Middleware context evaluation structural failure:", err);
            return res.status(401).json({ message: "Invalid or expired token." });
        }
    };
};

module.exports = verifyToken;