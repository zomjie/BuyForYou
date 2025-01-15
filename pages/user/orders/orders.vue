<template>
	<view class="orders-page">
		<view class="order-list">
			<view v-if="orders.length === 0" class="empty-state">
				<text>暂无订单</text>
			</view>
			<view v-else v-for="order in orders" :key="order.orderId" class="order-card">
				<view class="order-header">
					<text class="order-id">订单号：{{order.orderId}}</text>
					<text class="order-time">{{formatTime(order.orderTime)}}</text>
				</view>
				<view class="order-content">
					<view class="delivery-info">
						<text class="label">配送地址：</text>
						<text class="value">{{order.buyerPosition}}</text>
					</view>
					<view class="category-info">
						<text class="label">就餐时段：</text>
						<text class="value">{{order.category}}</text>
					</view>
					<view class="items-list">
						<view v-for="(item, index) in order.items" :key="index" class="item">
							<view class="item-main">
								<text class="dish-name">{{item.dishName}}</text>
								<text class="quantity">x{{item.quantity}}</text>
							</view>
							<view class="item-sub">
								<text class="price">¥{{item.price}}</text>
								<text v-if="item.note" class="note">备注：{{item.note}}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="order-footer">
					<view class="status-group">
						<text class="payment-status" :class="order.paymentStatus">
							{{order.paymentStatus}}
						</text>
						<text v-if="order.deliveryStatus" class="delivery-status" :class="order.deliveryStatus">
							{{order.deliveryStatus}}
						</text>
					</view>
					<view class="action-group">
						<text class="total-amount">总计：¥{{order.totalAmount}}</text>
						<button 
							v-if="order.paymentStatus === '未支付'" 
							class="pay-btn" 
							@click="handlePay(order.orderId)"
						>立即支付</button>
						<button 
							v-if="order.deliveryStatus === '已送达'" 
							class="complaint-btn" 
							@click="showComplaintModal(order.orderId)"
						>投诉</button>
					</view>
				</view>
			</view>
		</view>

		<!-- 投诉弹窗 -->
		<view v-if="showComplaint" class="modal-mask">
			<view class="complaint-modal">
				<view class="modal-header">
					<text class="modal-title">提交投诉</text>
					<text class="close-btn" @click="hideComplaintModal">×</text>
				</view>
				<view class="modal-content">
					<view class="form-item">
						<text class="label">投诉类型</text>
						<picker 
							class="picker" 
							:value="complaintTypeIndex" 
							:range="complaintTypes"
							@change="onComplaintTypeChange"
						>
							<view class="picker-value">
								{{complaintForm.complaint_type || '请选择投诉类型'}}
							</view>
						</picker>
					</view>
					<view class="form-item">
						<text class="label">投诉原因</text>
						<textarea 
							class="textarea" 
							v-model="complaintForm.reason"
							placeholder="请详细描述您的投诉原因"
						></textarea>
					</view>
					<view class="form-item">
						<text class="label">证据说明（选填）</text>
						<textarea 
							class="textarea" 
							v-model="complaintForm.evidence"
							placeholder="请提供相关证据说明"
						></textarea>
					</view>
				</view>
				<view class="modal-footer">
					<button class="cancel-btn" @click="hideComplaintModal">取消</button>
					<button class="submit-btn" @click="submitComplaint">提交</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orders: [],
				baseUrl: 'http://localhost:3000/api',
				userId: '',
				showComplaint: false,
				complaintTypes: ['配送延迟', '态度恶劣', '商品损坏', '未按要求配送', '其他'],
				complaintTypeIndex: 0,
				complaintForm: {
					order_id: null,
					complainant_id: '',
					complaint_type: '',
					reason: '',
					evidence: ''
				}
			}
		},
		
		onLoad(options) {
			if (options.userId) {
				this.userId = options.userId
				this.complaintForm.complainant_id = options.userId
				this.fetchOrders()
			}
		},
		
		methods: {
			async fetchOrders() {
				try {
					const result = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/order/user/${this.userId}`,
							method: 'GET',
							success: (res) => {
								resolve(res)
							},
							fail: (err) => {
								reject(err)
							}
						})
					})
					
					const data = result.data
					if (data && data.success) {
						this.orders = data.data
					} else {
						throw new Error(data?.message || '获取订单列表失败')
					}
				} catch (error) {
					console.error('获取订单列表失败:', error)
					uni.showToast({
						title: '获取订单列表失败',
						icon: 'none'
					})
				}
			},
			
			formatTime(timeStr) {
				const date = new Date(timeStr)
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
			},
			
			async handlePay(orderId) {
				try {
					const result = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/order/pay`,
							method: 'POST',
							data: {
								order_id: orderId
							},
							success: (res) => {
								resolve(res)
							},
							fail: (err) => {
								reject(err)
							}
						})
					})
					
					const data = result.data
					if (data && data.success) {
						uni.showToast({
							title: '支付成功',
							icon: 'success'
						})
						// 刷新订单列表
						this.fetchOrders()
					} else {
						throw new Error(data?.message || '支付失败')
					}
				} catch (error) {
					console.error('支付失败:', error)
					uni.showToast({
						title: error.message || '支付失败',
						icon: 'none'
					})
				}
			},

			showComplaintModal(orderId) {
				this.complaintForm.order_id = orderId
				this.showComplaint = true
			},

			hideComplaintModal() {
				this.showComplaint = false
				this.resetComplaintForm()
			},

			resetComplaintForm() {
				this.complaintForm = {
					order_id: null,
					complainant_id: this.userId,
					complaint_type: '',
					reason: '',
					evidence: ''
				}
				this.complaintTypeIndex = 0
			},

			onComplaintTypeChange(e) {
				const index = e.detail.value
				this.complaintTypeIndex = index
				this.complaintForm.complaint_type = this.complaintTypes[index]
			},

			async submitComplaint() {
				if (!this.complaintForm.complaint_type || !this.complaintForm.reason) {
					uni.showToast({
						title: '请填写投诉类型和原因',
						icon: 'none'
					})
					return
				}

				try {
					const result = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/order/complaint`,
							method: 'POST',
							data: this.complaintForm,
							success: (res) => {
								resolve(res)
							},
							fail: (err) => {
								reject(err)
							}
						})
					})

					const data = result.data
					if (data && data.success) {
						uni.showToast({
							title: '投诉提交成功',
							icon: 'success'
						})
						this.hideComplaintModal()
					} else {
						throw new Error(data?.message || '投诉提交失败')
					}
				} catch (error) {
					console.error('投诉提交失败:', error)
					uni.showToast({
						title: error.message || '投诉提交失败',
						icon: 'none'
					})
				}
			}
		}
	}
</script>

<style lang="scss">
.orders-page {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 20rpx;
	
	.order-list {
		.empty-state {
			text-align: center;
			padding: 40rpx;
			color: #999;
			font-size: 28rpx;
		}
		
		.order-card {
			background-color: #fff;
			border-radius: 12rpx;
			margin-bottom: 20rpx;
			padding: 20rpx;
			
			.order-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-bottom: 20rpx;
				border-bottom: 1rpx solid #f0f0f0;
				
				.order-id {
					font-size: 28rpx;
					color: #333;
					font-weight: bold;
				}
				
				.order-time {
					font-size: 24rpx;
					color: #999;
				}
			}
			
			.order-content {
				padding: 20rpx 0;
				
				.delivery-info,
				.category-info {
					margin-bottom: 16rpx;
					font-size: 28rpx;
					
					.label {
						color: #666;
					}
					
					.value {
						color: #333;
					}
				}
				
				.items-list {
					.item {
						margin-bottom: 16rpx;
						
						.item-main {
							display: flex;
							justify-content: space-between;
							align-items: center;
							margin-bottom: 4rpx;
							
							.dish-name {
								font-size: 28rpx;
								color: #333;
								flex: 1;
							}
							
							.quantity {
								font-size: 28rpx;
								color: #666;
								margin-left: 20rpx;
							}
						}
						
						.item-sub {
							display: flex;
							align-items: center;
							
							.price {
								font-size: 26rpx;
								color: #ff4d4f;
								margin-right: 20rpx;
							}
							
							.note {
								font-size: 24rpx;
								color: #999;
							}
						}
					}
				}
			}
			
			.order-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-top: 20rpx;
				border-top: 1rpx solid #f0f0f0;
				
				.status-group {
					display: flex;
					gap: 20rpx;
					
					.payment-status,
					.delivery-status {
						font-size: 24rpx;
						padding: 4rpx 12rpx;
						border-radius: 4rpx;
						
						&.未支付 {
							color: #ff4d4f;
							background-color: #fff1f0;
						}
						
						&.已支付 {
							color: #52c41a;
							background-color: #f6ffed;
						}
						
						&.配送中 {
							color: #1890ff;
							background-color: #e6f7ff;
						}
						
						&.已送达 {
							color: #52c41a;
							background-color: #f6ffed;
						}
					}
				}
				
				.action-group {
					display: flex;
					align-items: center;
					gap: 20rpx;
					
					.total-amount {
						font-size: 28rpx;
						color: #ff4d4f;
						font-weight: bold;
					}
					
					.pay-btn {
						font-size: 24rpx;
						padding: 8rpx 24rpx;
						background-color: #ff4d4f;
						color: #fff;
						border-radius: 4rpx;
						border: none;
						line-height: 1.5;
						
						&:active {
							opacity: 0.8;
						}
					}
				}
			}
		}
	}

	.complaint-btn {
		font-size: 24rpx;
		padding: 8rpx 24rpx;
		background-color: #ff6b6b;
		color: #fff;
		border-radius: 4rpx;
		border: none;
		line-height: 1.5;
		margin-left: 20rpx;
		
		&:active {
			opacity: 0.8;
		}
	}

	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
	}

	.complaint-modal {
		width: 80%;
		background: #fff;
		border-radius: 12rpx;
		overflow: hidden;

		.modal-header {
			padding: 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1rpx solid #eee;

			.modal-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}

			.close-btn {
				font-size: 40rpx;
				color: #999;
				padding: 10rpx;
			}
		}

		.modal-content {
			padding: 30rpx;

			.form-item {
				margin-bottom: 20rpx;

				.label {
					display: block;
					font-size: 28rpx;
					color: #666;
					margin-bottom: 10rpx;
				}

				.picker {
					height: 80rpx;
					border: 1rpx solid #ddd;
					border-radius: 8rpx;
					padding: 0 20rpx;
					background-color: #fff;

					.picker-value {
						line-height: 80rpx;
						font-size: 28rpx;
						color: #333;
					}
				}

				.textarea {
					width: 100%;
					height: 160rpx;
					border: 1rpx solid #ddd;
					border-radius: 8rpx;
					padding: 20rpx;
					font-size: 28rpx;
				}
			}
		}

		.modal-footer {
			padding: 20rpx 30rpx;
			display: flex;
			justify-content: flex-end;
			gap: 20rpx;
			border-top: 1rpx solid #eee;

			button {
				min-width: 160rpx;
				height: 64rpx;
				line-height: 64rpx;
				text-align: center;
				border-radius: 32rpx;
				font-size: 28rpx;
				
				&.cancel-btn {
					background-color: #f5f5f5;
					color: #666;
				}
				
				&.submit-btn {
					background-color: #ff6b6b;
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