const db = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');

class DiningHallController {
  static async getAllDiningHalls(req, res) {
    try {
      const [rows] = await db.execute('SELECT * FROM dininghall');
      ResponseHandler.success(res, rows);
    } catch (error) {
      console.error('Error fetching dining halls:', error);
      ResponseHandler.error(res, 'Failed to fetch dining halls');
    }
  }
}

module.exports = DiningHallController; 