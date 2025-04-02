const { validateToken } = require('../utils/authentication');

function checkAuthCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];

        if (!tokenCookieValue) {
            req.user = null;
            return next();
        }

        try {
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload;
            return next();
        }
        catch (error) {
            console.error("Error validating token", error);
            res.clearCookie(cookieName);
            req.user = null;
            return next();
        }
    }
}

function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }
    next();
}

module.exports = {
    checkAuthCookie,
    requireAuth
}