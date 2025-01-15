<template>
  <view class="merchant-audit">
    <view class="header">
      <text class="title">商家审核</text>
    </view>

    <view v-if="loading" class="loading">
      <view class="loading-spinner"></view>
      <text>加载中...</text>
    </view>

    <view v-else-if="merchants.length === 0" class="empty">
      <text>暂无待审核的商家</text>
    </view>

    <view v-else class="merchant-list">
      <view v-for="merchant in merchants" :key="merchant.merchantNo" class="merchant-card">
        <view class="merchant-info">
          <view class="main-info">
            <text class="name">{{merchant.name}}</text>
            <text class="merchant-no">商家编号: {{merchant.merchantNo}}</text>
          </view>
          <view class="details">
            <text class="description">{{merchant.description}}</text>
            <text class="phone">联系电话: {{merchant.phone}}</text>
            <text class="location">所属食堂: {{getDiningHallName(merchant.dininghallNo)}}</text>
          </view>
        </view>
        <view class="audit-actions">
          <button class="approve-btn" @click="handleApprove(merchant.merchantNo)">通过</button>
          <button class="reject-btn" @click="handleReject(merchant.merchantNo)">拒绝</button>
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
      merchants: [],
      diningHalls: [
        { no: 1, name: '荔园美食汇' },
        { no: 2, name: '听山餐厅' },
        { no: 3, name: '荔天餐厅' },
        { no: 4, name: '伐木餐厅' }
      ]
    }
  },

  mounted() {
    this.fetchPendingMerchants()
  },

  methods: {
    async fetchPendingMerchants() {
      try {
        const response = await fetch('http://38.55.235.56:3000/api/merchant/pending')
        const data = await response.json()

        if (data.success) {
          this.merchants = data.data.merchants
        } else {
          uni.showToast({
            title: data.message || '获取商家列表失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取待审核商家失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    getDiningHallName(dininghallNo) {
      const hall = this.diningHalls.find(h => h.no === dininghallNo)
      return hall ? hall.name : '未知食堂'
    },

    async handleApprove(merchantNo) {
      try {
        const response = await fetch(`http://38.55.235.56:3000/api/merchant/audit/${merchantNo}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: '已通过'
          })
        })
        const data = await response.json()

        if (data.success) {
          uni.showToast({
            title: '审核通过',
            icon: 'success'
          })
          // 刷新商家列表
          this.fetchPendingMerchants()
        } else {
          uni.showToast({
            title: data.message || '操作失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('审核操作失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    },

    async handleReject(merchantNo) {
      try {
        const response = await fetch(`http://38.55.235.56:3000/api/merchant/audit/${merchantNo}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: '已拒绝'
          })
        })
        const data = await response.json()

        if (data.success) {
          uni.showToast({
            title: '已拒绝商家申请',
            icon: 'success'
          })
          // 刷新商家列表
          this.fetchPendingMerchants()
        } else {
          uni.showToast({
            title: data.message || '操作失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('审核操作失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss">
.merchant-audit {
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

  .merchant-list {
    .merchant-card {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);

      .merchant-info {
        .main-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16rpx;

          .name {
            font-size: 32rpx;
            font-weight: bold;
            color: #333;
          }

          .merchant-no {
            font-size: 24rpx;
            color: #666;
          }
        }

        .details {
          .description {
            font-size: 28rpx;
            color: #666;
            margin-bottom: 12rpx;
            display: block;
          }

          .phone, .location {
            font-size: 24rpx;
            color: #999;
            margin-bottom: 8rpx;
            display: block;
          }
        }
      }

      .audit-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 20rpx;
        gap: 20rpx;

        button {
          min-width: 160rpx;
          height: 64rpx;
          line-height: 64rpx;
          text-align: center;
          border-radius: 32rpx;
          font-size: 28rpx;
          
          &.approve-btn {
            background-color: #52c41a;
            color: #fff;
            
            &:active {
              background-color: darken(#52c41a, 10%);
            }
          }
          
          &.reject-btn {
            background-color: #ff4d4f;
            color: #fff;
            
            &:active {
              background-color: darken(#ff4d4f, 10%);
            }
          }
        }
      }
    }
  }
}
</style> 