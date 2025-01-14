const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { responseHandler } = require('../utils/responseHandler');

const merchantController = {
    // 商家注册
    register: async (req, res) => {
        try {
            const { merchantNo, name, description, phone, dininghallNo, password } = req.body;

            // 检查商家是否已存在
            const [existingMerchant] = await db.query('SELECT * FROM Merchant WHERE merchant_no = ?', [merchantNo]);
            if (existingMerchant.length > 0) {
                return responseHandler(res, 400, false, '该商家编号已被注册');
            }

            // 检查食堂是否存在
            const [diningHall] = await db.query('SELECT * FROM DiningHall WHERE dininghall_no = ?', [dininghallNo]);
            if (diningHall.length === 0) {
                return responseHandler(res, 400, false, '所选食堂不存在');
            }

            // 密码加密
            const hashedPassword = await bcrypt.hash(password, 10);

            // 插入新商家
            await db.query(
                'INSERT INTO Merchant (merchant_no, name, description, phone, dininghall_no, password, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [merchantNo, name, description, phone, dininghallNo, hashedPassword, '待审核']
            );

            responseHandler(res, 200, true, '注册成功，等待审核');
        } catch (error) {
            console.error('注册错误:', error);
            responseHandler(res, 500, false, '注册失败，请稍后重试');
        }
    },

    // 商家登录
    login: async (req, res) => {
        try {
            const { merchantNo, password } = req.body;

            // 查找商家
            const [merchants] = await db.query('SELECT * FROM Merchant WHERE merchant_no = ?', [merchantNo]);
            if (merchants.length === 0) {
                return responseHandler(res, 400, false, '商家不存在');
            }

            const merchant = merchants[0];

            // 验证密码
            const isPasswordValid = await bcrypt.compare(password, merchant.password);
            if (!isPasswordValid) {
                return responseHandler(res, 400, false, '密码错误');
            }

            // 检查商家状态
            if (merchant.status === '待审核') {
                return responseHandler(res, 400, false, '您的账号正在审核中');
            } else if (merchant.status === '已拒绝') {
                return responseHandler(res, 400, false, '您的账号未通过审核');
            }

            // 返回商家信息（不包含密码）
            const merchantInfo = {
                merchantNo: merchant.merchant_no,
                name: merchant.name,
                description: merchant.description,
                phone: merchant.phone,
                dininghallNo: merchant.dininghall_no,
                status: merchant.status,
                likes: merchant.likes,
                hates: merchant.hates
            };

            responseHandler(res, 200, true, '登录成功', { merchant: merchantInfo });
        } catch (error) {
            console.error('登录错误:', error);
            responseHandler(res, 500, false, '登录失败，请稍后重试');
        }
    }
};

module.exports = merchantController; 