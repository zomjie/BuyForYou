/**
 * 统一的响应处理函数
 * @param {Object} res - Express response 对象
 * @param {number} status - HTTP 状态码
 * @param {boolean} success - 请求是否成功
 * @param {string} message - 响应消息
 * @param {Object} [data] - 响应数据（可选）
 */
const responseHandler = (res, status, success, message, data = null) => {
    const response = {
        success,
        message,
        ...(data && { data })
    };
    
    res.status(status).json(response);
};

module.exports = {
    responseHandler
}; 