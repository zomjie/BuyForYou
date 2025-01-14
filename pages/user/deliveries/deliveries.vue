<template>
  <view class="deliveries">
    <view class="header">
      <text class="title">配送记录</text>
    </view>

    <view v-if="loading" class="loading">
      <view class="loading-spinner"></view>
      <text>加载中...</text>
    </view>

    <view v-else-if="deliveries.length === 0" class="empty">
      <text>暂无配送记录</text>
    </view>

    <view v-else class="delivery-list">
      <view v-for="delivery in deliveries" :key="delivery.orderId" class="delivery-card">
        <view class="delivery-header">
          <text class="order-no">订单号: {{delivery.orderId}}</text>
          <text class="status" :class="delivery.status">{{delivery.status}}</text>
        </view>
        <view class="delivery-info">
          <view class="info-item">
            <text class="label">配送时间：</text>
            <text>{{formatTime(delivery.deliveryTime)}}</text>
          </view>
          <view class="info-item">
            <text class="label">配送地点：</text>
            <text>{{delivery.buyerPosition}}</text>
          </view>
          <view class="info-item">
            <text class="label">小费：</text>
            <text class="tips">¥{{delivery.tips}}</text>
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
      loading: true,
      deliveries: []
    }
  },

  mounted() {
    this.fetchDeliveries()
  },

  methods: {
    async fetchDeliveries() {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        if (!userInfo) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }

        const response = await fetch(`http://localhost:3000/api/order/deliveries/${userInfo.userId}`)
        const data = await response.json()

        if (data.success) {
          this.deliveries = data.data.deliveries
        } else {
          uni.showToast({
            title: data.message || '获取配送记录失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取配送记录失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    formatTime(timestamp) {
      if (!timestamp) return '未配送'
      const date = new Date(timestamp)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }
  }
}
</script>

<style lang="scss">
.deliveries {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;

  .header {
    padding: 20rpx;
    background-color: #fff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    
    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .loading, .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400rpx;
    color: #999;
    font-size: 28rpx;
  }

  .loading-spinner {
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid #f3f3f3;
    border-top: 4rpx solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .delivery-list {
    .delivery-card {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);

      .delivery-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;
        padding-bottom: 16rpx;
        border-bottom: 1rpx solid #eee;

        .order-no {
          font-size: 28rpx;
          color: #666;
        }

        .status {
          font-size: 24rpx;
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
          
          &.配送中 {
            background-color: #e6f7ff;
            color: #1890ff;
          }
          
          &.已送达 {
            background-color: #f6ffed;
            color: #52c41a;
          }
        }
      }

      .delivery-info {
        .info-item {
          display: flex;
          margin-bottom: 12rpx;
          font-size: 28rpx;

          .label {
            color: #999;
            width: 160rpx;
          }

          .tips {
            color: #ff4d4f;
            font-weight: bold;
          }
        }
      }
    }
  }
}
</style> 