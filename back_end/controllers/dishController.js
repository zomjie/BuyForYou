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
    },

    // 添加新菜品
    addDish: async (req, res) => {
        try {
            const { name, price, stock, description, merchantNo } = req.body;

            // 验证必填字段
            if (!name || !price || !stock || !merchantNo) {
                return responseHandler(res, 400, false, '缺少必要参数');
            }

            // 验证商家是否存在且已通过审核
            const [merchants] = await db.query(
                'SELECT * FROM Merchant WHERE merchant_no = ? AND status = "已通过"',
                [merchantNo]
            );

            if (merchants.length === 0) {
                return responseHandler(res, 404, false, '商家不存在或未通过审核');
            }

            // 插入新菜品
            const [result] = await db.query(
                'INSERT INTO Dish (dishname, price, quantity, description, merchant_no) VALUES (?, ?, ?, ?, ?)',
                [name, price, stock, description || '', merchantNo]
            );

            if (result.affectedRows === 1) {
                // 获取新插入的菜品信息
                const [newDish] = await db.query(
                    'SELECT * FROM Dish WHERE dishno = ?',
                    [result.insertId]
                );

                responseHandler(res, 201, true, '添加成功', {
                    dish: {
                        id: newDish[0].dishno,
                        name: newDish[0].dishname,
                        price: newDish[0].price,
                        stock: newDish[0].quantity,
                        description: newDish[0].description,
                        merchantNo: newDish[0].merchant_no
                    }
                });
            } else {
                throw new Error('添加菜品失败');
            }
        } catch (error) {
            console.error('添加菜品错误:', error);
            responseHandler(res, 500, false, '添加菜品失败，请稍后重试');
        }
    },

    // 修改菜品信息
    updateDish: async (req, res) => {
        try {
            const { dishNo } = req.params;
            const { name, price, stock, description, merchantNo } = req.body;

            // 验证必填字段
            if (!name || !price || !stock || !merchantNo) {
                return responseHandler(res, 400, false, '缺少必要参数');
            }

            // 验证商家是否存在且已通过审核
            const [merchants] = await db.query(
                'SELECT * FROM Merchant WHERE merchant_no = ? AND status = "已通过"',
                [merchantNo]
            );

            if (merchants.length === 0) {
                return responseHandler(res, 404, false, '商家不存在或未通过审核');
            }

            // 验证菜品是否属于该商家
            const [dishes] = await db.query(
                'SELECT * FROM Dish WHERE dishno = ? AND merchant_no = ?',
                [dishNo, merchantNo]
            );

            if (dishes.length === 0) {
                return responseHandler(res, 404, false, '菜品不存在或不属于该商家');
            }

            // 更新菜品信息
            const [result] = await db.query(
                'UPDATE Dish SET dishname = ?, price = ?, quantity = ?, description = ? WHERE dishno = ? AND merchant_no = ?',
                [name, price, stock, description || '', dishNo, merchantNo]
            );

            if (result.affectedRows === 1) {
                // 获取更新后的菜品信息
                const [updatedDish] = await db.query(
                    'SELECT * FROM Dish WHERE dishno = ?',
                    [dishNo]
                );

                responseHandler(res, 200, true, '修改成功', {
                    dish: {
                        id: updatedDish[0].dishno,
                        name: updatedDish[0].dishname,
                        price: updatedDish[0].price,
                        stock: updatedDish[0].quantity,
                        description: updatedDish[0].description,
                        merchantNo: updatedDish[0].merchant_no
                    }
                });
            } else {
                throw new Error('修改菜品失败');
            }
        } catch (error) {
            console.error('修改菜品错误:', error);
            responseHandler(res, 500, false, '修改菜品失败，请稍后重试');
        }
    }
};

module.exports = dishController; 