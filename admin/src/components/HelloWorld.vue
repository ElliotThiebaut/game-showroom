<script setup lang="ts">
import { ref } from "vue";

defineProps<{ msg: string }>();

const count = ref(0);
</script>

<template>
    <div class="mt-16 font-bold text-white text-center">
        <h1 class="text-4xl">{{ msg }}</h1>

        <div class="mt-5 bg-[#009C8B] text-xl px-4 py-2 rounded-lg cursor-pointer">
            <button type="button" @click="count++">Number of games : {{ count }}</button>
        </div>
    </div>
</template>

<style scoped></style>
