export const success = (res, message, data = {}, status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data
  });
};

export const error = (res, message, status = 500, errors = null) => {
  res.status(status).json({
    success: false,
    message,
    errors
  });
};
