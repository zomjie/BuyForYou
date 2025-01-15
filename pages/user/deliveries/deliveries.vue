<template>
	<view class="deliveries-page">
		<view class="order-list">
			<view v-if="orders.length === 0" class="empty-state">
				<text>暂无配送记录</text>
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
						<text class="delivery-status" :class="order.deliveryStatus">
							{{order.deliveryStatus}}
						</text>
					</view>
					<view class="action-group">
						<text class="tips" v-if="order.tips > 0">小费：¥{{order.tips}}</text>
						<text class="total-amount">总计：¥{{order.totalAmount}}</text>
						<button 
							v-if="order.deliveryStatus === '配送中'"
							class="complete-btn" 
							@click="handleCompleteDelivery(order.orderId)"
						>完成配送</button>
					</view>
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
				userId: ''
			}
		},
		
		onLoad(options) {
			if (options.userId) {
				this.userId = options.userId
				this.fetchOrders()
			}
		},
		
		methods: {
			async fetchOrders() {
				try {
					const result = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/order/delivery/${this.userId}`,
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
						throw new Error(data?.message || '获取配送记录失败')
					}
				} catch (error) {
					console.error('获取配送记录失败:', error)
					uni.showToast({
						title: '获取配送记录失败',
						icon: 'none'
					})
				}
			},
			
			formatTime(timeStr) {
				const date = new Date(timeStr)
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
			},
			
			async handleCompleteDelivery(orderId) {
				try {
					const result = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/order/complete-delivery`,
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
							title: '配送完成',
							icon: 'success'
						})
						// 刷新订单列表
						this.fetchOrders()
					} else {
						throw new Error(data?.message || '完成配送失败')
					}
				} catch (error) {
					console.error('完成配送失败:', error)
					uni.showToast({
						title: error.message || '完成配送失败',
						icon: 'none'
					})
				}
			}
		}
	}
</script>

<style lang="scss">
.deliveries-page {
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
					
					.tips {
						font-size: 28rpx;
						color: #ff4d4f;
						font-weight: bold;
					}
					
					.total-amount {
						font-size: 28rpx;
						color: #ff4d4f;
						font-weight: bold;
					}

					.complete-btn {
						font-size: 22rpx;
						padding: 4rpx 16rpx;
						background-color: #1890ff;
						color: #fff;
						border-radius: 4rpx;
						border: none;
						margin-left: 20rpx;
						line-height: 1.5;
						min-height: auto;

						&:active {
							opacity: 0.8;
						}
					}
				}
			}
		}
	}
}
</style> 