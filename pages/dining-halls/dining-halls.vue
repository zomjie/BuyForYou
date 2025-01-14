<template>
  <view class="dining-halls">
    <view v-for="hall in diningHalls" :key="hall.dininghall_no" class="dining-hall-section">
      <!-- 食堂标题 -->
      <view class="hall-header">
        <text class="hall-name">{{ hall.dininghall_name }}</text>
        <text class="hall-position">{{ hall.dininghall_position }}</text>
      </view>
      
      <!-- 商家列表 -->
      <view class="merchants">
        <view 
          v-for="merchant in hall.merchants" 
          :key="merchant.merchant_no" 
          class="merchant-card"
        >
          <!-- 商家信息 -->
          <view class="merchant-header">
            <text class="merchant-name">{{ merchant.merchant_name }}</text>
          </view>
          
          <!-- 菜品列表 -->
          <scroll-view scroll-x class="dishes-scroll">
            <view class="dishes">
              <view 
                v-for="dish in merchant.dishes" 
                :key="dish.dishno" 
                class="dish-card"
              >
                <image 
                  class="dish-image" 
                  :src="dish.dish_image ? `data:image/jpeg;base64,${dish.dish_image}` : '@/static/images/default-dish.png'"
                  mode="aspectFill"
                />
                <view class="dish-info">
                  <text class="dish-name">{{ dish.dishname }}</text>
                  <text class="dish-price">¥{{ dish.price }}</text>
                  <text class="dish-quantity" v-if="dish.quantity <= 5">
                    仅剩{{ dish.quantity }}份
                  </text>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DiningHalls',
  
  data() {
    return {
      diningHalls: []
    }
  },
  
  methods: {
    async fetchDiningHallData() {
      try {
        const response = await uni.request({
          url: 'http://localhost:3000/api/dishes/grouped-by-dininghall',
          method: 'GET'
        });
        
        if (response.data.success) {
          this.diningHalls = response.data.data;
        } else {
          uni.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    }
  },
  
  mounted() {
    this.fetchDiningHallData();
  }
}
</script>

<style lang="scss">
.dining-halls {
  padding: 10px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 44px); // 减去导航栏高度
}

.dining-hall-section {
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.hall-header {
  padding: 15px;
  background-color: #ff9800;
  
  .hall-name {
    font-size: 18px;
    font-weight: bold;
    color: #fff;
  }
  
  .hall-position {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin-left: 10px;
  }
}

.merchants {
  padding: 10px;
}

.merchant-card {
  margin-bottom: 15px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.merchant-header {
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
  
  .merchant-name {
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }
}

.dishes-scroll {
  width: 100%;
  white-space: nowrap;
}

.dishes {
  padding: 10px;
  display: inline-flex;
}

.dish-card {
  width: 150px;
  margin-right: 10px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: inline-block;
  
  &:last-child {
    margin-right: 0;
  }
}

.dish-image {
  width: 150px;
  height: 150px;
  background-color: #f5f5f5;
}

.dish-info {
  padding: 8px;
  
  .dish-name {
    font-size: 14px;
    color: #333;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .dish-price {
    font-size: 16px;
    color: #ff5722;
    font-weight: bold;
    display: block;
    margin-top: 4px;
  }
  
  .dish-quantity {
    font-size: 12px;
    color: #ff5722;
    display: block;
    margin-top: 4px;
  }
}
</style> 