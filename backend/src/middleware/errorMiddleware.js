function errorMiddleware(err, req, res, next) {
  console.error("Error:", err);

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = errorMiddleware;