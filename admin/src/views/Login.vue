<template>
  <div class="h-[85vh] flex flex-col justify-center lg:w-2/3 xl:w-1/2 3xl:w-1/3 mx-auto">
    <div class="mx-auto text-center mb-20">
      <h1 class="font-title text-primary-red text-2xl">Please enter secret key</h1>
    </div>
    <form class="p-5 flex flex-col w-full" @submit.prevent="onSubmit">
      <label for="key" class="font-subtitle text-xl mb-3">Secret Key</label>
      <input type="text" placeholder="..." id="key" v-model="formKey" class="border-b-primary-red border-b-2 mb-3">
      <input type="submit" value="Connexion" class="bg-primary-red p-2 font-title text-white cursor-pointer">
      <div class="bg-yellow-400/70 font-subtitle text-center rounded-lg mt-5 p-3" v-if="formError">{{ formError }}</div>
    </form>
  </div>
</template>

<script>
import {mapStores} from 'pinia';
import {useLogicStore} from "@/stores/logicStore";


export default {
  props: ['errorPassed'],

  data() {
    return {
      formKey: '',
      formError: this.errorPassed
    }
  },

  computed: {
    ...mapStores(useLogicStore)
  },

  methods: {
    onSubmit() {
      this.logicStore.checkKey(this.formKey)
        .then(() => {
          this.formKey = ''
          this.formError = ''
          this.$router.push({ name: `Users`})
        })
        .catch((error) => {
          if (error.message === '401') {
            this.formKey = ''
            this.formError = 'Wrong Key, please try again'
          } else {
            this.formKey = ''
            this.formError = 'Server Error, please try again later'
          }
        })
    }
  }
}
</script>

<style scoped>

</style>
