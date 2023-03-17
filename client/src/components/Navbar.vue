<template>
  <div class="global-container h-16 flex bg-primary-red justify-between items-center font-title text-white text-lg">
    <router-link to="/">
      <img class="w-12" src="@/assets/img/logoWhite.png" alt="logo">
    </router-link>
    <div class="flex items-center">
      <a href="mailto:info@blueorangegames.eu?subject=Webapp Gathering - &cc=elliot.thiebaut@blueorangegames.eu" class="cursor-pointer 2xl:text-xl">Contact Us</a>
      <LogoutIcon @click="logout" class="h-7 w-7 2xl:h-8 2xl:w-8 text-white ml-7 lg:ml-12 2xl:ml-20 cursor-pointer"/>
    </div>
  </div>
</template>

<script>
import {LogoutIcon} from '@heroicons/vue/outline'
import {mapActions} from 'pinia'
import {useUserStore} from "@/stores/userStore";

export default {
  components: {LogoutIcon},

  methods: {
    ...mapActions(useUserStore, ['reset']),

    logout() {
      this.reset()
      localStorage.removeItem('userId')
      this.$router.push({ name: `Login` })
    }
  }
}
</script>

<style scoped>

</style>