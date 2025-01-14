const db = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key'; // 在实际应用中应该使用环境变量

class UserController {
  static async register(req, res) {
    try {
      const { user_id, password, name, college, contact, grade } = req.body;

      // 检查用户是否已存在
      const [existingUsers] = await db.execute(
        'SELECT * FROM user WHERE user_id = ?',
        [user_id]
      );

      if (existingUsers.length > 0) {
        return ResponseHandler.error(res, '该学号已被注册', 400);
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 插入新用户
      await db.execute(
        'INSERT INTO user (user_id, password, name, college, contact, grade, type) VALUES (?, ?, ?, ?, ?, ?, 0)',
        [user_id, hashedPassword, name, college, contact, grade]
      );

      // 获取新插入的用户信息
      const [users] = await db.execute(
        'SELECT * FROM user WHERE user_id = ?',
        [user_id]
      );
      
      const user = users[0];
      
      // 生成 token
      const token = jwt.sign(
        { user_id: user.user_id, type: user.type },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 返回用户信息（不包含密码）
      const userInfo = { ...user };
      delete userInfo.password;

      ResponseHandler.success(res, { token, userInfo }, '注册成功');
    } catch (error) {
      console.error('Register error:', error);
      ResponseHandler.error(res, '注册失败');
    }
  }

  static async login(req, res) {
    try {
      const { user_id, password } = req.body;

      // 查找用户
      const [users] = await db.execute(
        'SELECT * FROM user WHERE user_id = ?',
        [user_id]
      );

      if (users.length === 0) {
        return ResponseHandler.error(res, '用户不存在', 400);
      }

      const user = users[0];

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return ResponseHandler.error(res, '密码错误', 400);
      }

      // 生成 token
      const token = jwt.sign(
        { user_id: user.user_id, type: user.type },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 返回用户信息（不包含密码）
      const userInfo = { ...user };
      delete userInfo.password;

      ResponseHandler.success(res, { token, userInfo }, '登录成功');
    } catch (error) {
      console.error('Login error:', error);
      ResponseHandler.error(res, '登录失败');
    }
  }
}

module.exports = UserController; 