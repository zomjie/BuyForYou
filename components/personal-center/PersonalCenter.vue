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
        </view>
      </view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">联系方式：</text>
          <text>{{userInfo.contact}}</text>
        </view>
        <view class="divider"></view>
        <view class="menu-list">
          <view class="menu-item" @click="handleOrders">
            <text class="iconfont icon-order"></text>
            <text>我的订单</text>
          </view>
          <view class="menu-item" @click="handleComplaints">
            <text class="iconfont icon-complaint"></text>
            <text>投诉记录</text>
          </view>
          <view class="menu-item" @click="handleSettings">
            <text class="iconfont icon-settings"></text>
            <text>设置</text>
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
          <view class="menu-item" @click="handleMerchantOrders">
            <text class="iconfont icon-order"></text>
            <text>订单管理</text>
          </view>
          <view class="menu-item" @click="handleShopSettings">
            <text class="iconfont icon-settings"></text>
            <text>店铺设置</text>
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
        const url = this.loginType === 'user' ? 'http://localhost:3000/api/user/login' : 'http://localhost:3000/api/merchant/login'
        const params = this.loginType === 'user' 
          ? { userId: this.loginForm.userId, password: this.loginForm.password }
          : { merchantNo: this.loginForm.merchantNo, password: this.loginForm.password }

        const response = await uni.request({
          url,
          method: 'POST',
          data: params
        })

        if (response.data.success) {
          this.isLoggedIn = true
          this.userType = this.loginType
          if (this.loginType === 'user') {
            this.userInfo = response.data.user
          } else {
            this.merchantInfo = response.data.merchant
          }
          this.closeLoginPopup()
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: response.data.message || '登录失败',
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
    async handleRegister() {
      try {
        const url = this.loginType === 'user' ? 'http://localhost:3000/api/user/register' : 'http://localhost:3000/api/merchant/register'
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
    handleOrders() {
      uni.navigateTo({ url: '/pages/orders/orders' })
    },
    handleComplaints() {
      uni.navigateTo({ url: '/pages/complaints/complaints' })
    },
    handleSettings() {
      uni.navigateTo({ url: '/pages/settings/settings' })
    },
    handleDishes() {
      uni.navigateTo({ url: '/pages/merchant/dishes/dishes' })
    },
    handleMerchantOrders() {
      uni.navigateTo({ url: '/pages/merchant/orders/orders' })
    },
    handleShopSettings() {
      uni.navigateTo({ url: '/pages/merchant/settings/settings' })
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
</style> 