class ResponseHandler {
  static success(res, data, message = 'Success') {
    res.status(200).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'Error', statusCode = 500) {
    res.status(statusCode).json({
      success: false,
      message
    });
  }
}

module.exports = ResponseHandler; 