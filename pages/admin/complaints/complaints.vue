<template>
	<view class="complaints-container">
		<view class="header">
			<text class="title">投诉管理</text>
		</view>

		<view v-if="loading" class="loading">
			<text>加载中...</text>
		</view>

		<view v-else-if="complaints.length === 0" class="empty-state">
			<text>暂无未处理的投诉</text>
		</view>

		<view v-else class="complaints-list">
			<view v-for="complaint in complaints" :key="complaint.complaintId" class="complaint-card">
				<view class="complaint-header">
					<text class="order-time">订单时间：{{formatDate(complaint.orderTime)}}</text>
					<text class="status status-pending">{{complaint.status}}</text>
				</view>
				<view class="complaint-content">
					<view class="info-row">
						<text class="label">订单编号：</text>
						<text>{{complaint.orderId}}</text>
					</view>
					<view class="info-row">
						<text class="label">投诉人：</text>
						<text>{{complaint.complainantName}} (ID: {{complaint.complainantId}})</text>
					</view>
					<view class="info-row">
						<text class="label">联系方式：</text>
						<text>{{complaint.complainantContact}}</text>
					</view>
					<view class="info-row">
						<text class="label">下单者：</text>
						<text>{{complaint.buyerName}} (ID: {{complaint.buyerId}})</text>
						<button class="blacklist-btn" @click="handleAddToBlacklist(complaint.buyerId, '下单者违规')">加入黑名单</button>
					</view>
					<view class="info-row" v-if="complaint.delivererId">
						<text class="label">配送者：</text>
						<text>{{complaint.delivererName}} (ID: {{complaint.delivererId}})</text>
						<button class="blacklist-btn" @click="handleAddToBlacklist(complaint.delivererId, '配送者违规')">加入黑名单</button>
					</view>
					<view class="info-row">
						<text class="label">订单类型：</text>
						<text>{{complaint.category}}</text>
					</view>
					<view class="info-row">
						<text class="label">配送地址：</text>
						<text>{{complaint.buyerPosition}}</text>
					</view>
					<view class="info-row">
						<text class="label">投诉类型：</text>
						<text>{{complaint.complaintType}}</text>
					</view>
					<view class="info-row">
						<text class="label">投诉原因：</text>
						<text>{{complaint.reason}}</text>
					</view>
					<view class="info-row" v-if="complaint.evidence">
						<text class="label">证据说明：</text>
						<text>{{complaint.evidence}}</text>
					</view>
					<view class="info-row">
						<text class="label">投诉时间：</text>
						<text>{{formatDate(complaint.createdAt)}}</text>
					</view>
				</view>
				<view class="complaint-actions">
					<button class="action-btn approve" @click="handleComplaint(complaint.complaintId, '已处理')">处理</button>
					<button class="action-btn reject" @click="handleComplaint(complaint.complaintId, '已驳回')">驳回</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				complaints: [],
				loading: true,
				baseUrl: 'http://localhost:3000/api',
				userInfo: null
			}
		},

		onLoad() {
			this.loadComplaints()
			// 获取管理员信息
			const userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				// 检查 userInfo 是否已经是对象
				this.userInfo = typeof userInfo === 'object' ? userInfo : JSON.parse(userInfo)
			}
		},

		onPullDownRefresh() {
			this.loadComplaints()
		},

		methods: {
			async loadComplaints() {
				this.loading = true
				try {
					const response = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/order/pending-complaints`,
							method: 'GET',
							success: res => resolve(res),
							fail: err => reject(err)
						})
					})

					if (response.data.success) {
						this.complaints = response.data.data
					} else {
						uni.showToast({
							title: response.data.message || '获取投诉记录失败',
							icon: 'none'
						})
					}
				} catch (error) {
					uni.showToast({
						title: '获取投诉记录失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
					uni.stopPullDownRefresh()
				}
			},

			async handleComplaint(complaintId, status) {
				try {
					const response = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/order/complaint/${complaintId}/handle`,
							method: 'POST',
							data: { status },
							success: res => resolve(res),
							fail: err => reject(err)
						})
					})

					if (response.data.success) {
						uni.showToast({
							title: '处理成功',
							icon: 'success'
						})
						// 刷新投诉列表
						this.loadComplaints()
					} else {
						uni.showToast({
							title: response.data.message || '处理失败',
							icon: 'none'
						})
					}
				} catch (error) {
					uni.showToast({
						title: '处理失败',
						icon: 'none'
					})
				}
			},

			async handleAddToBlacklist(userId, reason) {
				if (!this.userInfo) {
					uni.showToast({
						title: '管理员信息获取失败',
						icon: 'none'
					})
					return
				}

				try {
					const response = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/blacklist/add`,
							method: 'POST',
							data: {
								user_id: userId,
								reason: reason,
								created_by: this.userInfo.userId
							},
							success: res => resolve(res),
							fail: err => reject(err)
						})
					})

					if (response.data.success) {
						uni.showToast({
							title: '已加入黑名单',
							icon: 'success'
						})
					} else {
						uni.showToast({
							title: response.data.message || '加入黑名单失败',
							icon: 'none'
						})
					}
				} catch (error) {
					uni.showToast({
						title: '加入黑名单失败',
						icon: 'none'
					})
				}
			},

			formatDate(dateStr) {
				if (!dateStr) return ''
				const date = new Date(dateStr)
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
			}
		}
	}
</script>

<style lang="scss">
	.complaints-container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding: 20rpx;

		.header {
			background-color: #fff;
			padding: 20rpx;
			margin-bottom: 20rpx;
			border-radius: 12rpx;

			.title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
		}

		.loading {
			text-align: center;
			padding: 40rpx;
			color: #999;
			font-size: 28rpx;
		}

		.empty-state {
			text-align: center;
			padding: 100rpx 0;
			color: #999;
			font-size: 28rpx;
		}

		.complaint-card {
			background-color: #fff;
			border-radius: 12rpx;
			padding: 20rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);

			.complaint-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-bottom: 20rpx;
				border-bottom: 1rpx solid #eee;

				.order-time {
					font-size: 28rpx;
					color: #666;
				}

				.status {
					font-size: 24rpx;
					padding: 4rpx 16rpx;
					border-radius: 8rpx;

					&.status-pending {
						background-color: #fff7e6;
						color: #fa8c16;
					}
				}
			}

			.complaint-content {
				padding: 20rpx 0;

				.info-row {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;
					font-size: 28rpx;
					line-height: 1.5;

					.label {
						color: #666;
						width: 160rpx;
						flex-shrink: 0;
					}

					.blacklist-btn {
						margin-left: 20rpx;
						font-size: 24rpx;
						padding: 4rpx 16rpx;
						background-color: #ff4d4f;
						color: #fff;
						border-radius: 4rpx;
						border: none;

						&:active {
							opacity: 0.8;
						}
					}
				}
			}

			.complaint-actions {
				display: flex;
				justify-content: flex-end;
				padding-top: 20rpx;
				border-top: 1rpx solid #eee;

				.action-btn {
					margin-left: 20rpx;
					font-size: 28rpx;
					padding: 10rpx 30rpx;
					border-radius: 8rpx;
					border: none;

					&.approve {
						background-color: #52c41a;
						color: #fff;
					}

					&.reject {
						background-color: #ff4d4f;
						color: #fff;
					}

					&:active {
						opacity: 0.8;
					}
				}
			}
		}
	}
</style>

