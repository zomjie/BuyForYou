<template>
  <view class="settings-container">
    <view class="settings-form">
      <view class="form-item">
        <text class="label">店铺名称</text>
        <input 
          class="input" 
          type="text" 
          v-model="merchantForm.name" 
          placeholder="请输入店铺名称"
        />
      </view>
      
      <view class="form-item">
        <text class="label">店铺描述</text>
        <textarea 
          class="textarea" 
          v-model="merchantForm.description" 
          placeholder="请输入店铺描述"
        />
      </view>
      
      <view class="form-item">
        <text class="label">联系电话</text>
        <input 
          class="input" 
          type="text" 
          v-model="merchantForm.phone" 
          placeholder="请输入联系电话"
        />
      </view>
      
      <button class="submit-btn" @click="handleSubmit">保存修改</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      merchantForm: {
        name: '',
        description: '',
        phone: ''
      },
      merchantNo: '',
      baseUrl: 'http://38.55.235.56:3000/api'
    }
  },
  
  onLoad() {
    // 从本地存储获取商家信息
    const merchantInfo = uni.getStorageSync('merchantInfo')
    console.log('Current merchantInfo:', merchantInfo)
    
    if (!merchantInfo) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
      return
    }

    // 直接使用存储的商家信息对象
    this.merchantNo = merchantInfo.merchantNo
    // 填充表单
    this.merchantForm = {
      name: merchantInfo.name || '',
      description: merchantInfo.description || '',
      phone: merchantInfo.phone || ''
    }
    console.log('Form initialized with:', this.merchantForm)
  },
  
  methods: {
    validateForm() {
      if (!this.merchantForm.name) {
        uni.showToast({
          title: '请输入店铺名称',
          icon: 'none'
        })
        return false
      }
      if (!this.merchantForm.phone) {
        uni.showToast({
          title: '请输入联系电话',
          icon: 'none'
        })
        return false
      }
      return true
    },
    
    async handleSubmit() {
      if (!this.validateForm()) return
      
      if (!this.merchantNo) {
        uni.showToast({
          title: '商家编号不存在，请重新登录',
          icon: 'none'
        })
        return
      }
      
      console.log('Submitting form with merchantNo:', this.merchantNo)
      console.log('Form data:', this.merchantForm)
      
      try {
        const response = await uni.request({
          url: `${this.baseUrl}/merchant/${this.merchantNo}`,
          method: 'POST',
          data: this.merchantForm
        })
        
        console.log('API Response:', response)
        
        // 检查响应状态
        if (response.statusCode === 200 && response.data.success) {
          // 更新本地存储的商家信息
          const merchantInfo = uni.getStorageSync('merchantInfo')
          const updatedMerchantInfo = {
            ...merchantInfo,
            ...this.merchantForm
          }
          uni.setStorageSync('merchantInfo', updatedMerchantInfo)
          
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: response.data.message || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('更新商家信息失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss">
.settings-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.settings-form {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-top: 20rpx;
  
  .form-item {
    margin-bottom: 30rpx;
    
    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 10rpx;
    }
    
    .input {
      width: 100%;
      height: 80rpx;
      border: 1rpx solid #ddd;
      border-radius: 8rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
      background-color: #fff;
      
      &:focus {
        border-color: #ff9800;
      }
    }
    
    .textarea {
      width: 100%;
      height: 160rpx;
      border: 1rpx solid #ddd;
      border-radius: 8rpx;
      padding: 20rpx;
      font-size: 28rpx;
      background-color: #fff;
      
      &:focus {
        border-color: #ff9800;
      }
    }
  }
  
  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    background-color: #ff9800;
    color: #fff;
    border-radius: 44rpx;
    font-size: 32rpx;
    margin-top: 40rpx;
    
    &:active {
      opacity: 0.8;
    }
  }
}
</style> 