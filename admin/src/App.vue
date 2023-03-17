<template>
  <Alert v-if="logicStore.alertHandler.isError" />
  <Navbar />
  <div class="global-container pb-20">
    <router-view />
  </div>
  <Footer class="absolute bottom-0" />
</template>

<script>
import Navbar from '@/components/Navbar.vue';
import Footer from "@/components/Footer.vue";
import Alert from "@/components/Alert.vue";
import {mapStores} from 'pinia';
import {useUsersStore} from "@/stores/usersStore";
import {useLogicStore} from "@/stores/logicStore";

export default {
  components: {Navbar, Footer, Alert},

  computed: {
    ...mapStores(useUsersStore, useLogicStore)
  },

  created() {
    // Removing error modal after 3.5 seconds
    this.logicStore.$subscribe(((mutation, state) => {
      if (state.alertHandler.isError) {
        setTimeout(() => {
          this.logicStore.alertHandler.isError = false
        }, 3500)
      }
    }))

    if (!this.logicStore.key) {
      if (localStorage.getItem('gatheringKey')) {
        this.logicStore.checkKey(localStorage.getItem('gatheringKey'))
            .catch((e) => {
              this.$router.push({ name: `Login`, params: {errorPassed: 'Session Expired, please login again' }})
            })
      } else {
        this.$router.push({ name: `Login`})
      }
    }
  },

}
</script>

<style>
.global-container {
  @apply mx-auto px-7 lg:px-12 xl:px-16 2xl:px-20 3xl:px-32
}

.router-link-active{
  @apply underline-offset-4 underline decoration-2
}

#app{
  min-height: 100vh;
  position: relative;
}

/* Importing fonts */
@font-face {
  font-family: Exo;
  src: url("assets/fonts/Exo-Bold.ttf") format("truetype");
  font-weight: 700;
  font-style: normal;
}
@font-face {
  font-family: Heebo;
  src: url("assets/fonts/Heebo-Medium.ttf") format("truetype");
  font-weight: 500;
  font-style: normal;
}
@font-face {
  font-family: 'Source Sans Pro';
  src: url("assets/fonts/SourceSansPro-Bold.otf") format("opentype");
  font-weight: 500;
  font-style: normal;
}
@font-face {
  font-family: 'Source Sans Pro';
  src: url("assets/fonts/SourceSansPro-Regular.otf") format("opentype");
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: 'Source Sans Pro';
  src: url("assets/fonts/SourceSansPro-Semibold.otf") format("opentype");
  font-weight: 600;
  font-style: normal;
}
</style>
