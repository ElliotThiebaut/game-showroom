<template>
    <div v-if="userStore.firstVisit">
        <div class="backdrop-blur-sm bg-gray-600/50 overflow-auto py-10 lg:px-20 xl:px-40 2xl:px-72 px-5 fixed z-10 inset-0 w-full h-screen">
            <div class="bg-white text-primary-red text-center rounded-md px-5 lg:px-10 py-10 mt-32 md:mt-0 max-w-5xl mx-auto">
                <h1 class="font-title text-2xl mb-3">Welcome to the 2022 Online Gathering !</h1>
                <p class="text-primary-red text-lg mb-10 font-subtitle">Here is a quick introduction video :</p>
                <video ref="introVideoPlayer" class="video-js vjs-big-play-centered" playsinline></video>
                <div @click="endIntroVideo" class="py-4 px-20 rounded bg-primary-red mt-5 text-white font-subtitle cursor-pointer">Continue to website</div>
            </div>
        </div>
    </div>

    <h1 class="font-title text-3xl mt-10 mb-5">Welcome {{ userStore.name ? userStore.name : "" }}</h1>

    <div v-if="gamesStore.games.length !== 0 && !isLoading">
        <div class="my-10">
            <div class="w-full max-w-3xl mx-auto bg-gray-300 rounded-full h-2.5 mt-5">
                <div class="bg-primary-red h-2.5 rounded-full" :style="`width: ${completedPercentage}%`"></div>
            </div>
            <div class="w-full text-center mx-auto font-subtitle text-primary-red mt-4 text-lg">
                <h2 v-if="completedPercentage !== 100">{{ userStore.viewedVideo.length }} out of {{ gamesStore.games.length }} videos completed !</h2>
                <h2 v-else>
                    🎉 Congratulations 🎉<br />
                    You've completed, all videos !
                </h2>
            </div>
        </div>

        <div v-if="!isLoading">
            <div class="my-10">
                <label class="font-title text-xl mr-2" for="categoryFilterSelect">Category :</label>
                <select class="border-b-2 border-primary-red p-1 font-subtitle" id="categoryFilterSelect" v-model="filterCategory">
                    <option value="">All</option>
                    <option v-for="category in gamesStore.getCategories">{{ category }}</option>
                </select>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-10">
                <GameCard @click="openGame(game._id)" v-for="game in filteredGames" :imgUrl="game.imgUrl" :category="game.category" :name="game.name" :id="game._id" />
            </div>
        </div>
    </div>
    <div v-if="!isLoading && gamesStore.games.length === 0">
        <h1 class="text-center text-2xl font-title mt-60 lg:mt-72 underline">There are no games to discover right now 😢, please come back later !</h1>
    </div>

    <div v-if="isLoading" class="h-[60vh] flex flex-col justify-center">
        <ClipLoader :loading="true" :color="'#E62953'" :size="'50px'" />
    </div>
</template>

<script>
import videojs from "video.js";
import {mapActions, mapGetters, mapStores} from "pinia";
import { useUserStore } from "@/stores/userStore";
import { useGameStore } from "@/stores/gamesStore";
import { useLogicStore } from "@/stores/logicStore";

import ClipLoader from "vue-spinner/src/ClipLoader.vue";
import GameCard from "@/components/GameCard.vue";

export default {
    components: { GameCard, ClipLoader },

    data() {
        return {
            isLoading: false,
            filterCategory: "",
        };
    },

    computed: {
        ...mapStores(useGameStore, useUserStore),

        completedPercentage() {
            return (this.userStore.viewedVideo.length / this.gamesStore.games.length) * 100;
        },

        filteredGames() {
            if (this.filterCategory === "") return this.gamesStore.games;
            else return this.gamesStore.games.filter(game => game.category === this.filterCategory);
        },
    },

    methods: {
        ...mapActions(useGameStore, ["getAllGames"]),
        ...mapActions(useLogicStore, ["newAlert"]),

        openGame(id) {
            this.$router.push({ name: `Game`, params: { id } });
        },

        endIntroVideo() {
            this.userStore
                .updateFirstVisit()
                .then(() => {
                    this.introPlayer.dispose();
                })
                .catch(error => {
                    this.newAlert("error", "A error occurred while closing the video, please try again later");
                });
        },
    },

    created() {
        if (this.gamesStore.games.length === 0) {
            this.isLoading = true;
            this.getAllGames()
                .then(() => {
                    this.isLoading = false;
                })
                .catch(error => {
                    this.newAlert("error", "A error occurred loading games, please try again later");
                });
        }

        if (this.userStore.firstVisit) {
            console.log("video created");
            this.$nextTick(function () {
                this.introPlayer = videojs(this.$refs.introVideoPlayer, {
                    autoplay: false,
                    controls: true,
                    fluid: true,
                    preload: "auto",
                    poster: "https://gathering.b-cdn.net/IntroCover.png",
                    sources: [
                        {
                            src: "https://vz-8b616db8-c84.b-cdn.net/b1de60e3-78d8-40f1-b065-4c10d09ecf9c/playlist.m3u8",
                            type: "application/x-mpegURL",
                        },
                    ],
                });
            });
        }

        this.userStore.$subscribe((mutation, state) => {
            if (state.firstVisit) {
                this.$nextTick(function () {
                    this.introPlayer = videojs(this.$refs.introVideoPlayer, {
                        autoplay: false,
                        controls: true,
                        fluid: true,
                        preload: "auto",
                        poster: "https://gathering.b-cdn.net/IntroCover.png",
                        sources: [
                            {
                                src: "https://vz-8b616db8-c84.b-cdn.net/b1de60e3-78d8-40f1-b065-4c10d09ecf9c/playlist.m3u8",
                                type: "application/x-mpegURL",
                            },
                        ],
                    });
                });
            }
        });
    },

    beforeDestroy() {
        if (this.introPlayer) {
            this.introPlayer.dispose();
        }
    },
};
</script>

<style scoped></style>
