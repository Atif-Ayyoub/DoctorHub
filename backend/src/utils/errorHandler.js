const { error } = require('./responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err.status) {
    return error(res, err.message, err.status);
  }
  return error(res, 'Internal server error', 500);
};

module.exports = errorHandler;
