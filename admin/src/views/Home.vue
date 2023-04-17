<script setup lang="ts">
import HelloWorld from "@/components/HelloWorld.vue";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
</script>

<template>
    <div class="h-screen bg-gray-800 flex justify-center items-center flex-col">
        <h1 class="my-24 text-4xl text-white font-bold">Welcome {{ userStore.name }}</h1>
        <div>
            <a href="https://roquette-lab.fr" target="_blank">
                <img src="/img/logo-roquettelab.png" class="h-40" alt="Roquette Lab logo" />
            </a>
        </div>
        <HelloWorld msg="Game Showroom Admin" />
    </div>
</template>

<style scoped></style>
