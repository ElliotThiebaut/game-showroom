<template>
    <div class="my-5">
        <video @timeupdate="videoStop" ref="videoPlayer" class="video-js vjs-big-play-centered" playsinline></video>
    </div>
</template>

<script>
import videojs from "video.js";
import { mapState, mapStores } from "pinia";
import { useGameStore } from "@/stores/gamesStore";
import { useUserStore } from "@/stores/userStore";
import { useLogicStore } from "@/stores/logicStore";

export default {
    name: "videoPlayer",

    props: {
        gameIndex: Number,
        closedModal: Boolean,
        launchQuestion: Boolean,
    },

    data() {
        return {
            player: null,
            currentVideoStop: 0,
            options: {
                autoplay: false,
                controls: true,
                fluid: true,
                preload: "auto",
                poster: String,
                sources: [
                    {
                        src: String,
                        type: "application/x-mpegURL",
                    },
                ],
            },
        };
    },

    computed: {
        ...mapState(useUserStore, ["viewedVideo"]),
        ...mapState(useLogicStore, ["alertHandler"]),
        ...mapStores(useGameStore),
    },

    methods: {
        videoStop() {
            // Pause the player on error
            if (this.alertHandler.isError && !this.player.paused()) {
                this.player.pause();
            }

            // Check if video stops should be displayed
            if (!this.viewedVideo.includes(this.gamesStore.games[this.gameIndex]._id)) {
                // Check with timestamp if it is time to show QuestionModal and if video is not already paused
                if (
                    this.currentVideoStop <= this.gamesStore.games[this.gameIndex].videoStops.length - 1 &&
                    Math.trunc(this.player.currentTime()) >= this.gamesStore.games[this.gameIndex].videoStops[this.currentVideoStop].timestamp &&
                    !this.player.paused()
                ) {
                    this.player.pause();
                    if (this.player.isFullscreen()) {
                        this.player.exitFullscreen();
                    }
                    this.$emit("videoStop", this.currentVideoStop);
                    this.currentVideoStop++;
                }

                // Check if we should show the last QuestionModal and if video is not already paused
                if (this.currentVideoStop === this.gamesStore.games[this.gameIndex].videoStops.length && !this.player.paused()) {
                    this.player.pause();
                    if (this.player.isFullscreen()) {
                        this.player.exitFullscreen();
                    }
                    this.$emit("lastVideoStop", this.currentVideoStop - 1);
                    this.currentVideoStop++;
                }
            }
        },
    },

    watch: {
        closedModal() {
            if (this.closedModal) {
                this.player.play();
                this.$emit("videoResumed");
            }
        },

        launchQuestion() {
            if (this.launchQuestion) {
                this.player.currentTime(this.player.duration() - 1);
                this.player.play();
            }
        },
    },

    mounted() {
        this.options.poster = this.gamesStore.games[this.gameIndex].imgUrl;
        this.options.sources[0].src = this.gamesStore.games[this.gameIndex].videoUrl;

        this.player = videojs(this.$refs.videoPlayer, this.options);
    },

    beforeDestroy() {
        if (this.player) {
            this.player.dispose();
        }
    },
};
</script>

<style scoped></style>
