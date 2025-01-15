<template>
	<view class="index">
		<!-- 食堂列表 -->
		<view class="dining-halls">
			<view v-for="hall in diningHalls" :key="hall.dininghallNo" class="dining-hall">
				<view class="hall-header">
					<text class="hall-name">{{hall.name}}</text>
					<text class="hall-position">{{hall.position}}</text>
				</view>
				
				<!-- 商家列表 -->
				<view class="merchants">
					<view v-for="merchant in hall.merchants" :key="merchant.merchantNo" class="merchant">
						<view class="merchant-info">
							<text class="merchant-name">{{merchant.name}}</text>
							<text class="merchant-desc">{{merchant.description}}</text>
							<view class="merchant-rating">
								<text class="likes">好评: {{merchant.likes}}</text>
								<text class="hates">差评: {{merchant.hates}}</text>
							</view>
						</view>

						<!-- 菜品列表 -->
						<view class="dishes">
							<view v-for="dish in merchant.dishes" :key="dish.dishNo" class="dish-card">
								<view class="dish-info">
									<view class="dish-header">
										<text class="dish-name">{{dish.name}}</text>
										<text class="dish-price">¥{{dish.price}}</text>
									</view>
									<text class="dish-desc">{{dish.description}}</text>
									<view class="dish-footer">
										<text class="stock">库存: {{dish.quantity}}</text>
										<button 
											class="order-btn" 
											:disabled="dish.quantity <= 0"
											@click="handleOrder(merchant, dish)"
										>
											{{dish.quantity > 0 ? '点餐' : '已售罄'}}
										</button>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 购物车 -->
		<view class="shopping-cart" v-if="cartItems.length > 0">
			<view class="cart-header">
				<view class="cart-info">
					<text class="cart-count">已选 {{totalQuantity}} 件</text>
					<text class="cart-total">合计: ¥{{totalPrice.toFixed(2)}}</text>
				</view>
				<button class="checkout-btn" @click="showCheckoutModal">去结算</button>
			</view>
			<scroll-view class="cart-items" scroll-y>
				<view v-for="(item, index) in cartItems" :key="index" class="cart-item">
					<view class="item-info">
						<text class="item-name">{{item.dishName}}</text>
						<text class="item-price">¥{{item.price}}</text>
					</view>
					<view class="item-quantity">
						<button class="minus" @click="decreaseCartItem(index)">-</button>
						<text class="quantity">{{item.quantity}}</text>
						<button class="plus" @click="increaseCartItem(index)">+</button>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 结算确认弹窗 -->
		<view v-if="showCheckoutConfirm" class="modal-mask">
			<view class="checkout-popup">
				<view class="popup-header">
					<text class="title">确认订单</text>
					<text class="close-btn" @click="closeCheckoutModal">×</text>
				</view>
				<view class="checkout-form">
					<view class="form-item">
						<text class="label">配送地址</text>
						<input 
							class="input" 
							v-model="checkoutForm.buyerPosition"
							placeholder="请输入配送地址（宿舍楼/教学楼/办公楼等）"
						/>
					</view>
					<view class="form-item">
						<text class="label">就餐时段</text>
						<picker 
							class="picker" 
							:value="categoryIndex"
							:range="categories"
							@change="handleCategoryChange"
						>
							<view class="picker-text">{{categories[categoryIndex]}}</view>
						</picker>
					</view>
					<view class="form-item">
						<text class="label">小费(元)</text>
						<input 
							class="input" 
							type="number" 
							v-model="checkoutForm.tips"
							placeholder="请输入小费金额（可选）"
						/>
					</view>
					<view class="order-summary">
						<view class="summary-item">
							<text class="label">商品总额</text>
							<text class="value">¥{{totalPrice.toFixed(2)}}</text>
						</view>
						<view class="summary-item">
							<text class="label">小费</text>
							<text class="value">¥{{Number(checkoutForm.tips || 0).toFixed(2)}}</text>
						</view>
						<view class="summary-item total">
							<text class="label">合计</text>
							<text class="value">¥{{(totalPrice + Number(checkoutForm.tips || 0)).toFixed(2)}}</text>
						</view>
					</view>
					<button class="submit-btn" @click="handleCheckout">提交订单</button>
				</view>
			</view>
		</view>

		<!-- 点餐弹窗 -->
		<view v-if="showOrderModal" class="modal-mask">
			<view class="order-popup">
				<view class="popup-header">
					<text class="title">确认点餐</text>
					<text class="close-btn" @click="closeOrderModal">×</text>
				</view>
				<view class="order-info">
					<text class="merchant-name">{{selectedMerchant?.name}}</text>
					<view class="dish-detail">
						<text class="dish-name">{{selectedDish?.name}}</text>
						<text class="dish-price">¥{{selectedDish?.price}}</text>
					</view>
					<view class="quantity-control">
						<text class="label">数量：</text>
						<view class="control-group">
							<button 
								class="minus" 
								:disabled="orderQuantity <= 1"
								@click="orderQuantity > 1 && orderQuantity--"
							>-</button>
							<text class="quantity">{{orderQuantity}}</text>
							<button 
								class="plus" 
								:disabled="orderQuantity >= selectedDish?.quantity"
								@click="orderQuantity < selectedDish?.quantity && orderQuantity++"
							>+</button>
						</view>
					</view>
					<view class="total">
						<text>总计：</text>
						<text class="price">¥{{(selectedDish?.price * orderQuantity).toFixed(2)}}</text>
					</view>
					<textarea 
						class="remark" 
						v-model="orderRemark" 
						placeholder="请输入备注信息（选填）"
					/>
					<button class="submit-btn" @click="submitOrder">提交订单</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				diningHalls: [],
				showOrderModal: false,
				selectedMerchant: null,
				selectedDish: null,
				orderQuantity: 1,
				orderRemark: '',
				baseUrl: 'http://localhost:3000/api',
				cartItems: [], // 购物车商品列表
				showCheckoutConfirm: false, // 结算确认弹窗
				categoryIndex: 1, // 默认选中午餐
				categories: ['早餐', '午餐', '晚餐'],
				checkoutForm: {
					buyerPosition: '',
					category: '午餐',
					tips: ''
				}
			}
		},

		computed: {
			totalQuantity() {
				return this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
			},
			totalPrice() {
				return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
			}
		},

		mounted() {
			this.fetchDiningHalls()
		},

		methods: {
			async fetchDiningHalls() {
				try {
					const result = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/dishes/grouped-by-dininghall`,
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
						this.diningHalls = data.data.diningHalls
					} else {
						throw new Error(data?.message || '获取食堂信息失败')
					}
				} catch (error) {
					console.error('获取食堂信息失败:', error)
					uni.showToast({
						title: '获取食堂信息失败',
						icon: 'none'
					})
				}
			},

			handleOrder(merchant, dish) {
				// 检查是否登录
				const userInfo = uni.getStorageSync('userInfo')
				if (!userInfo) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}

				// 将商品添加到购物车
				const existingItem = this.cartItems.find(item => item.dishNo === dish.dishNo)
				if (existingItem) {
					if (existingItem.quantity < dish.quantity) {
						existingItem.quantity++
					} else {
						uni.showToast({
							title: '库存不足',
							icon: 'none'
						})
					}
				} else {
					this.cartItems.push({
						dishNo: dish.dishNo,
						dishName: dish.name,
						price: dish.price,
						quantity: 1,
						merchantNo: merchant.merchantNo,
						merchantName: merchant.name,
						maxQuantity: dish.quantity
					})
				}

				uni.showToast({
					title: '已加入购物车',
					icon: 'success'
				})
			},

			decreaseCartItem(index) {
				if (this.cartItems[index].quantity > 1) {
					this.cartItems[index].quantity--
				} else {
					this.cartItems.splice(index, 1)
				}
			},

			increaseCartItem(index) {
				const item = this.cartItems[index]
				if (item.quantity < item.maxQuantity) {
					item.quantity++
				} else {
					uni.showToast({
						title: '库存不足',
						icon: 'none'
					})
				}
			},

			showCheckoutModal() {
				// 检查是否登录
				const userInfo = uni.getStorageSync('userInfo')
				if (!userInfo) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				this.showCheckoutConfirm = true
			},

			closeCheckoutModal() {
				this.showCheckoutConfirm = false
				this.checkoutForm = {
					buyerPosition: '',
					category: '午餐',
					tips: ''
				}
			},

			handleCategoryChange(e) {
				this.categoryIndex = e.detail.value
				this.checkoutForm.category = this.categories[this.categoryIndex]
			},

			async handleCheckout() {
				if (!this.checkoutForm.buyerPosition) {
					uni.showToast({
						title: '请输入配送地址',
						icon: 'none'
					})
					return
				}

				try {
					const userInfo = uni.getStorageSync('userInfo')
					if (!userInfo) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						})
						return
					}

					// 确保 userInfo 是对象
					const userInfoObj = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
					
					// 创建订单
					const result = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/order/batch`,
							method: 'POST',
							data: {
								userId: userInfoObj.userId,
								items: this.cartItems.map(item => ({
									dishNo: item.dishNo,
									quantity: item.quantity,
									remark: ''
								})),
								buyerPosition: this.checkoutForm.buyerPosition,
								category: this.checkoutForm.category,
								tips: Number(this.checkoutForm.tips || 0)
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
							title: '下单成功',
							icon: 'success'
						})
						// 清空购物车
						this.cartItems = []
						// 关闭结算弹窗
						this.closeCheckoutModal()
						// 刷新食堂信息
						this.fetchDiningHalls()
					} else {
						throw new Error(data?.message || '下单失败')
					}
				} catch (error) {
					console.error('下单失败:', error)
					uni.showToast({
						title: error.message || '下单失败，请稍后重试',
						icon: 'none'
					})
				}
			},

			closeOrderModal() {
				this.showOrderModal = false
				this.selectedMerchant = null
				this.selectedDish = null
				this.orderQuantity = 1
				this.orderRemark = ''
			},

			async submitOrder() {
				try {
					const userInfoStr = uni.getStorageSync('userInfo')
					if (!userInfoStr) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						})
						return
					}

					const userInfo = JSON.parse(userInfoStr)
					const result = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/order`,
							method: 'POST',
							data: {
								userId: userInfo.userId,
								merchantNo: this.selectedMerchant.merchantNo,
								dishNo: this.selectedDish.dishNo,
								quantity: this.orderQuantity,
								remark: this.orderRemark
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
							title: '下单成功',
							icon: 'success'
						})
						this.closeOrderModal()
						// 刷新食堂信息
						this.fetchDiningHalls()
					} else {
						throw new Error(data?.message || '下单失败')
					}
				} catch (error) {
					console.error('下单失败:', error)
					uni.showToast({
						title: error.message || '下单失败，请稍后重试',
						icon: 'none'
					})
				}
			}
		}
	}
</script>

<style lang="scss">
.index {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 20rpx;
	padding-bottom: calc(120rpx + var(--window-bottom));

	.dining-halls {
		.dining-hall {
			background-color: #fff;
			border-radius: 12rpx;
			margin-bottom: 20rpx;
			overflow: hidden;

			.hall-header {
				padding: 20rpx;
				background-color: #ff9800;
				display: flex;
				justify-content: space-between;
				align-items: center;

				.hall-name {
					font-size: 32rpx;
					font-weight: bold;
					color: #fff;
				}

				.hall-position {
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.8);
				}
			}

			.merchants {
				.merchant {
					padding: 20rpx;
					border-bottom: 1rpx solid #f0f0f0;

					&:last-child {
						border-bottom: none;
					}

					.merchant-info {
						margin-bottom: 20rpx;

						.merchant-name {
							font-size: 30rpx;
							font-weight: bold;
							color: #333;
							margin-bottom: 8rpx;
						}

						.merchant-desc {
							font-size: 24rpx;
							color: #666;
							margin-bottom: 8rpx;
						}

						.merchant-rating {
							font-size: 24rpx;

							.likes {
								color: #52c41a;
								margin-right: 20rpx;
							}

							.hates {
								color: #ff4d4f;
							}
						}
					}

					.dishes {
						.dish-card {
							background-color: #f9f9f9;
							border-radius: 8rpx;
							padding: 16rpx;
							margin-bottom: 16rpx;

							&:last-child {
								margin-bottom: 0;
							}

							.dish-info {
								.dish-header {
									display: flex;
									justify-content: space-between;
									align-items: center;
									margin-bottom: 8rpx;

									.dish-name {
										font-size: 28rpx;
										font-weight: bold;
										color: #333;
									}

									.dish-price {
										font-size: 28rpx;
										color: #ff4d4f;
										font-weight: bold;
									}
								}

								.dish-desc {
									font-size: 24rpx;
									color: #666;
									margin-bottom: 12rpx;
								}

								.dish-footer {
									display: flex;
									justify-content: space-between;
									align-items: center;

									.stock {
										font-size: 24rpx;
										color: #999;
									}

									.order-btn {
										font-size: 24rpx;
										padding: 8rpx 24rpx;
										background-color: #ff9800;
										color: #fff;
										border-radius: 30rpx;

										&:disabled {
											background-color: #ccc;
										}
									}
								}
							}
						}
					}
				}
			}
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

	.order-popup {
		width: 600rpx;
		background-color: #fff;
		border-radius: 12rpx;
		overflow: hidden;

		.popup-header {
			padding: 20rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1rpx solid #f0f0f0;

			.title {
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

		.order-info {
			padding: 20rpx;

			.merchant-name {
				font-size: 28rpx;
				color: #666;
				margin-bottom: 16rpx;
			}

			.dish-detail {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;

				.dish-name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}

				.dish-price {
					font-size: 32rpx;
					color: #ff4d4f;
					font-weight: bold;
				}
			}

			.quantity-control {
				display: flex;
				align-items: center;
				margin-bottom: 20rpx;

				.label {
					font-size: 28rpx;
					color: #666;
					margin-right: 20rpx;
				}

				.control-group {
					display: flex;
					align-items: center;

					button {
						width: 60rpx;
						height: 60rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 32rpx;
						background-color: #f5f5f5;
						border: none;
						border-radius: 30rpx;

						&:disabled {
							opacity: 0.5;
						}
					}

					.quantity {
						width: 80rpx;
						text-align: center;
						font-size: 28rpx;
					}
				}
			}

			.total {
				display: flex;
				justify-content: flex-end;
				align-items: center;
				margin-bottom: 20rpx;
				font-size: 28rpx;

				.price {
					font-size: 36rpx;
					color: #ff4d4f;
					font-weight: bold;
					margin-left: 12rpx;
				}
			}

			.remark {
				width: 100%;
				height: 160rpx;
				border: 1rpx solid #ddd;
				border-radius: 8rpx;
				padding: 20rpx;
				font-size: 28rpx;
				margin-bottom: 20rpx;
			}

			.submit-btn {
				width: 100%;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				background-color: #ff9800;
				color: #fff;
				border-radius: 8rpx;
				font-size: 28rpx;
			}
		}
	}

	.shopping-cart {
		position: fixed;
		bottom: var(--window-bottom);
		left: 0;
		right: 0;
		background-color: #fff;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
		z-index: 99;
		max-height: 60vh;

		.cart-header {
			padding: 20rpx;
			border-bottom: 1rpx solid #f0f0f0;
			background-color: #fff;
			position: sticky;
			top: 0;
			z-index: 1;

			.cart-info {
				.cart-count {
					font-size: 28rpx;
					color: #666;
					margin-right: 20rpx;
				}

				.cart-total {
					font-size: 32rpx;
					color: #ff4d4f;
					font-weight: bold;
				}
			}

			.checkout-btn {
				background-color: #ff9800;
				color: #fff;
				font-size: 28rpx;
				padding: 10rpx 40rpx;
				border-radius: 30rpx;
			}
		}

		.cart-items {
			max-height: calc(60vh - 120rpx);
			padding: 20rpx;
			overflow-y: auto;
			-webkit-overflow-scrolling: touch;

			.cart-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.item-info {
					flex: 1;

					.item-name {
						font-size: 28rpx;
						color: #333;
						margin-bottom: 4rpx;
					}

					.item-price {
						font-size: 28rpx;
						color: #ff4d4f;
						font-weight: bold;
					}
				}

				.item-quantity {
					display: flex;
					align-items: center;

					button {
						width: 50rpx;
						height: 50rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 28rpx;
						background-color: #f5f5f5;
						border: none;
						border-radius: 25rpx;

						&:disabled {
							opacity: 0.5;
						}
					}

					.quantity {
						width: 60rpx;
						text-align: center;
						font-size: 28rpx;
					}
				}
			}
		}
	}

	.checkout-popup {
		width: 600rpx;
		background-color: #fff;
		border-radius: 12rpx;
		overflow: hidden;

		.popup-header {
			padding: 20rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1rpx solid #f0f0f0;

			.title {
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

		.checkout-form {
			padding: 20rpx;

			.form-item {
				margin-bottom: 20rpx;

				.label {
					display: block;
					font-size: 28rpx;
					color: #666;
					margin-bottom: 8rpx;
				}

				.input {
					width: 100%;
					height: 80rpx;
					border: 1rpx solid #ddd;
					border-radius: 8rpx;
					padding: 0 20rpx;
					font-size: 28rpx;
				}

				.picker {
					width: 100%;
					height: 80rpx;
					border: 1rpx solid #ddd;
					border-radius: 8rpx;
					padding: 0 20rpx;
					display: flex;
					align-items: center;

					.picker-text {
						font-size: 28rpx;
						color: #333;
					}
				}
			}

			.order-summary {
				margin: 30rpx 0;
				padding-top: 20rpx;
				border-top: 1rpx solid #f0f0f0;

				.summary-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 16rpx;

					.label {
						font-size: 28rpx;
						color: #666;
					}

					.value {
						font-size: 28rpx;
						color: #333;
					}

					&.total {
						margin-top: 20rpx;
						padding-top: 20rpx;
						border-top: 1rpx solid #f0f0f0;

						.label {
							font-size: 32rpx;
							font-weight: bold;
							color: #333;
						}

						.value {
							font-size: 36rpx;
							color: #ff4d4f;
							font-weight: bold;
						}
					}
				}
			}

			.submit-btn {
				width: 100%;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				background-color: #ff9800;
				color: #fff;
				border-radius: 8rpx;
				font-size: 28rpx;
			}
		}
	}
}
</style>
