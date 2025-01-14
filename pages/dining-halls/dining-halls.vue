<template>
  <view class="dining-halls-container">
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="!diningHalls || diningHalls.length === 0" class="empty-container">
      <text>暂无食堂信息</text>
    </view>
    
    <view v-else v-for="diningHall in diningHalls" :key="diningHall.dininghallNo" class="dining-hall-section">
      <view class="dining-hall-header">
        <text class="dining-hall-name">{{ diningHall.name }}</text>
        <text class="dining-hall-position">{{ diningHall.position }}</text>
      </view>
      
      <scroll-view class="dishes-container" scroll-x>
        <view v-if="!diningHall.merchants || diningHall.merchants.length === 0" class="empty-dishes">
          <text>该食堂暂无菜品</text>
        </view>
        <view v-else class="dishes-grid">
          <view v-for="merchant in diningHall.merchants" :key="merchant.merchantNo">
            <view v-for="dish in merchant.dishes" 
                  :key="dish.dishNo" 
                  class="dish-card"
                  @click="viewDishDetail(dish)">
              <image class="dish-image" src="/static/default-dish.png" mode="aspectFill"></image>
              <view class="dish-info">
                <text class="dish-name">{{ dish.name }}</text>
                <text class="merchant-name">{{ merchant.name }}</text>
                <text class="dish-price">¥{{ dish.price }}</text>
                <text class="dish-type">{{ dish.type }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      diningHalls: [],
      loading: true
    }
  },
  
  async mounted() {
    try {
      await this.fetchDiningHallsData()
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  },
  
  methods: {
    async fetchDiningHallsData() {
      try {
        const response = await fetch('http://localhost:3000/api/dishes/grouped-by-dininghall')
        const data = await response.json()
        
        if (data.success) {
          this.diningHalls = data.data.diningHalls
        } else {
          throw new Error(data.message || '获取数据失败')
        }
      } catch (error) {
        console.error('请求发生错误:', error.message)
      } finally {
        this.loading = false
      }
    },
    
    viewDishDetail(dish) {
      window.location.href = `/pages/dish-detail/dish-detail?dishno=${dish.dishNo}`
    }
  }
}
</script>

<style>
.dining-halls-container {
  padding: 20rpx;
}

.dining-hall-section {
  margin-bottom: 40rpx;
}

.dining-hall-header {
  padding: 20rpx 0;
}

.dining-hall-name {
  font-size: 36rpx;
  font-weight: bold;
}

.dining-hall-position {
  font-size: 24rpx;
  color: #666;
  margin-left: 20rpx;
}

.dishes-container {
  width: 100%;
  white-space: nowrap;
}

.dishes-grid {
  display: flex;
  flex-wrap: nowrap;
  padding: 10rpx;
}

.dish-card {
  width: 300rpx;
  margin-right: 20rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.dish-image {
  width: 100%;
  height: 200rpx;
}

.dish-info {
  padding: 16rpx;
  display: flex;
  flex-direction: column;
}

.dish-name {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 4rpx;
}

.dish-price {
  font-size: 32rpx;
  color: #ff6b6b;
  font-weight: bold;
  margin-top: 4rpx;
}

.dish-type {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200rpx;
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

.loading-text {
  font-size: 28rpx;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  color: #999;
  font-size: 28rpx;
}

.empty-dishes {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
  width: 100%;
  color: #999;
  font-size: 24rpx;
}

.merchant-name {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 4rpx;
}
</style>
