const jwt = require('jsonwebtoken');

const authGuard = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send({ message: 'Access denied. No token provided.' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send({ message: 'Invalid token.' });
    }
};

const adminGuard = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Access denied. Not an admin.' });
    }
    next();
};

module.exports = { authGuard, adminGuard };
