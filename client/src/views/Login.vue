<script setup lang="ts">
	import { clerk } from "@/clerk";

	clerk.openSignIn({
		appearance: {
			elements: {
				modalBackdrop: 'bg-white lg:bg-gray-200 justify-center items-center lg:-mt-40',
				modalCloseButton: 'hidden',
				card: 'shadow-none lg:shadow-sm',
				logoBox: 'hidden',
			}
		},
		routing: "path",
		path: '/'
	})
</script>

<template>
	<div id="clerk-sign-in"></div>
</template>

<style scoped></style>
