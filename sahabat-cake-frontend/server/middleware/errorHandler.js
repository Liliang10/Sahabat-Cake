import multer from 'multer';

export const notFound = (req, res, _next) => {
  res.status(404).json({ message: `Endpoint ${req.originalUrl} tidak ditemukan` });
};

export const errorHandler = (err, _req, res, _next) => {
  console.error('[Error Handler]:', err);

  // Handle Multer specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'Ukuran file terlalu besar. Maksimal 5 MB.',
      });
    }
    return res.status(400).json({
      message: `Kesalahan upload: ${err.message}`,
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: messages.join(', '),
      errors: messages,
    });
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      message: `Data dengan ${field} tersebut sudah terdaftar.`,
    });
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Sesi telah berakhir' });
  }

  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Terjadi kesalahan pada server',
  });
};
