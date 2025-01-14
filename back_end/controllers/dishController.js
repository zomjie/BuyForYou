const db = require('../config/database');
const { responseHandler } = require('../utils/responseHandler');

const dishController = {
    // 获取按食堂分组的菜品
    getDishesByDiningHall: async (req, res) => {
        try {
            // 获取所有食堂及其商家和菜品信息
            const [results] = await db.query(`
                SELECT 
                    DH.dininghall_no,
                    DH.name as dininghall_name,
                    DH.position,
                    M.merchant_no,
                    M.name as merchant_name,
                    M.description as merchant_description,
                    M.likes as merchant_likes,
                    M.hates as merchant_hates,
                    D.dishno,
                    D.dishname,
                    D.dishtype,
                    D.price,
                    D.description as dish_description,
                    D.quantity
                FROM DiningHall DH
                LEFT JOIN Merchant M ON DH.dininghall_no = M.dininghall_no AND M.status = '已通过'
                LEFT JOIN Dish D ON M.merchant_no = D.merchant_no
                ORDER BY DH.dininghall_no, M.merchant_no, D.dishno
            `);

            console.log('Database query results:', results);

            // 组织数据结构
            const diningHalls = {};
            results.forEach(row => {
                // 如果食堂不存在，创建食堂对象
                if (!diningHalls[row.dininghall_no]) {
                    diningHalls[row.dininghall_no] = {
                        dininghallNo: row.dininghall_no,
                        name: row.dininghall_name,
                        position: row.position,
                        merchants: {}
                    };
                }

                // 如果有商家信息
                if (row.merchant_no) {
                    // 如果商家不存在，创建商家对象
                    if (!diningHalls[row.dininghall_no].merchants[row.merchant_no]) {
                        diningHalls[row.dininghall_no].merchants[row.merchant_no] = {
                            merchantNo: row.merchant_no,
                            name: row.merchant_name,
                            description: row.merchant_description,
                            likes: row.merchant_likes || 0,
                            hates: row.merchant_hates || 0,
                            dishes: []
                        };
                    }

                    // 如果有菜品信息，添加到商家的菜品列表中
                    if (row.dishno) {
                        diningHalls[row.dininghall_no].merchants[row.merchant_no].dishes.push({
                            dishNo: row.dishno,
                            name: row.dishname,
                            type: row.dishtype,
                            price: row.price,
                            description: row.dish_description,
                            quantity: row.quantity
                        });
                    }
                }
            });

            // 转换对象为数组格式
            const formattedData = Object.values(diningHalls).map(diningHall => ({
                ...diningHall,
                merchants: Object.values(diningHall.merchants)
            }));

            console.log('Formatted response data:', {
                success: true,
                message: '获取成功',
                data: { diningHalls: formattedData }
            });

            res.status(200).json({
                success: true,
                message: '获取成功',
                data: { diningHalls: formattedData }
            });
        } catch (error) {
            console.error('获取食堂菜品错误:', error);
            res.status(500).json({
                success: false,
                message: '获取食堂菜品失败，请稍后重试'
            });
        }
    },

    // 获取特定商家的菜品
    getDishesByMerchant: async (req, res) => {
        try {
            const { merchantNo } = req.params;

            // 获取商家信息和菜品
            const [results] = await db.query(`
                SELECT 
                    M.merchant_no,
                    M.name as merchant_name,
                    M.description as merchant_description,
                    M.likes,
                    M.hates,
                    D.dishno,
                    D.dishname,
                    D.dishtype,
                    D.price,
                    D.description as dish_description,
                    D.quantity
                FROM Merchant M
                LEFT JOIN Dish D ON M.merchant_no = D.merchant_no
                WHERE M.merchant_no = ? AND M.status = '已通过'
            `, [merchantNo]);

            if (results.length === 0) {
                return responseHandler(res, 404, false, '商家不存在或未通过审核');
            }

            // 组织数据结构
            const merchantInfo = {
                merchantNo: results[0].merchant_no,
                name: results[0].merchant_name,
                description: results[0].merchant_description,
                likes: results[0].likes,
                hates: results[0].hates,
                dishes: results.filter(row => row.dishno).map(row => ({
                    dishNo: row.dishno,
                    name: row.dishname,
                    type: row.dishtype,
                    price: row.price,
                    description: row.dish_description,
                    quantity: row.quantity
                }))
            };

            responseHandler(res, 200, true, '获取成功', { merchant: merchantInfo });
        } catch (error) {
            console.error('获取商家菜品错误:', error);
            responseHandler(res, 500, false, '获取商家菜品失败，请稍后重试');
        }
    }
};

module.exports = dishController; 