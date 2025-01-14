const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { responseHandler } = require('../utils/responseHandler');

const userController = {
    // 用户注册
    register: async (req, res) => {
        try {
            const { userId, name, college, contact, grade, password } = req.body;

            // 检查用户是否已存在
            const [existingUser] = await db.query('SELECT * FROM User WHERE user_id = ?', [userId]);
            if (existingUser.length > 0) {
                return responseHandler(res, 400, false, '该学号已被注册');
            }

            // 密码加密
            const hashedPassword = await bcrypt.hash(password, 10);

            // 插入新用户
            await db.query(
                'INSERT INTO User (user_id, password, name, college, contact, grade, type) VALUES (?, ?, ?, ?, ?, ?, 0)',
                [userId, hashedPassword, name, college, contact, grade]
            );

            responseHandler(res, 200, true, '注册成功');
        } catch (error) {
            console.error('注册错误:', error);
            responseHandler(res, 500, false, '注册失败，请稍后重试');
        }
    },

    // 管理员注册
    registerAdmin: async (req, res) => {
        try {
            const { userId, name, college, contact, grade, password } = req.body;

            // 检查用户是否已存在
            const [existingUser] = await db.query('SELECT * FROM User WHERE user_id = ?', [userId]);
            if (existingUser.length > 0) {
                return responseHandler(res, 400, false, '该学号已被注册');
            }

            // 密码加密
            const hashedPassword = await bcrypt.hash(password, 10);

            // 插入新管理员用户，type设置为1
            await db.query(
                'INSERT INTO User (user_id, password, name, college, contact, grade, type) VALUES (?, ?, ?, ?, ?, ?, 1)',
                [userId, hashedPassword, name, college, contact, grade]
            );

            responseHandler(res, 200, true, '管理员注册成功');
        } catch (error) {
            console.error('管理员注册错误:', error);
            responseHandler(res, 500, false, '注册失败，请稍后重试');
        }
    },

    // 用户登录
    login: async (req, res) => {
        try {
            const { userId, password } = req.body;

            // 查找用户
            const [users] = await db.query('SELECT * FROM User WHERE user_id = ?', [userId]);
            if (users.length === 0) {
                return responseHandler(res, 400, false, '用户不存在');
            }

            const user = users[0];

            // 验证密码
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return responseHandler(res, 400, false, '密码错误');
            }

            // 返回用户信息（不包含密码）
            const userInfo = {
                userId: user.user_id,
                name: user.name,
                college: user.college,
                contact: user.contact,
                grade: user.grade,
                type: user.type
            };

            responseHandler(res, 200, true, '登录成功', { user: userInfo });
        } catch (error) {
            console.error('登录错误:', error);
            responseHandler(res, 500, false, '登录失败，请稍后重试');
        }
    }
};

module.exports = userController; 