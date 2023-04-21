<script setup lang="ts">
import HelloWorld from "@/components/HelloWorld.vue";
import { useUserStore } from "@/stores/userStore";
import { clerk } from "@/clerk";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();
const user = userStore.user;

function signOut() {
    clerk.signOut()
        .then(() => {
            userStore.user = undefined;
            router.push({ name: "Login" });
        })
}
</script>

<template>
    <div class="h-screen bg-gray-800 flex justify-center items-center flex-col">
        <p @click="signOut" class="cursor-pointer underline text-white">Déconnexion</p>
        <h1 class="my-24 text-4xl text-white font-bold">Welcome {{ user.fullName }}</h1>
        <div>
            <a href="https://roquette-lab.fr" target="_blank">
                <img src="/img/logo-roquettelab.png" class="h-40" alt="Roquette Lab logo" />
            </a>
        </div>
        <HelloWorld msg="Game Showroom" />
    </div>
</template>

<style scoped></style>
