<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
    <div class="min-h-screen flex flex-col">
        <Navbar v-if="route.name !== 'login'" />
        <router-view class="flex-grow" />
    </div>
</template>

<style scoped></style>
