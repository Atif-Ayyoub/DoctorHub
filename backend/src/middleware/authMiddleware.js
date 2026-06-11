const jwt = require('jsonwebtoken');
const { error } = require('../utils/responseHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'doctor_hub_jwt_secret_key_2024';

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return error(res, 'Authentication required', 401);
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return error(res, 'Invalid or expired token', 401);
  }
};

module.exports = { authenticate, JWT_SECRET };
