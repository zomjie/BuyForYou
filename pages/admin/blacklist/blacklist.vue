<template>
	<view class="blacklist-container">
		<view class="header">
			<text class="title">黑名单管理</text>
		</view>

		<view v-if="loading" class="loading">
			<text>加载中...</text>
		</view>

		<view v-else-if="blacklist.length === 0" class="empty-state">
			<text>暂无黑名单记录</text>
		</view>

		<view v-else class="blacklist-list">
			<view v-for="record in blacklist" :key="record.blacklist_id" class="blacklist-card">
				<view class="user-info">
					<view class="info-row">
						<text class="label">用户ID：</text>
						<text>{{record.user.user_id}}</text>
					</view>
					<view class="info-row">
						<text class="label">姓名：</text>
						<text>{{record.user.name}}</text>
					</view>
					<view class="info-row">
						<text class="label">学院：</text>
						<text>{{record.user.college}}</text>
					</view>
					<view class="info-row">
						<text class="label">年级：</text>
						<text>{{record.user.grade}}</text>
					</view>
					<view class="info-row">
						<text class="label">联系方式：</text>
						<text>{{record.user.contact}}</text>
					</view>
				</view>

				<view class="blacklist-info">
					<view class="info-row">
						<text class="label">加入原因：</text>
						<text>{{record.reason}}</text>
					</view>
					<view class="info-row">
						<text class="label">操作管理员：</text>
						<text>{{record.created_by.name}}</text>
					</view>
					<view class="info-row">
						<text class="label">加入时间：</text>
						<text>{{formatDate(record.created_at)}}</text>
					</view>
				</view>

				<view class="actions">
					<button class="remove-btn" @click="handleRemove(record.blacklist_id)">解除黑名单</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				blacklist: [],
				loading: true,
				baseUrl: 'http://38.55.235.56:3000/api'
			}
		},

		onLoad() {
			this.loadBlacklist()
		},

		onPullDownRefresh() {
			this.loadBlacklist()
		},

		methods: {
			async loadBlacklist() {
				this.loading = true
				try {
					const response = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/blacklist/active`,
							method: 'GET',
							success: res => resolve(res),
							fail: err => reject(err)
						});
					});

					if (response.data.success) {
						this.blacklist = response.data.data
					} else {
						uni.showToast({
							title: response.data.message || '获取黑名单记录失败',
							icon: 'none'
						})
					}
				} catch (error) {
					uni.showToast({
						title: '获取黑名单记录失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
					uni.stopPullDownRefresh()
				}
			},

			async handleRemove(blacklistId) {
				try {
					const response = await new Promise((resolve, reject) => {
						uni.request({
							url: `${this.baseUrl}/blacklist/${blacklistId}/remove`,
							method: 'POST',
							success: res => resolve(res),
							fail: err => reject(err)
						});
					});

					if (response.data.success) {
						uni.showToast({
							title: '解除成功',
							icon: 'success'
						})
						// 刷新列表
						this.loadBlacklist()
					} else {
						uni.showToast({
							title: response.data.message || '解除失败',
							icon: 'none'
						})
					}
				} catch (error) {
					uni.showToast({
						title: '解除失败',
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
	.blacklist-container {
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

		.blacklist-card {
			background-color: #fff;
			border-radius: 12rpx;
			padding: 20rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);

			.user-info, .blacklist-info {
				padding: 20rpx 0;
				border-bottom: 1rpx solid #eee;

				&:last-child {
					border-bottom: none;
				}
			}

			.info-row {
				display: flex;
				margin-bottom: 16rpx;
				font-size: 28rpx;
				line-height: 1.5;

				.label {
					color: #666;
					width: 160rpx;
					flex-shrink: 0;
				}
			}

			.actions {
				display: flex;
				justify-content: flex-end;
				padding-top: 20rpx;

				.remove-btn {
					background-color: #ff4d4f;
					color: #fff;
					font-size: 28rpx;
					padding: 10rpx 30rpx;
					border-radius: 8rpx;
					border: none;

					&:active {
						opacity: 0.8;
					}
				}
			}
		}
	}
</style>
