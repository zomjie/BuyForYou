const db = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key'; // 在实际应用中应该使用环境变量

class MerchantController {
  static async register(req, res) {
    try {
      const { merchant_no, name, password, description, phone, dininghall_no } = req.body;

      // 检查商家是否已存在
      const [existingMerchants] = await db.execute(
        'SELECT * FROM merchant WHERE merchant_no = ?',
        [merchant_no]
      );

      if (existingMerchants.length > 0) {
        return ResponseHandler.error(res, '该商家编号已被注册', 400);
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 插入新商家
      await db.execute(
        'INSERT INTO merchant (merchant_no, name, password, description, phone, dininghall_no, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [merchant_no, name, hashedPassword, description, phone, dininghall_no, '待审核']
      );

      // 获取新插入的商家信息
      const [merchants] = await db.execute(
        'SELECT * FROM merchant WHERE merchant_no = ?',
        [merchant_no]
      );
      
      const merchant = merchants[0];
      
      // 生成 token
      const token = jwt.sign(
        { merchant_no: merchant.merchant_no },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 返回商家信息（不包含密码）
      const merchantInfo = { ...merchant };
      delete merchantInfo.password;

      ResponseHandler.success(res, { token, merchantInfo }, '注册成功，等待审核');
    } catch (error) {
      console.error('Register error:', error);
      ResponseHandler.error(res, '注册失败');
    }
  }

  static async login(req, res) {
    try {
      const { merchant_no, password } = req.body;

      // 查找商家
      const [merchants] = await db.execute(
        'SELECT * FROM merchant WHERE merchant_no = ?',
        [merchant_no]
      );

      if (merchants.length === 0) {
        return ResponseHandler.error(res, '商家不存在', 400);
      }

      const merchant = merchants[0];

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, merchant.password);
      if (!isValidPassword) {
        return ResponseHandler.error(res, '密码错误', 400);
      }

      // 检查商家状态
      if (merchant.status !== '已通过') {
        return ResponseHandler.error(res, '商家账号待审核或已被拒绝', 400);
      }

      // 生成 token
      const token = jwt.sign(
        { merchant_no: merchant.merchant_no },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 返回商家信息（不包含密码）
      const merchantInfo = { ...merchant };
      delete merchantInfo.password;

      ResponseHandler.success(res, { token, merchantInfo }, '登录成功');
    } catch (error) {
      console.error('Login error:', error);
      ResponseHandler.error(res, '登录失败');
    }
  }
}

module.exports = MerchantController; 