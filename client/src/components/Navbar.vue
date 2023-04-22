<script setup lang="ts">
import {clerk} from "@/clerk";
import {useUserStore} from "@/stores/userStore";
import {onMounted} from "vue";
const userStore = useUserStore();
const user = userStore.user;

onMounted(() => {
	clerk.mountUserButton(<HTMLDivElement>document.getElementById("user-avatar"), {
		afterSignOutUrl: "/login",
	})
});
</script>

<template>
	<div class="h-[10vh] lg:h-[6vh] bg-white flex items-center justify-between px-8 lg:px-24 shadow-lg">
		<a href="https://roquette-lab.fr" target="_blank">
			<img src="/img/picto-roquettelab.png" class="h-8 object-contain" alt="Roquette Lab Picto" />
		</a>
		<div id="user-avatar"></div>
	</div>
</template>

<style scoped>

</style>