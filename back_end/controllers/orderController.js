const db = require('../db');

// 获取订单列表
exports.getOrders = async (req, res) => {
    try {
        const [orders] = await db.query('SELECT * FROM MealOrder');
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('获取订单列表失败:', error);
        res.status(500).json({
            success: false,
            message: error.message || '获取订单列表失败'
        });
    }
};

// 创建单个订单
exports.createOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { userId, merchantNo, dishNo, quantity, remark } = req.body;
        
        // 创建订单主表记录
        const [orderResult] = await connection.query(
            'INSERT INTO MealOrder (buyer_id, merchantNo, category, buyer_position) VALUES (?, ?, ?, ?)',
            [userId, merchantNo, '午餐', '默认地址']
        );

        const orderId = orderResult.insertId;

        // 创建订单详情记录
        await connection.query(
            'INSERT INTO OrderDetail (order_id, dish_id, quantity, note) VALUES (?, ?, ?, ?)',
            [orderId, dishNo, quantity, remark]
        );

        // 更新菜品库存
        await connection.query(
            'UPDATE Dish SET quantity = quantity - ? WHERE dishno = ?',
            [quantity, dishNo]
        );

        await connection.commit();

        res.json({
            success: true,
            message: '下单成功',
            data: {
                orderId
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('创建订单失败:', error);
        res.status(500).json({
            success: false,
            message: error.message || '下单失败'
        });
    } finally {
        connection.release();
    }
};

// 批量创建订单
exports.createBatchOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { userId, items, buyerPosition, category, tips } = req.body;
        if (!userId || !items || !Array.isArray(items) || items.length === 0 || !buyerPosition || !category) {
            throw new Error('无效的请求参数');
        }

        // 创建一个订单记录
        const [orderResult] = await connection.query(
            `INSERT INTO MealOrder (
                buyer_id, 
                category, 
                buyer_position, 
                tips,
                payment_status,
                order_time
            ) VALUES (?, ?, ?, ?, ?, NOW())`,
            [
                userId,
                category,
                buyerPosition,
                tips || 0,
                '未支付'
            ]
        );

        const orderId = orderResult.insertId;

        // 创建订单详情记录
        for (const item of items) {
            await connection.query(
                `INSERT INTO OrderDetail (
                    order_id, 
                    dish_id, 
                    quantity, 
                    note
                ) VALUES (?, ?, ?, ?)`,
                [
                    orderId,
                    item.dishNo,
                    item.quantity,
                    item.remark || ''
                ]
            );

            // 更新菜品库存
            await connection.query(
                'UPDATE Dish SET quantity = quantity - ? WHERE dishno = ?',
                [item.quantity, item.dishNo]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: '下单成功',
            data: {
                orderId: orderId
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('创建订单失败:', error);
        res.status(500).json({
            success: false,
            message: error.message || '下单失败'
        });
    } finally {
        connection.release();
    }
}; 