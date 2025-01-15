const db = require('../config/database');
const { responseHandler } = require('../utils/responseHandler');

const addToBlacklist = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { user_id, reason, created_by } = req.body;

        // 验证必填字段
        if (!user_id || !reason || !created_by) {
            return responseHandler(res, 400, false, '缺少必要参数');
        }

        // 检查用户是否存在
        const [user] = await connection.query('SELECT * FROM User WHERE user_id = ?', [user_id]);
        if (user.length === 0) {
            await connection.rollback();
            return responseHandler(res, 404, false, '用户不存在');
        }

        // 检查管理员是否存在
        const [admin] = await connection.query('SELECT * FROM User WHERE user_id = ?', [created_by]);
        if (admin.length === 0) {
            await connection.rollback();
            return responseHandler(res, 404, false, '管理员不存在');
        }

        // 检查用户是否已在黑名单中且状态为有效
        const [existingRecord] = await connection.query(
            'SELECT * FROM Blacklist WHERE user_id = ? AND status = "有效"',
            [user_id]
        );
        if (existingRecord.length > 0) {
            await connection.rollback();
            return responseHandler(res, 400, false, '该用户已在黑名单中');
        }

        // 添加黑名单记录
        const [result] = await connection.query(
            'INSERT INTO Blacklist (user_id, reason, created_by) VALUES (?, ?, ?)',
            [user_id, reason, created_by]
        );

        await connection.commit();
        return responseHandler(res, 200, true, '添加黑名单成功', {
            blacklist_id: result.insertId,
            user_id,
            reason,
            created_by,
            created_at: new Date(),
            status: '有效'
        });

    } catch (error) {
        await connection.rollback();
        console.error('添加黑名单失败:', error);
        return responseHandler(res, 500, false, '添加黑名单失败');
    } finally {
        connection.release();
    }
};

// 获取所有有效的黑名单记录
const getActiveBlacklist = async (req, res) => {
    const connection = await db.getConnection();
    try {
        // 查询所有有效的黑名单记录，同时获取用户和管理员的信息
        const [records] = await connection.query(`
            SELECT 
                b.*,
                u.name as user_name,
                u.college as user_college,
                u.contact as user_contact,
                u.grade as user_grade,
                a.name as admin_name
            FROM Blacklist b
            LEFT JOIN User u ON b.user_id = u.user_id
            LEFT JOIN User a ON b.created_by = a.user_id
            WHERE b.status = '有效'
            ORDER BY b.created_at DESC
        `);

        // 格式化返回数据
        const formattedRecords = records.map(record => ({
            blacklist_id: record.blacklist_id,
            user: {
                user_id: record.user_id,
                name: record.user_name,
                college: record.user_college,
                contact: record.user_contact,
                grade: record.user_grade
            },
            reason: record.reason,
            created_at: record.created_at,
            created_by: {
                admin_id: record.created_by,
                name: record.admin_name
            },
            status: record.status
        }));

        return responseHandler(res, 200, true, '获取黑名单记录成功', formattedRecords);
    } catch (error) {
        console.error('获取黑名单记录失败:', error);
        return responseHandler(res, 500, false, '获取黑名单记录失败');
    } finally {
        connection.release();
    }
};

// 解除黑名单
const removeFromBlacklist = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { blacklistId } = req.params;

        // 检查黑名单记录是否存在且状态为有效
        const [record] = await connection.query(
            'SELECT * FROM Blacklist WHERE blacklist_id = ? AND status = "有效"',
            [blacklistId]
        );

        if (record.length === 0) {
            await connection.rollback();
            return responseHandler(res, 404, false, '未找到有效的黑名单记录');
        }

        // 更新黑名单记录状态为无效
        await connection.query(
            'UPDATE Blacklist SET status = "已失效" WHERE blacklist_id = ?',
            [blacklistId]
        );

        await connection.commit();
        return responseHandler(res, 200, true, '已成功解除黑名单');

    } catch (error) {
        await connection.rollback();
        console.error('解除黑名单失败:', error);
        return responseHandler(res, 500, false, '解除黑名单失败');
    } finally {
        connection.release();
    }
};

module.exports = {
    addToBlacklist,
    getActiveBlacklist,
    removeFromBlacklist
}; 