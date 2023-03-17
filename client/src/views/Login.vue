<template>
  <div class="h-[60vh] flex flex-col justify-center lg:w-2/3 xl:w-1/2 3xl:w-1/3 mx-auto">
    <div class="mx-auto text-center mb-20">
      <h1 class="font-title text-primary-red text-2xl">Welcome to the 2022 Gathering !</h1>
    </div>
    <div class="p-5 flex flex-col w-full">
      <form @submit.prevent="loginSubmit" class="flex flex-col">
        <label for="email" class="font-subtitle text-xl mb-3">Email</label>
        <input type="email" placeholder="mail@company.com" id="email" v-model="formEmail" class="border-b-primary-red border-b-2 mb-3">
        <input type="submit" value="Connexion" class="bg-primary-red p-2 font-title text-white cursor-pointer">
      </form>

          <!--  Disabled guest login temporarily  -->
          <!--  <button @click="loginGuest" class="border-2 border-primary-red p-2 font-title cursor-pointer mt-3 text-primary-red">Enter as Guest</button>  -->

        <p class="my-5 font-subtitle text-primary-red">Dont have a account ? <a href="https://register.blueorange.events" target="_blank" class="underline decoration-2 underline-offset-2">Register here</a></p>
      <div class="bg-yellow-400/70 font-subtitle text-center rounded-lg mt-5 p-3" v-if="formError">{{ formError }}</div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState, mapWritableState} from 'pinia';
import {useUserStore} from "@/stores/userStore";

export default {

  props: ['errorPassed'],

  data() {
    return {
      formEmail: '',
      formError: this.errorPassed
    }
  },

  computed: {
    ...mapState(useUserStore, ['id']),
    ...mapWritableState(useUserStore, ['isGuest'])
  },

  methods: {
    ...mapActions(useUserStore, ['getUser']),

    loginSubmit() {
      this.getUser(this.formEmail, '')
        .then(() => {
          this.formEmail = ''
          this.formError = ''
          this.$router.push({ name: `Home`})
        })
        .catch((err) => {
          this.formEmail = ''
          if (err.message === '404') {
            this.formError = "We didn't find this email, please try again"
          } else {
            this.formError = 'Server Error, please try again later'
          }
        })
    },

    //  Disabled guest login temporarily

    // loginGuest() {
    //   this.isGuest = true
    //   this.$router.push({ name: `Home`})
    // }

  },

  created() {
    if (this.id){
      this.$router.push({ name: `Home`})
    }
  }

}
</script>

<style scoped>

</style>
