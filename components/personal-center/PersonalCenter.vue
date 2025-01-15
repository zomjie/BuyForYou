<template>
  <view class="personal-center">
    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="login-section">
      <view class="welcome-text">欢迎使用校园代买餐平台</view>
      <button class="login-btn" @click="showLoginModal">登录/注册</button>
    </view>

    <!-- 已登录状态 - 用户 -->
    <view v-else-if="userInfo && userType === 'user'" class="user-info">
      <view class="info-header">
        <image class="avatar" src="/static/default-avatar.png"></image>
        <view class="basic-info">
          <text class="name">{{userInfo.name}}</text>
          <text class="college">{{userInfo.college}} | {{userInfo.grade}}年级</text>
          <text v-if="userInfo.type === 1" class="admin-badge">管理员</text>
        </view>
      </view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">联系方式：</text>
          <text>{{userInfo.contact}}</text>
        </view>
        <view class="divider"></view>
        <view class="menu-list">
          <!-- 管理员菜单 -->
          <template v-if="userInfo.type === 1">
            <view class="menu-item" @click="handleComplaints">
              <text class="iconfont icon-complaint"></text>
              <text>管理投诉</text>
            </view>
            <view class="menu-item" @click="handleMerchantAudit">
              <text class="iconfont icon-audit"></text>
              <text>审核商家</text>
            </view>
            <view class="menu-item" @click="handleBlacklist">
              <text class="iconfont icon-blacklist"></text>
              <text>管理黑名单</text>
            </view>
          </template>
          <!-- 普通用户菜单 -->
          <template v-else>
            <view class="menu-item" @click="handleOrders">
              <text class="iconfont icon-order"></text>
              <text>我的订单</text>
            </view>
            <view class="menu-item" @click="handleDeliveries">
              <text class="iconfont icon-delivery"></text>
              <text>配送记录</text>
            </view>
            <view class="menu-item" @click="handleComplaints">
              <text class="iconfont icon-complaint"></text>
              <text>投诉记录</text>
            </view>
            <view class="menu-item" @click="handleSettings">
              <text class="iconfont icon-settings"></text>
              <text>个人设置</text>
            </view>
          </template>
          <view class="menu-item logout" @click="handleLogout">
            <text class="iconfont icon-logout"></text>
            <text>退出登录</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 已登录状态 - 商家 -->
    <view v-else-if="merchantInfo && userType === 'merchant'" class="merchant-info">
      <view class="info-header">
        <image class="shop-logo" src="/static/default-shop.png"></image>
        <view class="basic-info">
          <text class="shop-name">{{merchantInfo.name}}</text>
          <text class="status" :class="merchantInfo.status">{{merchantInfo.status}}</text>
        </view>
      </view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">商家描述：</text>
          <text>{{merchantInfo.description}}</text>
        </view>
        <view class="info-item">
          <text class="label">联系电话：</text>
          <text>{{merchantInfo.phone}}</text>
        </view>
        <view class="divider"></view>
        <view class="menu-list">
          <view class="menu-item" @click="handleDishes">
            <text class="iconfont icon-dish"></text>
            <text>菜品管理</text>
          </view>
          <!-- <view class="menu-item" @click="handleMerchantOrders">
            <text class="iconfont icon-order"></text>
            <text>订单管理</text>
          </view> -->
          <view class="menu-item" @click="handleShopSettings">
            <text class="iconfont icon-settings"></text>
            <text>店铺设置</text>
          </view>
          <view class="menu-item logout" @click="handleLogout">
            <text class="iconfont icon-logout"></text>
            <text>退出登录</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 登录/注册弹窗 -->
    <view v-if="showLoginForm" class="modal-mask">
      <view class="login-popup">
        <view class="tab-header">
          <text 
            :class="['tab-item', activeTab === 'login' ? 'active' : '']"
            @click="activeTab = 'login'"
          >登录</text>
          <text 
            :class="['tab-item', activeTab === 'register' ? 'active' : '']"
            @click="activeTab = 'register'"
          >注册</text>
        </view>
        
        <view class="role-switch">
          <text 
            :class="['role-item', loginType === 'user' ? 'active' : '']"
            @click="loginType = 'user'"
          >个人用户</text>
          <text 
            :class="['role-item', loginType === 'merchant' ? 'active' : '']"
            @click="loginType = 'merchant'"
          >商家</text>
        </view>

        <!-- 登录表单 -->
        <view v-if="activeTab === 'login'" class="form">
          <input 
            v-if="loginType === 'user'"
            type="number" 
            v-model="loginForm.userId" 
            placeholder="请输入学号"
          />
          <input 
            v-else
            type="number" 
            v-model="loginForm.merchantNo" 
            placeholder="请输入商家编号"
          />
          <input 
            type="password" 
            v-model="loginForm.password" 
            placeholder="请输入密码"
          />
          <button class="submit-btn" @click="handleLogin">登录</button>
        </view>

        <!-- 注册表单 -->
        <view v-else class="form">
          <!-- 用户注册 -->
          <template v-if="loginType === 'user'">
            <input type="number" v-model="registerForm.userId" placeholder="请输入学号"/>
            <input type="text" v-model="registerForm.name" placeholder="请输入姓名"/>
            <input type="text" v-model="registerForm.college" placeholder="请输入学院"/>
            <input type="text" v-model="registerForm.contact" placeholder="请输入联系方式"/>
            <input type="number" v-model="registerForm.grade" placeholder="请输入年级"/>
            <input type="password" v-model="registerForm.password" placeholder="请输入密码"/>
          </template>
          
          <!-- 商家注册 -->
          <template v-else>
            <input type="number" v-model="registerForm.merchantNo" placeholder="请输入商家编号"/>
            <input type="text" v-model="registerForm.name" placeholder="请输入商家名称"/>
            <input type="text" v-model="registerForm.description" placeholder="请输入商家描述"/>
            <input type="text" v-model="registerForm.phone" placeholder="请输入联系电话"/>
            <select v-model="registerForm.dininghallNo">
              <option value="">请选择所属食堂</option>
              <option v-for="hall in diningHalls" :key="hall.no" :value="hall.no">
                {{hall.name}}
              </option>
            </select>
            <input type="password" v-model="registerForm.password" placeholder="请输入密码"/>
          </template>
          <button class="submit-btn" @click="handleRegister">注册</button>
        </view>

        <text class="close-btn" @click="closeLoginPopup">×</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PersonalCenter',
  data() {
    return {
      isLoggedIn: false,
      showLoginForm: false,
      userType: '', // 'user' or 'merchant'
      activeTab: 'login',
      loginType: 'user',
      userInfo: null,
      merchantInfo: null,
      diningHalls: [
        { no: 1, name: '荔园美食汇' },
        { no: 2, name: '听山餐厅' },
        { no: 3, name: '荔天餐厅' },
        { no: 4, name: '伐木餐厅' }
      ],
      loginForm: {
        userId: '',
        merchantNo: '',
        password: ''
      },
      registerForm: {
        // 用户注册字段
        userId: '',
        name: '',
        college: '',
        contact: '',
        grade: '',
        password: '',
        // 商家注册字段
        merchantNo: '',
        description: '',
        phone: '',
        dininghallNo: ''
      }
    }
  },
  methods: {
    showLoginModal() {
      this.showLoginForm = true
    },
    closeLoginPopup() {
      this.showLoginForm = false
      this.resetForms()
    },
    resetForms() {
      this.loginForm = {
        userId: '',
        merchantNo: '',
        password: ''
      }
      this.registerForm = {
        userId: '',
        name: '',
        college: '',
        contact: '',
        grade: '',
        password: '',
        merchantNo: '',
        description: '',
        phone: '',
        dininghallNo: ''
      }
    },
    async handleLogin() {
      try {
        const url = this.loginType === 'user' ? 'http://38.55.235.56:3000/api/user/login' : 'http://38.55.235.56:3000/api/merchant/login'
        const params = this.loginType === 'user' 
          ? { userId: this.loginForm.userId, password: this.loginForm.password }
          : { merchantNo: this.loginForm.merchantNo, password: this.loginForm.password }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        })
        const data = await response.json()

        if (data.success) {
          this.isLoggedIn = true
          this.userType = this.loginType
          if (this.loginType === 'user') {
            this.userInfo = data.data.user
            const userInfoToStore = {
              userId: data.data.user.userId,
              name: data.data.user.name,
              college: data.data.user.college,
              contact: data.data.user.contact,
              grade: data.data.user.grade,
              type: data.data.user.type
            }
            uni.setStorageSync('userInfo', userInfoToStore)
            uni.setStorageSync('userType', 'user')
            uni.setStorageSync('isLoggedIn', 'true')
          } else {
            this.merchantInfo = data.data.merchant
            uni.setStorageSync('merchantInfo', data.data.merchant)
            uni.setStorageSync('userType', 'merchant')
            uni.setStorageSync('isLoggedIn', 'true')
          }
          this.closeLoginPopup()
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: data.message || '登录失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('登录错误:', error)
        let errorMessage = '网络错误...'
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorMessage = '无法连接到服务器，请检查网络连接'
        } else if (error instanceof SyntaxError) {
          errorMessage = '服务器响应格式错误'
        }
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000
        })
      }
    },
    async handleRegister() {
      try {
        const url = this.loginType === 'user' ? 'http://38.55.235.56:3000/api/user/register' : 'http://38.55.235.56:3000/api/merchant/register'
        const params = this.loginType === 'user' 
          ? {
              userId: this.registerForm.userId,
              name: this.registerForm.name,
              college: this.registerForm.college,
              contact: this.registerForm.contact,
              grade: this.registerForm.grade,
              password: this.registerForm.password
            }
          : {
              merchantNo: this.registerForm.merchantNo,
              name: this.registerForm.name,
              description: this.registerForm.description,
              phone: this.registerForm.phone,
              dininghallNo: this.registerForm.dininghallNo,
              password: this.registerForm.password
            }

        const response = await uni.request({
          url,
          method: 'POST',
          data: params
        })

        if (response.data.success) {
          uni.showToast({
            title: '注册成功',
            icon: 'success'
          })
          this.activeTab = 'login'
        } else {
          uni.showToast({
            title: response.data.message || '注册失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    },
    // 其他功能方法
    handleDeliveries() {
      if (this.userInfo && this.userInfo.userId) {
        uni.navigateTo({
          url: `/pages/user/deliveries/deliveries?userId=${this.userInfo.userId}`
        })
      } else {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
      }
    },
    handleComplaints() {
      if (!this.userInfo) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }
      
      if (this.userInfo.type === 1) {
        // 管理员跳转到投诉管理页面
        uni.navigateTo({ 
          url: '/pages/admin/complaints/complaints' 
        })
      } else {
        // 普通用户跳转到个人投诉记录页面
        uni.navigateTo({ 
          url: `/pages/user/complaints/complaints?userId=${this.userInfo.userId}` 
        })
      }
    },
    handleSettings() {
      if (!this.userInfo) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }
      uni.navigateTo({ 
        url: '/pages/user/settings/settings' 
      })
    },
    handleDishes() {
      uni.navigateTo({ url: '/pages/merchant/dishes/dishes' })
    },
    handleMerchantOrders() {
      uni.navigateTo({ url: '/pages/merchant/orders/orders' })
    },
    handleShopSettings() {
      uni.navigateTo({ url: '/pages/merchant/settings/settings' })
    },
    
    handleLogout() {
      // 清除登录状态和用户信息
      uni.removeStorageSync('isLoggedIn')
      uni.removeStorageSync('userType')
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('merchantInfo')
      
      // 重置组件状态
      this.isLoggedIn = false
      this.userType = ''
      this.userInfo = null
      this.merchantInfo = null
      
      uni.showToast({
        title: '已退出登录',
        icon: 'success'
      })
    },
    handleMerchantAudit() {
      uni.navigateTo({ url: '/pages/admin/merchant-audit/merchant-audit' })
    },
    handleBlacklist() {
      uni.navigateTo({ url: '/pages/admin/blacklist/blacklist' })
    },
    handleOrders() {
      if (this.userInfo && this.userInfo.userId) {
        uni.navigateTo({
          url: `/pages/user/orders/orders?userId=${this.userInfo.userId}`
        })
      } else {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
      }
    }
  },
  mounted() {
    // 检查登录状态
    const isLoggedIn = uni.getStorageSync('isLoggedIn') === 'true'
    const userType = uni.getStorageSync('userType')
    
    if (isLoggedIn && userType) {
      this.isLoggedIn = true
      this.userType = userType
      
      if (userType === 'user') {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          this.userInfo = {
            ...userInfo,
            userId: userInfo.user_id || userInfo.userId // 兼容两种字段名
          }
          // 更新存储，确保使用统一的字段名
          uni.setStorageSync('userInfo', this.userInfo)
        }
      } else if (userType === 'merchant') {
        const merchantInfo = uni.getStorageSync('merchantInfo')
        if (merchantInfo) {
          this.merchantInfo = merchantInfo
        }
      }
    }
  }
}
</script>

<style lang="scss">
.personal-center {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;

  .login-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(to bottom, #f8f8f8, #e9ecef);

    .welcome-text {
      font-size: 36rpx;
      color: #333;
      margin-bottom: 60rpx;
      text-align: center;
      font-weight: bold;
    }

    .login-btn {
      width: 300rpx;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      background-color: #007AFF;
      color: #fff;
      border-radius: 40rpx;
      font-size: 28rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.2);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
        box-shadow: 0 2rpx 6rpx rgba(0, 122, 255, 0.2);
      }
    }
  }

  .user-info, .merchant-info {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

    .info-header {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;

      .avatar, .shop-logo {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        margin-right: 20rpx;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
      }

      .basic-info {
        .name, .shop-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 10rpx;
        }

        .college {
          font-size: 24rpx;
          color: #666;
        }

        .status {
          font-size: 24rpx;
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
          
          &.待审核 {
            background-color: #FFF3CD;
            color: #856404;
          }
          
          &.已通过 {
            background-color: #D4EDDA;
            color: #155724;
          }
          
          &.已拒绝 {
            background-color: #F8D7DA;
            color: #721C24;
          }
        }
      }
    }

    .info-list {
      .info-item {
        display: flex;
        margin-bottom: 20rpx;
        font-size: 28rpx;

        .label {
          color: #666;
          width: 160rpx;
        }
      }

      .divider {
        height: 1rpx;
        background-color: #eee;
        margin: 20rpx 0;
      }

      .menu-list {
        display: flex;
        flex-wrap: wrap;

        .menu-item {
          width: 33.33%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20rpx 0;
          transition: all 0.3s ease;

          &:active {
            opacity: 0.7;
          }

          .iconfont {
            font-size: 48rpx;
            color: #007AFF;
            margin-bottom: 10rpx;
          }

          text {
            font-size: 24rpx;
            color: #333;
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }

  .login-popup {
    background-color: #fff;
    width: 600rpx;
    border-radius: 20rpx;
    padding: 40rpx;
    position: relative;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);

    .tab-header {
      display: flex;
      justify-content: center;
      margin-bottom: 30rpx;

      .tab-item {
        font-size: 32rpx;
        color: #666;
        padding: 0 30rpx;
        position: relative;
        transition: all 0.3s ease;

        &.active {
          color: #007AFF;

          &::after {
            content: '';
            position: absolute;
            bottom: -10rpx;
            left: 50%;
            transform: translateX(-50%);
            width: 40rpx;
            height: 4rpx;
            background-color: #007AFF;
            border-radius: 2rpx;
          }
        }
      }
    }

    .role-switch {
      display: flex;
      justify-content: center;
      margin-bottom: 30rpx;

      .role-item {
        padding: 10rpx 30rpx;
        font-size: 28rpx;
        color: #666;
        border: 1rpx solid #ddd;
        transition: all 0.3s ease;

        &:first-child {
          border-radius: 30rpx 0 0 30rpx;
        }

        &:last-child {
          border-radius: 0 30rpx 30rpx 0;
        }

        &.active {
          background-color: #007AFF;
          color: #fff;
          border-color: #007AFF;
        }
      }
    }

    .form {
      input, select {
        width: 100%;
        height: 80rpx;
        border: 1rpx solid #ddd;
        border-radius: 40rpx;
        margin-bottom: 20rpx;
        padding: 0 30rpx;
        font-size: 28rpx;
        transition: all 0.3s ease;

        &:focus {
          border-color: #007AFF;
          box-shadow: 0 0 0 2rpx rgba(0, 122, 255, 0.1);
        }
      }

      .submit-btn {
        width: 100%;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        background-color: #007AFF;
        color: #fff;
        border-radius: 40rpx;
        font-size: 28rpx;
        margin-top: 20rpx;
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.98);
          opacity: 0.9;
        }
      }
    }

    .close-btn {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      font-size: 40rpx;
      color: #999;
      padding: 10rpx;
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.9);
        opacity: 0.7;
      }
    }
  }
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid #eee;
  
  &.logout {
    margin-top: 20rpx;
    color: #ff4d4f;
    border-bottom: none;
    background-color: #fff1f0;
    border-radius: 8rpx;
    
    .iconfont {
      color: #ff4d4f;
    }
  }
  
  .iconfont {
    font-size: 40rpx;
    margin-right: 20rpx;
    color: #666;
  }
  
  text {
    font-size: 28rpx;
  }
}

.admin-badge {
  font-size: 20rpx;
  color: #fff;
  background-color: #ff9800;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  margin-top: 8rpx;
}

.menu-list {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 0;

  .menu-item {
    width: 33.33%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 0;
    transition: all 0.3s ease;

    &:active {
      opacity: 0.7;
    }

    .iconfont {
      font-size: 48rpx;
      margin-bottom: 10rpx;
      
      &.icon-complaint {
        color: #ff9800;
      }
      
      &.icon-audit {
        color: #2196f3;
      }
      
      &.icon-blacklist {
        color: #f44336;
      }

      &.icon-dish {
        color: #4caf50;
      }

      &.icon-order {
        color: #ff9800;
      }

      &.icon-settings {
        color: #2196f3;
      }

      &.icon-logout {
        color: #ff4d4f;
      }
    }

    text {
      font-size: 24rpx;
      color: #333;
    }

    &.logout {
      margin-top: 40rpx;
      width: 100%;
      flex-direction: row;
      justify-content: center;
      background-color: #fff1f0;
      border-radius: 8rpx;
      padding: 24rpx 0;
      
      .iconfont {
        margin: 0 10rpx 0 0;
        font-size: 32rpx;
      }
      
      text {
        color: #ff4d4f;
        font-size: 28rpx;
      }
    }
  }
}
</style> 