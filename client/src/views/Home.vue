<script setup lang="ts">
import HelloWorld from "@/components/HelloWorld.vue";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();
const user = userStore.user;

</script>

<template>
    <div class="bg-gray-800 flex justify-center items-center flex-col">
        <h1 class="my-12 text-4xl text-white font-bold">Welcome {{ user.fullName }}</h1>
        <div>
            <a href="https://roquette-lab.fr" target="_blank">
                <img src="/img/logo-roquettelab.png" class="h-40 object-contain" alt="Roquette Lab logo" />
            </a>
        </div>
        <HelloWorld msg="Game Showroom" />
    </div>
</template>

<style scoped></style>
