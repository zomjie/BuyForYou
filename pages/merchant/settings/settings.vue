<template>
  <view class="settings">
    <view class="header">
      <text class="title">店铺设置</text>
    </view>

    <view class="form-container">
      <view class="form-group">
        <text class="label">商家编号</text>
        <text class="value">{{merchantInfo.merchantNo}}</text>
      </view>

      <view class="form-group">
        <text class="label">店铺名称</text>
        <input 
          class="input" 
          v-model="editingInfo.name" 
          placeholder="请输入店铺名称"
        />
      </view>

      <view class="form-group">
        <text class="label">联系电话</text>
        <input 
          class="input" 
          v-model="editingInfo.phone" 
          type="number"
          placeholder="请输入联系电话"
        />
      </view>

      <view class="form-group">
        <text class="label">所属食堂</text>
        <picker 
          class="picker" 
          :value="diningHallIndex" 
          :range="diningHalls" 
          range-key="name"
          @change="onDiningHallChange"
        >
          <view class="picker-value">
            {{editingInfo.diningHallName || '请选择所属食堂'}}
          </view>
        </picker>
      </view>

      <view class="form-group">
        <text class="label">店铺描述</text>
        <textarea 
          class="textarea" 
          v-model="editingInfo.description" 
          placeholder="请输入店铺描述"
        />
      </view>

      <button class="submit-btn" @click="updateMerchantInfo">保存修改</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      merchantInfo: null,
      editingInfo: {
        name: '',
        phone: '',
        description: '',
        diningHallNo: '',
        diningHallName: ''
      },
      diningHalls: [
        { no: 1, name: '荔园美食汇' },
        { no: 2, name: '听山餐厅' },
        { no: 3, name: '荔天餐厅' },
        { no: 4, name: '伐木餐厅' }
      ],
      diningHallIndex: 0,
      baseUrl: 'http://localhost:3000/api'
    }
  },

  mounted() {
    this.initMerchantInfo()
  },

  methods: {
    initMerchantInfo() {
      const merchantInfoStr = uni.getStorageSync('merchantInfo')
      if (!merchantInfoStr) {
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

      this.merchantInfo = JSON.parse(merchantInfoStr)
      
      // 初始化编辑表单
      this.editingInfo = {
        name: this.merchantInfo.name,
        phone: this.merchantInfo.phone,
        description: this.merchantInfo.description,
        diningHallNo: this.merchantInfo.diningHallNo,
        diningHallName: this.diningHalls.find(hall => hall.no === this.merchantInfo.diningHallNo)?.name
      }

      // 设置食堂选择器的初始索引
      this.diningHallIndex = this.diningHalls.findIndex(hall => hall.no === this.merchantInfo.diningHallNo)
    },

    onDiningHallChange(e) {
      const index = e.detail.value
      this.diningHallIndex = index
      this.editingInfo.diningHallNo = this.diningHalls[index].no
      this.editingInfo.diningHallName = this.diningHalls[index].name
    },

    async updateMerchantInfo() {
      if (!this.editingInfo.name || !this.editingInfo.phone || !this.editingInfo.diningHallNo) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }

      try {
        const result = await new Promise((resolve, reject) => {
          uni.request({
            url: `${this.baseUrl}/merchant/${this.merchantInfo.merchantNo}`,
            method: 'PUT',
            header: {
              'Content-Type': 'application/json'
            },
            data: {
              name: this.editingInfo.name,
              phone: this.editingInfo.phone,
              description: this.editingInfo.description,
              diningHallNo: this.editingInfo.diningHallNo
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
          // 更新本地存储的商家信息
          const updatedInfo = {
            ...this.merchantInfo,
            name: this.editingInfo.name,
            phone: this.editingInfo.phone,
            description: this.editingInfo.description,
            diningHallNo: this.editingInfo.diningHallNo
          }
          uni.setStorageSync('merchantInfo', JSON.stringify(updatedInfo))

          uni.showToast({
            title: '修改成功',
            icon: 'success'
          })
        } else {
          throw new Error(data?.message || '修改失败')
        }
      } catch (error) {
        console.error('修改商家信息失败:', error)
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
.settings {
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

  .form-container {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 30rpx;

    .form-group {
      margin-bottom: 30rpx;

      .label {
        display: block;
        font-size: 28rpx;
        color: #666;
        margin-bottom: 12rpx;
      }

      .value {
        font-size: 28rpx;
        color: #999;
      }

      .input, .picker {
        width: 100%;
        height: 80rpx;
        border: 1rpx solid #ddd;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        background-color: #fff;
      }

      .picker-value {
        line-height: 80rpx;
        color: #333;
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

    .submit-btn {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      background-color: #ff9800;
      color: #fff;
      border-radius: 8rpx;
      font-size: 28rpx;
      margin-top: 40rpx;

      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style> 