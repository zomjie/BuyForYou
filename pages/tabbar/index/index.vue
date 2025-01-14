<template>
	<view>
		<Navbar/>
		<DiningHalls/>
	</view>
</template>

<script>
	import Navbar from "@/pages/navbar/navbar.vue"
	import DiningHalls from "@/pages/dining-halls/dining-halls.vue"

	export default {
		components: {
			Navbar,
			DiningHalls
		}
	}
</script>

<style lang="scss">
</style>
