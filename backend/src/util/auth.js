const jwt = require('jsonwebtoken');
const status = require('http-status');

const { SECRET } = process.env;

if (!SECRET) {
    throw new Error('Missing SECRET environment variable');
}

function signToken(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}

function verifyToken(token) {
    return jwt.verify(token, SECRET);
}

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw { code: status.UNAUTHORIZED, message: 'Authorization header missing or invalid' };
    }

    const token = authHeader.split(' ')[1];

    try {
        req.user = verifyToken(token);
        next();
    } catch (error) {
        throw { code: status.UNAUTHORIZED, message: 'Invalid or expired token' };
    }
}

function authorize(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            throw { code: status.FORBIDDEN, message: 'You do not have permission to perform this action' };
        }
        next();
    };
}

module.exports = {
    signToken,
    verifyToken,
    requireAuth,
    authorize
};