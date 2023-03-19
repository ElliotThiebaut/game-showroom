<template>
  <div class="global-container h-20 flex bg-primary-red justify-between items-center font-title text-white text-lg">
    <img class="w-12" src="@/assets/img/Roquette-Lab-Picto-Blanc.png" alt="logo">
    <div class="flex" v-if="!isLoginPage">
      <router-link class="text-white mr-5 lg:mr-10" to="/users">Users</router-link>
      <router-link class="text-white mr-5 lg:mr-10" to="/answers">Answers</router-link>
      <router-link class="text-white" to="/games">Games</router-link>
    </div>
  </div>
</template>

<script>
import {LogoutIcon} from '@heroicons/vue/outline'

export default {
  components: {LogoutIcon},
  name: "Navbar",

  computed: {
    isLoginPage() {
      return this.$route.name === 'Login'
    }
  }
}
</script>

<style scoped>

</style>