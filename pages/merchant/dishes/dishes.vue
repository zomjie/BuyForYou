<template>
  <view class="dishes">
    <view class="header">
      <text class="title">菜品管理</text>
      <button class="add-btn" @click="showAddDishModal">
        <text class="iconfont icon-add"></text>
        <text>新增菜品</text>
      </button>
    </view>

    <view v-if="loading" class="loading">
      <view class="loading-spinner"></view>
      <text>加载中...</text>
    </view>

    <view v-else-if="dishes.length === 0" class="empty">
      <text>当前无已发布菜品</text>
    </view>

    <view v-else class="dish-list">
      <view v-for="dish in dishes" :key="dish.id" class="dish-card">
        <view class="dish-info">
          <view class="dish-header">
            <text class="dish-name">{{dish.name}}</text>
            <text class="dish-price">¥{{dish.price}}</text>
          </view>
          <text class="dish-desc">{{dish.description}}</text>
          <view class="dish-footer">
            <text class="stock-info">库存：{{dish.stock}}</text>
            <button class="edit-btn" @click="showEditDishModal(dish)">修改信息</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 新增菜品弹窗 -->
    <view v-if="showAddModal" class="modal-mask">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">新增菜品</text>
          <text class="close-btn" @click="hideAddDishModal">×</text>
        </view>
        <view class="form">
          <input class="input" v-model="newDish.name" placeholder="菜品名称" />
          <input class="input" v-model="newDish.price" type="digit" placeholder="价格" />
          <input class="input" v-model="newDish.stock" type="number" placeholder="初始库存" />
          <textarea class="textarea" v-model="newDish.description" placeholder="菜品描述"></textarea>
          <button class="submit-btn" @click="addDish">确认添加</button>
        </view>
      </view>
    </view>

    <!-- 修改菜品弹窗 -->
    <view v-if="showEditModal" class="modal-mask">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">修改菜品</text>
          <text class="close-btn" @click="hideEditDishModal">×</text>
        </view>
        <view class="form">
          <input class="input" v-model="editingDish.name" placeholder="菜品名称" />
          <input class="input" v-model="editingDish.price" type="digit" placeholder="价格" />
          <input class="input" v-model="editingDish.stock" type="number" placeholder="库存" />
          <textarea class="textarea" v-model="editingDish.description" placeholder="菜品描述"></textarea>
          <button class="submit-btn" @click="updateDish">确认修改</button>
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
      dishes: [],
      showAddModal: false,
      showEditModal: false,
      baseUrl: 'http://localhost:3000/api',
      newDish: {
        name: '',
        price: '',
        stock: '',
        description: ''
      },
      editingDish: {
        id: '',
        name: '',
        price: '',
        stock: '',
        description: ''
      }
    }
  },

  mounted() {
    this.fetchDishes()
  },

  methods: {
    async fetchDishes() {
      try {
        const merchantInfo = uni.getStorageSync('merchantInfo')
        if (!merchantInfo) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/tabbar/mine/mine'
            })
          }, 1500)
          return
        }

        if (!merchantInfo.merchantNo) {
          uni.showToast({
            title: '商家信息不完整',
            icon: 'none'
          })
          return
        }

        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: `${this.baseUrl}/dishes/merchant/${merchantInfo.merchantNo}`,
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
          const merchantData = data.data.merchant
          this.dishes = merchantData.dishes.map(dish => ({
            id: dish.dishNo,
            name: dish.dishname || dish.name,
            price: dish.price,
            stock: dish.quantity,
            description: dish.description
          }))
        } else {
          throw new Error(data?.message || '获取菜品列表失败')
        }
      } catch (error) {
        console.error('获取菜品列表失败:', error)
        uni.showToast({
          title: '服务器连接失败，请检查网络',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    showAddDishModal() {
      this.showAddModal = true
    },

    hideAddDishModal() {
      this.showAddModal = false
      this.newDish = {
        name: '',
        price: '',
        stock: '',
        description: ''
      }
    },

    async addDish() {
      if (!this.newDish.name || !this.newDish.price || !this.newDish.stock) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }

      try {
        const merchantInfo = uni.getStorageSync('merchantInfo')
        if (!merchantInfo) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }

        if (!merchantInfo.merchantNo) {
          uni.showToast({
            title: '商家信息不完整',
            icon: 'none'
          })
          return
        }

        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: `${this.baseUrl}/dishes`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json'
            },
            data: {
              name: this.newDish.name,
              price: parseFloat(this.newDish.price),
              stock: parseInt(this.newDish.stock),
              description: this.newDish.description,
              merchantNo: merchantInfo.merchantNo
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
            title: '添加成功',
            icon: 'success'
          })
          this.hideAddDishModal()
          this.fetchDishes()
        } else {
          throw new Error(data?.message || '添加失败')
        }
      } catch (error) {
        console.error('添加菜品失败:', error)
        uni.showToast({
          title: '服务器连接失败，请检查网络',
          icon: 'none'
        })
      }
    },

    showEditDishModal(dish) {
      this.editingDish = {
        id: dish.id,
        name: dish.name,
        price: dish.price.toString(),
        stock: dish.stock.toString(),
        description: dish.description
      }
      this.showEditModal = true
    },

    hideEditDishModal() {
      this.showEditModal = false
      this.editingDish = {
        id: '',
        name: '',
        price: '',
        stock: '',
        description: ''
      }
    },

    async updateDish() {
      if (!this.editingDish.name || !this.editingDish.price || !this.editingDish.stock) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }

      try {
        const merchantInfo = uni.getStorageSync('merchantInfo')
        if (!merchantInfo) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }

        if (!merchantInfo.merchantNo) {
          uni.showToast({
            title: '商家信息不完整',
            icon: 'none'
          })
          return
        }

        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: `${this.baseUrl}/dishes/${this.editingDish.id}`,
            method: 'PUT',
            header: {
              'Content-Type': 'application/json'
            },
            data: {
              name: this.editingDish.name,
              price: parseFloat(this.editingDish.price),
              stock: parseInt(this.editingDish.stock),
              description: this.editingDish.description,
              merchantNo: merchantInfo.merchantNo
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
            title: '修改成功',
            icon: 'success'
          })
          this.hideEditDishModal()
          this.fetchDishes()
        } else {
          throw new Error(data?.message || '修改失败')
        }
      } catch (error) {
        console.error('修改菜品失败:', error)
        uni.showToast({
          title: '服务器连接失败，请检查网络',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss">
.dishes {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background-color: #fff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    
    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .add-btn {
      display: flex;
      align-items: center;
      background-color: #ff9800;
      color: #fff;
      padding: 12rpx 24rpx;
      border-radius: 30rpx;
      font-size: 28rpx;

      .iconfont {
        margin-right: 8rpx;
      }
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

  .dish-list {
    .dish-card {
      display: flex;
      background-color: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);

      .dish-info {
        flex: 1;

        .dish-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12rpx;

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

        .dish-desc {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 20rpx;
        }

        .dish-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20rpx;

          .stock-info {
            font-size: 28rpx;
            color: #999;
          }

          .edit-btn {
            background-color: #ff9800;
            color: #fff;
            padding: 12rpx 24rpx;
            border-radius: 30rpx;
            font-size: 28rpx;
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

  .popup-content {
    width: 600rpx;
    background-color: #fff;
    border-radius: 12rpx;
    padding: 30rpx;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;

      .popup-title {
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

    .form {
      .input {
        width: 100%;
        height: 80rpx;
        border: 1rpx solid #ddd;
        border-radius: 8rpx;
        margin-bottom: 20rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
      }

      .textarea {
        width: 100%;
        height: 160rpx;
        border: 1rpx solid #ddd;
        border-radius: 8rpx;
        margin-bottom: 20rpx;
        padding: 20rpx;
        font-size: 28rpx;
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