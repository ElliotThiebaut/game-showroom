<template>
  <!-- Question modal -->
  <GameQuestionModal @close-modal="closeQuestionModal" :game-id="gamesStore.games[gameIndex]._id" :lastVideoStop="lastVideoStop" :questions="gamesStore.games[gameIndex].videoStops[videoStop].questions" v-if="questionModalVisibility" />

  <!-- Quitting confirmation modal -->
  <div v-if="isConfirmBackModal && !isGuest">
    <div class="backdrop-blur-sm bg-gray-600/50 overflow-auto py-10 lg:px-20 xl:px-40 2xl:px-72 3xl:px-[35rem] px-5 fixed z-10 inset-0 w-full h-screen">
      <div class="bg-primary-red text-white text-center rounded-md px-5 lg:px-10 py-10 mt-44 max-w-lg mx-auto">
        <h1 class="font-title text-xl">Your feedback is important to us !</h1>
        <p class="my-10 font-text text-lg">You haven't answered all the questions about the game, are you sure you want to quit ?</p>
        <div class="flex justify-between">
          <div @click="backHomepage(true)" class="bg-white text-primary-red px-14 py-3 mr-2 rounded cursor-pointer font-subtitle shadow-lg">Yes</div>
          <div @click="isConfirmBackModal = false" class="border-2 border-white text-white px-14 py-3 ml-2 rounded cursor-pointer font-subtitle shadow-lg">No</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Page body -->
  <div v-if="!isLoading">
    <div class="flex my-10 lg:mb-0 items-center">
      <div @click="backHomepage(false)" class="cursor-pointer">
        <ArrowCircleLeftIcon class="h-8 w-8"/>
      </div>
      <h1 class="text-3xl font-title ml-5">{{ gamesStore.games[gameIndex].name }}</h1>
    </div>

    <div class="max-w-3xl mx-auto lg:py-8 lg:pt-0">
      <div v-if="isViewed" class="flex items-center lg:mt-10 cursor-pointer" @click="deleteVideo">
        <ExclamationIcon class="h-10 w-10 text-yellow-500 mr-5"/>
        <p class="font-subtitle text-xl text-yellow-500">You've answered the questions for this video, <span class="underline">answer again</span> ?</p>
      </div>

      <video-player @last-video-stop="showLastQuestionModal" @video-stop="showQuestionModal" @video-resumed="videoResumed" :closedModal="closedModal" :launchQuestion="launchQuestion" :gameIndex="gameIndex"/>

      <div class="font-subtitle text-lg lg:text-xl my-5 lg:my-10 mb-10">
          <div class="flex flex-col-reverse lg:flex-row justify-between lg:mb-10">
              <div>
                  <p>Designed by <span class="font-bold text-primary-red">{{ gamesStore.games[gameIndex].designer.join(', ') }}</span></p>
                  <p>Illustrated by by <span class="font-bold text-primary-red">{{ gamesStore.games[gameIndex].illustrator.join(', ') }}</span></p>
              </div>
              <div v-if="!isViewed" class="flex items-center w-full lg:w-1/3 my-5 lg:my-0">
                  <div @click="launchAllQuestions" class="text-white py-3 rounded cursor-pointer font-subtitle bg-primary-red shadow-lg cursor-pointer w-full text-center">Answer questions now ?</div>
              </div>
          </div>

        <p class="text-md lg:text-lg mt-5 font-text">{{ gamesStore.games[gameIndex].description }}</p>
      </div>
    </div>
  </div>

  <!-- Loading body -->
  <div v-if="isLoading" class="h-[50vh] flex flex-col justify-center">
    <ClipLoader :loading="true" :color="'#E62953'" :size="'50px'"/>
  </div>
</template>

<script>
import {mapStores, mapState, mapActions} from "pinia";
import {useGameStore} from "@/stores/gamesStore";
import {useUserStore} from "@/stores/userStore";

import {ArrowCircleLeftIcon} from "@heroicons/vue/outline";
import {ExclamationIcon} from "@heroicons/vue/outline";
import videoPlayer from "@/components/videoPlayer.vue";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import GameQuestionModal from "@/components/GameQuestionModal.vue";
import {useLogicStore} from "@/stores/logicStore";

export default {
  components: {ArrowCircleLeftIcon, videoPlayer, ClipLoader, GameQuestionModal, ExclamationIcon},

  data() {
    return {
      isLoading: true,
      isConfirmBackModal: false,
      questionModalVisibility: false,
      closedModal: false,
      launchQuestion: false,
      videoStop: 0,
      lastVideoStop: false,
      gameIndex: Number
    }
  },

  computed: {
    ...mapStores(useGameStore),
    ...mapState(useUserStore, ['isGuest', 'viewedVideo', 'firstVisit']),

    isViewed() {
      return !this.isGuest && this.viewedVideo.includes(this.gamesStore.games[this.gameIndex]._id);
    }
  },

  methods: {
    ...mapActions(useLogicStore, ['newAlert']),
    ...mapActions(useUserStore, ['deleteViewedVideo']),

    showQuestionModal(videoStopNumber) {
      this.videoStop = videoStopNumber
      this.questionModalVisibility = true
    },

    showLastQuestionModal(videoStopNumber) {
      this.lastVideoStop = true
      this.videoStop = videoStopNumber
      this.questionModalVisibility = true
    },

    closeQuestionModal() {
      this.closedModal = true
      this.questionModalVisibility = false
    },

    videoResumed() {
      this.closedModal = false
    },

    deleteVideo() {
      this.deleteViewedVideo(this.gamesStore.games[this.gameIndex]._id)
          .catch((e) => {
            this.newAlert('error', 'A error occurred, please try again later')
          })
    },

    backHomepage(confirmed) {
      if (this.isViewed || this.isGuest || confirmed) {
        this.$router.push({ name: `Home`})
      } else {
        this.isConfirmBackModal = true
      }
    },

    launchAllQuestions() {
        this.launchQuestion = true
    }
  },

  watch: {
    questionModalVisibility() {
      if (this.questionModalVisibility === true) {
        document.documentElement.style.overflow = 'hidden'
      } else {
        document.documentElement.style.overflow = 'auto'
      }
    }
  },

  created() {
    if (this.gamesStore.games.length === 0) {
      this.gamesStore.getAllGames()
          .then(() => {
            this.gameIndex = this.gamesStore.getGameIndex(this.$route.params.id)
            this.isLoading = false
          })
          .catch((error) => {
            this.newAlert('error', 'A error occurred loading game data, please try again later')
          })
    } else {
      this.gameIndex = this.gamesStore.getGameIndex(this.$route.params.id)
      this.isLoading = false
    }

    if (!this.isGuest && this.firstVisit) {
      this.$router.push({ name: `Home`})
    }
  }
}
</script>

<style scoped>

</style>