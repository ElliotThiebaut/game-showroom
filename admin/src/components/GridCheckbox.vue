<template>
  <div class="w-full h-full flex items-center justify-center">
    <TrashIcon @click="clickTrash" class="w-5 h-5 text-red-600 cursor-pointer"/>
  </div>
</template>

<script>
import {TrashIcon} from "@heroicons/vue/solid";
import {mapActions} from "pinia";
import {useUsersStore} from "@/stores/usersStore";
import {useLogicStore} from "@/stores/logicStore";

export default {
  props: ["model"],

  components: {TrashIcon},

  methods: {
    ...mapActions(useUsersStore, ['deleteUser']),
    ...mapActions(useLogicStore, ['newAlert']),

    clickTrash() {
      this.deleteUser(this.model.email)
          .then(() => {
            this.newAlert('success', 'User Deleted !')
          })
          .catch((error) => {
            this.newAlert('error', 'A error occurred, please try again later')
          })
    }
  }
}
</script>

<style scoped>

</style>