<template>
  <view class="settings-container">
    <view class="settings-form">
      <view class="form-item">
        <text class="label">姓名</text>
        <input 
          class="input" 
          type="text" 
          v-model="userForm.name" 
          placeholder="请输入姓名"
        />
      </view>
      
      <view class="form-item">
        <text class="label">学院</text>
        <input 
          class="input" 
          type="text" 
          v-model="userForm.college" 
          placeholder="请输入学院"
        />
      </view>
      
      <view class="form-item">
        <text class="label">联系方式</text>
        <input 
          class="input" 
          type="text" 
          v-model="userForm.contact" 
          placeholder="请输入联系方式"
        />
      </view>
      
      <view class="form-item">
        <text class="label">年级</text>
        <input 
          class="input" 
          type="number" 
          v-model="userForm.grade" 
          placeholder="请输入年级"
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
      userForm: {
        name: '',
        college: '',
        contact: '',
        grade: ''
      },
      userId: '',
      baseUrl: 'http://38.55.235.56:3000/api'
    }
  },
  
  onLoad() {
    // 从本地存储获取用户信息
    const userInfo = uni.getStorageSync('userInfo')
    console.log('Current userInfo:', userInfo)
    
    if (!userInfo) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
      return
    }

    // 直接使用存储的用户信息对象
    this.userId = userInfo.userId
    // 填充表单
    this.userForm = {
      name: userInfo.name || '',
      college: userInfo.college || '',
      contact: userInfo.contact || '',
      grade: userInfo.grade || ''
    }
    console.log('Form initialized with:', this.userForm)
  },
  
  methods: {
    validateForm() {
      if (!this.userForm.name) {
        uni.showToast({
          title: '请输入姓名',
          icon: 'none'
        })
        return false
      }
      if (!this.userForm.college) {
        uni.showToast({
          title: '请输入学院',
          icon: 'none'
        })
        return false
      }
      if (!this.userForm.contact) {
        uni.showToast({
          title: '请输入联系方式',
          icon: 'none'
        })
        return false
      }
      if (!this.userForm.grade) {
        uni.showToast({
          title: '请输入年级',
          icon: 'none'
        })
        return false
      }
      return true
    },
    
    async handleSubmit() {
      if (!this.validateForm()) return
      
      if (!this.userId) {
        uni.showToast({
          title: '用户ID不存在，请重新登录',
          icon: 'none'
        })
        return
      }
      
      console.log('Submitting form with userId:', this.userId)
      console.log('Form data:', this.userForm)
      
      try {
        const response = await uni.request({
          url: `${this.baseUrl}/user/${this.userId}`,
          method: 'POST',
          data: this.userForm
        })
        
        console.log('API Response:', response)
        
        // 检查响应状态
        if (response.statusCode === 200 && response.data.success) {
          // 更新本地存储的用户信息
          const userInfo = uni.getStorageSync('userInfo')
          const updatedUserInfo = {
            ...userInfo,
            ...this.userForm
          }
          uni.setStorageSync('userInfo', updatedUserInfo)
          
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
        console.error('更新用户信息失败:', error)
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
        border-color: #007AFF;
      }
    }
  }
  
  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    background-color: #007AFF;
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