// Auth middleware — two guards you compose on any route.
//
//   authenticate            → requires a valid JWT; attaches req.user = { id, role }
//   authorize(...roles)     → requires req.user.role to be one of `roles`
//
// Usage in a route file:
//   router.post("/addCourse", authenticate, authorize("teacher", "superadmin"), addCourse)
//
// The token is issued by POST /user/login (see authController.js) and sent by
// the client in the header:  Authorization: Bearer <token>

const jwt = require("jsonwebtoken");

// A dev fallback so the app still boots without a .env during learning. In a
// real deployment JWT_SECRET must be set — see .env.example / AUTH.md.
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";

function authenticate(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ msg: "Not authenticated — no token provided" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { id: payload.id, role: payload.role };
        next();
    } catch {
        return res.status(401).json({ msg: "Invalid or expired token" });
    }
}

// Higher-order middleware: pass the roles allowed to hit the route.
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: "Not authenticated" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                msg: `Forbidden — this action requires role: ${allowedRoles.join(" or ")}`
            });
        }
        next();
    };
}

module.exports = { authenticate, authorize, JWT_SECRET };
