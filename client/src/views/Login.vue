<script setup lang="ts">
	import { clerk } from "@/clerk";
	import { onMounted } from "vue";

	onMounted(() => {
		clerk.mountSignIn(<HTMLDivElement>document.getElementById("container-sign-in"),
			{
				appearance: {
					elements: {
						modalCloseButton: 'hidden',
						card: 'shadow-none sm:shadow-lg',
						logoBox: 'hidden',
						rootBox: 'w-screen h-screen flex justify-center items-center bg-white sm:bg-gray-200'
					}
				},
				path: '/'
			})
	})
</script>

<template>
	<div id="container-sign-in"></div>
</template>

<style scoped></style>
