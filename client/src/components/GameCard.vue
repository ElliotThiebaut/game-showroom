<template>
    <div class="shadow-lg rounded-2xl mb-10 cursor-pointer hover:text-white hover:shadow-2xl hover:scale-[1.03] hover:bg-black/90 transition ease-in-out relative">
        <p v-if="isViewed" class="absolute top-3 right-3 bg-green-500 text-white text-lg font-text font-bold px-3 py-2 rounded-full">Viewed</p>
        <img :src="imgUrl" class="w-full rounded-t-2xl max-h-56 object-cover" alt="game image" />
        <div class="p-5">
            <h2 class="font-title text-3xl mb-2">{{ name }}</h2>
            <p class="text-blue-400 inline text-lg font-subtitle font-bold font-subtitle">{{ category }}</p>
        </div>
    </div>
</template>

<script>
import { mapState } from "pinia";
import { useUserStore } from "@/stores/userStore";

export default {
    props: {
        imgUrl: String,
        category: String,
        name: String,
        id: String,
    },

    computed: {
        ...mapState(useUserStore, ["viewedVideo"]),

        isViewed() {
            return this.viewedVideo.includes(this.id);
        },
    },
};
</script>

<style scoped></style>
