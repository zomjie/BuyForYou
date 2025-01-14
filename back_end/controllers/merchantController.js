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
    },

    // 获取待审核商家列表
    getPendingMerchants: async (req, res) => {
        try {
            const [merchants] = await db.query(
                'SELECT merchant_no as merchantNo, name, description, phone, dininghall_no as dininghallNo, status FROM Merchant WHERE status = ?',
                ['待审核']
            );

            responseHandler(res, 200, true, '获取成功', { merchants });
        } catch (error) {
            console.error('获取待审核商家失败:', error);
            responseHandler(res, 500, false, '获取待审核商家失败');
        }
    },

    // 审核商家
    auditMerchant: async (req, res) => {
        try {
            const { merchantNo } = req.params;
            const { status } = req.body;

            if (!['已通过', '已拒绝'].includes(status)) {
                return responseHandler(res, 400, false, '无效的审核状态');
            }

            const [merchant] = await db.query('SELECT * FROM Merchant WHERE merchant_no = ?', [merchantNo]);
            if (merchant.length === 0) {
                return responseHandler(res, 404, false, '商家不存在');
            }

            await db.query(
                'UPDATE Merchant SET status = ? WHERE merchant_no = ?',
                [status, merchantNo]
            );

            responseHandler(res, 200, true, '审核操作成功');
        } catch (error) {
            console.error('审核商家失败:', error);
            responseHandler(res, 500, false, '审核操作失败');
        }
    },

    // 更新商家信息
    updateMerchant: async (req, res) => {
        try {
            const { merchantNo } = req.params;
            const { name, phone, description, diningHallNo } = req.body;

            // 验证必填字段
            if (!name || !phone || !diningHallNo) {
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

            // 验证食堂是否存在
            const [diningHalls] = await db.query(
                'SELECT * FROM DiningHall WHERE dininghall_no = ?',
                [diningHallNo]
            );

            if (diningHalls.length === 0) {
                return responseHandler(res, 404, false, '所选食堂不存在');
            }

            // 更新商家信息
            const [result] = await db.query(
                'UPDATE Merchant SET name = ?, phone = ?, description = ?, dininghall_no = ? WHERE merchant_no = ?',
                [name, phone, description || '', diningHallNo, merchantNo]
            );

            if (result.affectedRows === 1) {
                // 获取更新后的商家信息
                const [updatedMerchant] = await db.query(
                    'SELECT * FROM Merchant WHERE merchant_no = ?',
                    [merchantNo]
                );

                responseHandler(res, 200, true, '修改成功', {
                    merchant: {
                        merchantNo: updatedMerchant[0].merchant_no,
                        name: updatedMerchant[0].name,
                        description: updatedMerchant[0].description,
                        phone: updatedMerchant[0].phone,
                        diningHallNo: updatedMerchant[0].dininghall_no,
                        status: updatedMerchant[0].status
                    }
                });
            } else {
                throw new Error('修改商家信息失败');
            }
        } catch (error) {
            console.error('修改商家信息错误:', error);
            responseHandler(res, 500, false, '修改商家信息失败，请稍后重试');
        }
    }
};

module.exports = merchantController; 