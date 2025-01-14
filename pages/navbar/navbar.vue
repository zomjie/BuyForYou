<template>
	<view>
		<view shadow class="box-bg">
			<uni-nav-bar 
				status-bar 
				:border="false" 
				left-width="0"
			>
				<view class="input-view">
					<uni-icons class="input-uni-icon" type="search" size="18" color="#666" />
					<input confirm-type="search" class="nav-bar-input" type="text" placeholder="输入搜索关键词"/>
				</view>
				<template v-slot:right>
					<view class="search-btn">
						搜索
					</view>
				</template>
			</uni-nav-bar>
		</view>
	</view>
</template>

<script>
	import uniNavBar from "@/uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.vue"
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			
		},
			
		components:{
			uniNavBar
		}
	}
</script>

<style lang="scss">
$nav-height: 36px;
$theme-color: #ff9800;

	.box-bg {
		background-color: #FFFFFF;
		padding: 8px 0;
	}

	.search-btn {
		color: #FFFFFF;
		font-size: 14px;
		padding: 0 15px;
		height: $nav-height;
		background-color: $theme-color;
		border-radius: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s;
		
		&:active {
			background-color: darken($theme-color, 10%);
			transform: scale(0.98);
		}
	}

	.input-view {
		/* #ifndef APP-PLUS-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		width: 620rpx;
		flex: 1;
		background-color: #F2F2F2;
		height: $nav-height;
		border-radius: 18px;
		padding: 0 15px;
		flex-wrap: nowrap;
		margin: 7px 0;
		margin-right: 10px;
		margin-left: 15px;
		transition: all 0.3s;
		
		&:active {
			background-color: #EBEBEB;
		}
	}

	.input-uni-icon {
		line-height: $nav-height;
	}

	.nav-bar-input {
		height: $nav-height;
		line-height: $nav-height;
		/* #ifdef APP-PLUS-NVUE */
		width: 370rpx;
		/* #endif */
		padding: 0 8px;
		font-size: 14px;
		background-color: transparent;
		flex: 1;
		
		&::placeholder {
			color: #999;
			font-size: 14px;
		}
	}
</style>
