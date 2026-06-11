const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with this information already exists.',
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field.',
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
};

module.exports = { errorHandler, notFound };
