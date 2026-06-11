const { error } = require('../utils/responseHandler');

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return error(res, 'Authentication required', 401);
  if (!roles.includes(req.user.role)) return error(res, 'Insufficient permissions', 403);
  next();
};

module.exports = { authorize };
