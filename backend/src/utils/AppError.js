class AppError extends Error {
  constructor(message, status = 400, details = undefined) {
    super(message);
    this.status = status;
    this.details = details;
    this.isAppError = true;
  }
}

module.exports = AppError;
