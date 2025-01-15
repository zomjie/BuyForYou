<template>
    <view class="admin-center">
        <view class="admin-actions">
            <button class="admin-btn" @click="handleMerchantAudit">商家审核</button>
            <button class="admin-btn" @click="handleComplaintManagement">投诉管理</button>
            <button class="admin-btn" @click="handleBlacklistManagement">黑名单管理</button>
        </view>
    </view>
</template>

<script>
export default {
    methods: {
        handleMerchantAudit() {
            uni.navigateTo({
                url: '/pages/admin/merchant-audit/merchant-audit'
            });
        },
        handleComplaintManagement() {
            uni.navigateTo({
                url: '/pages/admin/complaints/complaints'
            });
        },
        handleBlacklistManagement() {
            uni.navigateTo({
                url: '/pages/admin/blacklist/blacklist'
            });
        }
    }
}
</script>

<style lang="scss">
.admin-center {
    padding: 30rpx;

    .admin-actions {
        display: flex;
        flex-direction: column;
        gap: 20rpx;

        .admin-btn {
            background-color: #ff9800;
            color: #fff;
            font-size: 32rpx;
            padding: 20rpx;
            border-radius: 8rpx;
            border: none;

            &:active {
                opacity: 0.8;
            }
        }
    }
}
</style> 