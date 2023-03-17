<template>
  <div class="my-14 rounded shadow-lg shadow-primary-red/30 py-5 px-3 bg-primary-red text-white font-text lg:text-lg flex flex-col lg:flex-row justify-between">
    <div>
      <p>Total number of users : <span class="font-bold text-lg lg:text-xl font-title">{{ getNumberOfUsers }}</span></p>
    </div>
    <div @click="exportUser" class="w-full text-center mt-10 lg:mt-0 lg:w-auto bg-white rounded font-subtitle text-lg text-primary-red py-2 lg:px-5 flex justify-center items-center cursor-pointer">
      <p>Export</p>
    </div>
  </div>
</template>

<script>
import {mapState, mapActions} from 'pinia';
import {useUsersStore} from "@/stores/usersStore";

export default {
  name: "UserCard",

  computed: {
    ...mapState(useUsersStore, ['getNumberOfUsers'])
  },

  methods: {
    ...mapActions(useUsersStore, ['exportUser'])
  }
}
</script>

<style scoped>

</style>