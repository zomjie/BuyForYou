const db = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');

class DishController {
  static async getDishesGroupByDiningHall(req, res) {
    try {
      const query = `
        SELECT 
          dh.dininghall_no,
          dh.name as dininghall_name,
          dh.position as dininghall_position,
          m.merchant_no,
          m.name as merchant_name,
          d.dishno,
          d.dishname,
          d.dishtype,
          d.price,
          d.description,
          d.quantity,
          TO_BASE64(d.dish_image) as dish_image
        FROM dininghall dh
        LEFT JOIN merchant m ON dh.dininghall_no = m.dininghall_no
        LEFT JOIN dish d ON m.merchant_no = d.merchant_no
        WHERE m.status = '已通过'
        ORDER BY dh.dininghall_no, m.merchant_no, d.dishno
      `;

      // 添加数据库连接测试
      try {
        await db.execute('SELECT 1');
        console.log('Database connection successful');
      } catch (dbError) {
        console.error('Database connection error:', dbError);
        return ResponseHandler.error(res, 'Database connection failed', 500);
      }

      const [rows] = await db.execute(query);
      console.log('Query result:', rows); // 添加日志

      if (!rows || rows.length === 0) {
        return ResponseHandler.success(res, [], 'No data found');
      }

      // 重组数据结构
      const groupedData = rows.reduce((acc, curr) => {
        if (!curr.merchant_no) return acc;

        const diningHall = acc.find(dh => dh.dininghall_no === curr.dininghall_no);
        
        if (!diningHall) {
          acc.push({
            dininghall_no: curr.dininghall_no,
            dininghall_name: curr.dininghall_name,
            dininghall_position: curr.dininghall_position,
            merchants: [{
              merchant_no: curr.merchant_no,
              merchant_name: curr.merchant_name,
              dishes: [{
                dishno: curr.dishno,
                dishname: curr.dishname,
                dishtype: curr.dishtype,
                price: curr.price,
                description: curr.description,
                quantity: curr.quantity,
                dish_image: curr.dish_image
              }]
            }]
          });
        } else {
          const merchant = diningHall.merchants.find(m => m.merchant_no === curr.merchant_no);
          
          if (!merchant) {
            diningHall.merchants.push({
              merchant_no: curr.merchant_no,
              merchant_name: curr.merchant_name,
              dishes: [{
                dishno: curr.dishno,
                dishname: curr.dishname,
                dishtype: curr.dishtype,
                price: curr.price,
                description: curr.description,
                quantity: curr.quantity,
                dish_image: curr.dish_image
              }]
            });
          } else {
            merchant.dishes.push({
              dishno: curr.dishno,
              dishname: curr.dishname,
              dishtype: curr.dishtype,
              price: curr.price,
              description: curr.description,
              quantity: curr.quantity,
              dish_image: curr.dish_image
            });
          }
        }
        
        return acc;
      }, []);

      ResponseHandler.success(res, groupedData);
    } catch (error) {
      console.error('Detailed error:', error); // 更详细的错误日志
      ResponseHandler.error(res, `Failed to fetch dishes: ${error.message}`);
    }
  }
}

module.exports = DishController; 