const db = require('../db');
const { responseHandler } = require('../utils/responseHandler');

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

// 获取未完成订单列表
exports.getPendingOrders = async (req, res) => {
    const connection = await db.getConnection();
    try {
        // 查询未完成的订单及其详情，包括菜品信息
        const [orders] = await connection.query(`
            SELECT 
                mo.*,
                od.dish_id,
                od.quantity,
                od.note,
                d.dishname,
                d.price
            FROM MealOrder mo
            LEFT JOIN OrderDetail od ON mo.order_id = od.order_id
            LEFT JOIN Dish d ON od.dish_id = d.dishno
            WHERE mo.payment_status = '未支付' OR mo.delivery_status IS NULL
            ORDER BY mo.order_time DESC
        `);

        // 整理数据结构
        const formattedOrders = orders.reduce((acc, order) => {
            if (!acc[order.order_id]) {
                acc[order.order_id] = {
                    orderId: order.order_id,
                    category: order.category,
                    buyerPosition: order.buyer_position,
                    tips: order.tips,
                    buyerId: order.buyer_id,
                    delivererId: order.deliverer_id,
                    merchantNo: order.merchant_no,
                    orderTime: order.order_time,
                    deliveryTime: order.delivery_time,
                    paymentStatus: order.payment_status,
                    deliveryStatus: order.delivery_status,
                    items: []
                };
            }
            
            if (order.dish_id) {  // 只有当存在菜品信息时才添加
                acc[order.order_id].items.push({
                    dishId: order.dish_id,
                    dishName: order.dishname,
                    price: order.price,
                    quantity: order.quantity,
                    note: order.note
                });
            }
            
            return acc;
        }, {});

        res.json({
            success: true,
            message: '获取未完成订单成功',
            data: Object.values(formattedOrders)
        });
    } catch (error) {
        console.error('获取未完成订单失败:', error);
        res.status(500).json({
            success: false,
            message: error.message || '获取未完成订单失败'
        });
    } finally {
        connection.release();
    }
};

// 获取用户订单列表
exports.getUserOrders = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const userId = req.params.userId;
        
        if (!userId) {
            throw new Error('用户ID不能为空');
        }

        // 查询用户的所有订单及其详情
        const [orders] = await connection.query(`
            SELECT 
                mo.*,
                d.dishname,
                od.quantity,
                od.note,
                d.price
            FROM MealOrder mo
            LEFT JOIN OrderDetail od ON mo.order_id = od.order_id
            LEFT JOIN Dish d ON od.dish_id = d.dishno
            WHERE mo.buyer_id = ?
            ORDER BY mo.order_time DESC
        `, [userId]);

        // 整理数据结构
        const formattedOrders = orders.reduce((acc, order) => {
            if (!acc[order.order_id]) {
                acc[order.order_id] = {
                    orderId: order.order_id,
                    category: order.category,
                    buyerPosition: order.buyer_position,
                    tips: order.tips,
                    buyerId: order.buyer_id,
                    delivererId: order.deliverer_id,
                    merchantNo: order.merchantNo,
                    orderTime: order.order_time,
                    deliveryTime: order.delivery_time,
                    paymentStatus: order.payment_status,
                    deliveryStatus: order.delivery_status,
                    totalAmount: 0,
                    items: []
                };
            }
            
            if (order.dishname) {  // 只有当存在菜品信息时才添加
                const itemAmount = order.price * order.quantity;
                acc[order.order_id].totalAmount += itemAmount;
                
                acc[order.order_id].items.push({
                    dishName: order.dishname,
                    price: order.price,
                    quantity: order.quantity,
                    amount: itemAmount,
                    note: order.note
                });
            }
            
            return acc;
        }, {});

        // 添加小费到总金额
        Object.values(formattedOrders).forEach(order => {
            order.totalAmount += order.tips || 0;
        });

        res.json({
            success: true,
            message: '获取用户订单成功',
            data: Object.values(formattedOrders)
        });
    } catch (error) {
        console.error('获取用户订单失败:', error);
        res.status(500).json({
            success: false,
            message: error.message || '获取用户订单失败'
        });
    } finally {
        connection.release();
    }
};

// 支付订单
exports.payOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { order_id } = req.body;
        
        if (!order_id) {
            throw new Error('订单ID不能为空');
        }

        // 检查订单是否存在
        const [orders] = await connection.query(
            'SELECT * FROM MealOrder WHERE order_id = ?',
            [order_id]
        );

        if (orders.length === 0) {
            throw new Error('订单不存在');
        }

        const order = orders[0];
        
        // 检查订单状态
        if (order.payment_status === '已支付') {
            throw new Error('订单已支付');
        }

        // 更新订单状态为已支付
        await connection.query(
            'UPDATE MealOrder SET payment_status = ? WHERE order_id = ?',
            ['已支付', order_id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: '支付成功',
            data: {
                orderId: order_id,
                paymentStatus: '已支付'
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('支付订单失败:', error);
        res.status(500).json({
            success: false,
            message: error.message || '支付失败'
        });
    } finally {
        connection.release();
    }
};

// 更新订单配送者
exports.updateDeliverer = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { order_id, deliverer_id } = req.body;
        
        if (!order_id || !deliverer_id) {
            throw new Error('订单ID和配送者ID不能为空');
        }

        // 检查订单是否存在
        const [orders] = await connection.query(
            'SELECT * FROM MealOrder WHERE order_id = ?',
            [order_id]
        );

        if (orders.length === 0) {
            throw new Error('订单不存在');
        }

        const order = orders[0];
        
        // 检查订单是否已有配送者
        if (order.deliverer_id) {
            throw new Error('订单已有配送者');
        }

        // 检查订单是否已支付
        if (order.payment_status !== '已支付') {
            throw new Error('订单未支付，不能分配配送者');
        }

        // 更新配送者ID和配送状态
        await connection.query(
            'UPDATE MealOrder SET deliverer_id = ?, delivery_status = ? WHERE order_id = ?',
            [deliverer_id, '配送中', order_id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: '配送者分配成功',
            data: {
                orderId: order_id,
                delivererId: deliverer_id,
                deliveryStatus: '配送中'
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('更新配送者失败:', error);
        res.status(500).json({
            success: false,
            message: error.message || '更新配送者失败'
        });
    } finally {
        connection.release();
    }
};

// 获取用户配送的订单列表
exports.getDeliveryOrders = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const delivererId = req.params.delivererId;
        
        if (!delivererId) {
            throw new Error('配送者ID不能为空');
        }

        // 查询用户配送的所有订单及其详情
        const [orders] = await connection.query(`
            SELECT 
                mo.*,
                d.dishname,
                od.quantity,
                od.note,
                d.price
            FROM MealOrder mo
            LEFT JOIN OrderDetail od ON mo.order_id = od.order_id
            LEFT JOIN Dish d ON od.dish_id = d.dishno
            WHERE mo.deliverer_id = ?
            ORDER BY mo.order_time DESC
        `, [delivererId]);

        // 整理数据结构
        const formattedOrders = orders.reduce((acc, order) => {
            if (!acc[order.order_id]) {
                acc[order.order_id] = {
                    orderId: order.order_id,
                    category: order.category,
                    buyerPosition: order.buyer_position,
                    tips: order.tips,
                    buyerId: order.buyer_id,
                    delivererId: order.deliverer_id,
                    merchantNo: order.merchantNo,
                    orderTime: order.order_time,
                    deliveryTime: order.delivery_time,
                    paymentStatus: order.payment_status,
                    deliveryStatus: order.delivery_status,
                    totalAmount: 0,
                    items: []
                };
            }
            
            if (order.dishname) {  // 只有当存在菜品信息时才添加
                const itemAmount = order.price * order.quantity;
                acc[order.order_id].totalAmount += itemAmount;
                
                acc[order.order_id].items.push({
                    dishName: order.dishname,
                    price: order.price,
                    quantity: order.quantity,
                    amount: itemAmount,
                    note: order.note
                });
            }
            
            return acc;
        }, {});

        // 添加小费到总金额
        Object.values(formattedOrders).forEach(order => {
            order.totalAmount += order.tips || 0;
        });

        res.json({
            success: true,
            message: '获取配送订单成功',
            data: Object.values(formattedOrders)
        });
    } catch (error) {
        console.error('获取配送订单失败:', error);
        res.status(500).json({
            success: false,
            message: error.message || '获取配送订单失败'
        });
    } finally {
        connection.release();
    }
};

// 更新订单配送状态为已送达
exports.updateDeliveryStatus = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { order_id } = req.body;
        
        if (!order_id) {
            throw new Error('订单ID不能为空');
        }

        // 检查订单是否存在
        const [orders] = await connection.query(
            'SELECT * FROM MealOrder WHERE order_id = ?',
            [order_id]
        );

        if (orders.length === 0) {
            throw new Error('订单不存在');
        }

        const order = orders[0];
        
        // 检查订单状态
        if (order.delivery_status === '已送达') {
            throw new Error('订单已送达');
        }

        if (order.delivery_status !== '配送中') {
            throw new Error('订单未在配送中');
        }

        // 更新订单配送状态为已送达
        await connection.query(
            'UPDATE MealOrder SET delivery_status = ? WHERE order_id = ?',
            ['已送达', order_id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: '订单已送达',
            data: {
                orderId: order_id,
                deliveryStatus: '已送达'
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('更新配送状态失败:', error);
        res.status(500).json({
            success: false,
            message: error.message || '更新配送状态失败'
        });
    } finally {
        connection.release();
    }
};

// 添加投诉
exports.addComplaint = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { order_id, complainant_id, complaint_type, reason, evidence } = req.body;

        // 验证必填字段
        if (!order_id || !complainant_id || !complaint_type || !reason) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数'
            });
        }

        // 验证订单是否存在
        const [orders] = await connection.query(
            'SELECT * FROM MealOrder WHERE order_id = ?',
            [order_id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: '订单不存在'
            });
        }

        // 验证投诉类型是否有效
        const validTypes = ['配送延迟', '态度恶劣', '商品损坏', '未按要求配送', '其他'];
        if (!validTypes.includes(complaint_type)) {
            return res.status(400).json({
                success: false,
                message: '无效的投诉类型'
            });
        }

        // 插入投诉记录
        const [result] = await connection.query(
            'INSERT INTO Complaint (order_id, complainant_id, complaint_type, reason, evidence) VALUES (?, ?, ?, ?, ?)',
            [order_id, complainant_id, complaint_type, reason, evidence || null]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: '投诉提交成功',
            data: {
                complaint_id: result.insertId
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('添加投诉错误:', error);
        res.status(500).json({
            success: false,
            message: '添加投诉失败，请稍后重试'
        });
    } finally {
        connection.release();
    }
};

// 获取用户投诉记录
exports.getUserComplaints = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const userId = req.params.userId;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: '用户ID不能为空'
            });
        }

        // 查询用户的所有投诉记录，同时关联订单信息
        const [complaints] = await connection.query(`
            SELECT 
                c.*,
                mo.order_time,
                mo.buyer_position,
                mo.category
            FROM Complaint c
            LEFT JOIN MealOrder mo ON c.order_id = mo.order_id
            WHERE c.complainant_id = ?
            ORDER BY c.created_at DESC
        `, [userId]);

        // 格式化数据
        const formattedComplaints = complaints.map(complaint => ({
            complaintId: complaint.complaint_id,
            orderId: complaint.order_id,
            orderTime: complaint.order_time,
            buyerPosition: complaint.buyer_position,
            category: complaint.category,
            complaintType: complaint.complaint_type,
            reason: complaint.reason,
            evidence: complaint.evidence,
            status: complaint.status,
            createdAt: complaint.created_at
        }));

        res.json({
            success: true,
            message: '获取投诉记录成功',
            data: formattedComplaints
        });
    } catch (error) {
        console.error('获取投诉记录失败:', error);
        res.status(500).json({
            success: false,
            message: '获取投诉记录失败，请稍后重试'
        });
    } finally {
        connection.release();
    }
};

// 处理投诉
exports.handleComplaint = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { complaintId } = req.params;
        const { status } = req.body;

        // 验证状态值
        const validStatuses = ['已处理', '已驳回'];
        if (!validStatuses.includes(status)) {
            return responseHandler(res, 400, false, '无效的状态值，只能是"已处理"或"已驳回"');
        }

        // 检查投诉是否存在
        const [complaints] = await connection.query(
            'SELECT * FROM Complaint WHERE complaint_id = ?',
            [complaintId]
        );

        if (complaints.length === 0) {
            return responseHandler(res, 404, false, '投诉记录不存在');
        }

        // 更新投诉状态
        await connection.query(
            'UPDATE Complaint SET status = ? WHERE complaint_id = ?',
            [status, complaintId]
        );

        await connection.commit();
        return responseHandler(res, 200, true, '投诉处理成功', { complaint_id: complaintId, status });

    } catch (error) {
        await connection.rollback();
        console.error('处理投诉失败:', error);
        return responseHandler(res, 500, false, error.message || '处理投诉失败');
    } finally {
        connection.release();
    }
};

// 获取未处理的投诉列表
exports.getPendingComplaints = async (req, res) => {
    const connection = await db.getConnection();
    try {
        // 查询未处理的投诉记录，同时关联订单和用户信息
        const [complaints] = await connection.query(`
            SELECT 
                c.*,
                mo.order_time,
                mo.buyer_position,
                mo.category,
                u.name as complainant_name,
                u.contact as complainant_contact
            FROM Complaint c
            LEFT JOIN MealOrder mo ON c.order_id = mo.order_id
            LEFT JOIN User u ON c.complainant_id = u.user_id
            WHERE c.status = '待处理'
            ORDER BY c.created_at DESC
        `);

        // 格式化数据
        const formattedComplaints = complaints.map(complaint => ({
            complaintId: complaint.complaint_id,
            orderId: complaint.order_id,
            orderTime: complaint.order_time,
            buyerPosition: complaint.buyer_position,
            category: complaint.category,
            complainantId: complaint.complainant_id,
            complainantName: complaint.complainant_name,
            complainantContact: complaint.complainant_contact,
            complaintType: complaint.complaint_type,
            reason: complaint.reason,
            evidence: complaint.evidence,
            status: complaint.status,
            createdAt: complaint.created_at
        }));

        return responseHandler(res, 200, true, '获取未处理投诉记录成功', formattedComplaints);
    } catch (error) {
        console.error('获取未处理投诉记录失败:', error);
        return responseHandler(res, 500, false, error.message || '获取未处理投诉记录失败');
    } finally {
        connection.release();
    }
};

module.exports = exports; 