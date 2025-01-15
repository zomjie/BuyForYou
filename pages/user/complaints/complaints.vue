<template>
  <view class="complaints-container">
    <view class="complaints-list">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>
      <view v-else-if="complaints.length === 0" class="empty-state">
        <image src="/static/images/no-data.png" mode="aspectFit" class="empty-image"></image>
        <text class="empty-text">暂无投诉记录</text>
      </view>
      <view v-else v-for="complaint in complaints" :key="complaint.complaintId" class="complaint-card">
        <view class="complaint-header">
          <text class="order-time">订单时间：{{formatDate(complaint.orderTime)}}</text>
          <text :class="['status', getStatusClass(complaint.status)]">{{complaint.status}}</text>
        </view>
        <view class="complaint-content">
          <view class="info-row">
            <text class="label">订单类型：</text>
            <text>{{complaint.category}}</text>
          </view>
          <view class="info-row">
            <text class="label">配送地址：</text>
            <text>{{complaint.buyerPosition}}</text>
          </view>
          <view class="info-row">
            <text class="label">投诉类型：</text>
            <text>{{complaint.complaintType}}</text>
          </view>
          <view class="info-row">
            <text class="label">投诉原因：</text>
            <text>{{complaint.reason}}</text>
          </view>
          <view class="info-row" v-if="complaint.evidence">
            <text class="label">证据说明：</text>
            <text>{{complaint.evidence}}</text>
          </view>
          <view class="info-row">
            <text class="label">投诉时间：</text>
            <text>{{formatDate(complaint.createdAt)}}</text>
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
      complaints: [],
      userId: '',
      loading: true,
      baseUrl: 'http://38.55.235.56:3000/api'
    }
  },
  
  onLoad(options) {
    console.log('Route options:', options); // 添加调试日志
    if (options.userId) {
      this.userId = options.userId;
    } else {
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo) {
        this.userId = userInfo.userId;
      } else {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
        return;
      }
    }
    this.loadComplaints();
  },
  
  onPullDownRefresh() {
    this.loadComplaints();
  },
  
  methods: {
    async loadComplaints() {
      this.loading = true;
      try {
        console.log('Loading complaints for userId:', this.userId); // 添加调试日志
        const response = await uni.request({
          url: `${this.baseUrl}/order/complaints/${this.userId}`,
          method: 'GET'
        });
        
        console.log('API Response:', response); // 添加调试日志
        
        if (response.data.success) {
          this.complaints = response.data.data;
        } else {
          uni.showToast({
            title: response.data.message || '获取投诉记录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取投诉记录失败:', error);
        uni.showToast({
          title: '获取投诉记录失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
        uni.stopPullDownRefresh();
      }
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    
    getStatusClass(status) {
      switch (status) {
        case '待处理':
          return 'status-pending';
        case '处理中':
          return 'status-processing';
        case '已处理':
          return 'status-completed';
        default:
          return '';
      }
    }
  }
}
</script>

<style lang="scss">
.complaints-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.loading-state {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  
  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
  }
  
  .empty-text {
    color: #999;
    font-size: 28rpx;
  }
}

.complaint-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  
  .complaint-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #eee;
    
    .order-time {
      font-size: 28rpx;
      color: #666;
    }
    
    .status {
      font-size: 24rpx;
      padding: 4rpx 16rpx;
      border-radius: 8rpx;
      
      &.status-pending {
        background-color: #fff7e6;
        color: #fa8c16;
      }
      
      &.status-processing {
        background-color: #e6f7ff;
        color: #1890ff;
      }
      
      &.status-completed {
        background-color: #f6ffed;
        color: #52c41a;
      }
    }
  }
  
  .complaint-content {
    padding-top: 20rpx;
    
    .info-row {
      display: flex;
      margin-bottom: 16rpx;
      font-size: 28rpx;
      line-height: 1.5;
      
      .label {
        color: #666;
        width: 160rpx;
        flex-shrink: 0;
      }
    }
  }
}
</style> 