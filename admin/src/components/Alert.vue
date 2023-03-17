<template>
  <div :class="bgColor" class="left-1/2 -translate-x-1/2 fixed top-10 p-4 p-3 text-center z-50 font-text text-lg text-white backdrop-blur-lg rounded-lg">
    <p @click="closeError" class="cursor-pointer">{{ alertHandler.message }}</p>
  </div>
</template>

<script>
import {mapWritableState} from "pinia";
import {useLogicStore} from "@/stores/logicStore";

export default {

  computed: {
    ...mapWritableState(useLogicStore, ['alertHandler']),

    bgColor() {
      switch (this.alertHandler.level) {
        case 'success':
          return 'bg-green-600/90'
        case 'info':
          return 'bg-blue-600/90'
        case 'warning':
          return 'bg-yellow-400/90'
        case 'error':
          return 'bg-yellow-600/90'
      }
    }
  },

  methods: {
    closeError() {
      this.alertHandler.isError = false
    }
  }
}
</script>

<style scoped>

</style>