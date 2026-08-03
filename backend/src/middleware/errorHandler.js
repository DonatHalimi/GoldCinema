function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Something went wrong on our end. Please try again.'
      : err.message || 'Unexpected error.';
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
