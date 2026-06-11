const { error } = require('./responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Uploaded file is too large' : err.message;
    return error(res, message, 422);
  }
  if (err.status) {
    return error(res, err.message, err.status);
  }
  return error(res, 'Internal server error', 500);
};

module.exports = errorHandler;
