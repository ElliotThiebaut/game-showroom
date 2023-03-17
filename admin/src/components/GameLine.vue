<template>
  <div class="flex w-full justify-between">
    <div class="flex items-center">
      <ExclamationIcon v-if="isGameIncomplete" class="h-8 w-8 text-yellow-500 mr-3"/>
      <div>
        <h1 class="font-title text-xl lg:text-2xl" :class="isGameIncomplete ? 'text-yellow-600' : 'text-black'">{{ game.name }}</h1>
        <p class="text-yellow-600 font-text" v-if="isGameIncomplete">Missing information (not active in app)</p>
      </div>
    </div>
    <div class="flex justify-between items-center">
      <PencilIcon @click="$emit('openGameEditor', gameIndex)" class="h-7 w-7 text-blue-600 justify-center items-center mr-5 cursor-pointer" />
      <TrashIcon @click="$emit('deleteGame', gameIndex)" class="h-7 w-7 text-red-600 justify-center items-center cursor-pointer" />
    </div>
  </div>
</template>

<script>
import {mapState} from "pinia";
import {useGamesStore} from "@/stores/gamesStore";
import {PencilIcon} from "@heroicons/vue/solid";
import {TrashIcon} from "@heroicons/vue/solid";
import {ExclamationIcon} from "@heroicons/vue/outline";

export default {
  components: {PencilIcon, TrashIcon, ExclamationIcon},

  props: {
    gameIndex: Number
  },

  computed: {
    ...mapState(useGamesStore, ['games']),

    game() {
      return this.games[this.gameIndex]
    },

    isGameIncomplete() {
      return !this.game.videoUrl || !this.game.imgUrl
    }
  }
}
</script>

<style scoped>

</style>