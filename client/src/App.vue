<template>
  <Alert v-if="logicStore.alertHandler.isError"/>
  <Navbar />

  <div class="global-container pb-20">
    <router-view />
  </div>

  <Footer class="absolute bottom-0" />
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from "@/components/Footer.vue";
import Alert from "@/components/Alert.vue";
import {useUserStore} from "@/stores/userStore";
import {useGameStore} from "@/stores/gamesStore";
import {useLogicStore} from "@/stores/logicStore";
import {mapActions, mapStores} from "pinia";

export default {
  components: {Navbar, Footer, Alert},

  computed: {
    ...mapStores(useUserStore),
    ...mapStores(useGameStore),
    ...mapStores(useLogicStore)
  },

  methods: {
    ...mapActions(useUserStore, ['getUser'])
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

    // Fetching user from API if no user data
    if (!this.isGuest && !this.userStore.id) {
      if (localStorage.getItem('userId')) {
        this.getUser('', localStorage.getItem('userId'))
            .then(() => {
              if (this.$route.name === 'Login') {
                this.$router.push({ name: `Home`})
              }
            })
            .catch((error) => {
              this.$router.push({ name: `Login`, params: {errorPassed: 'Session Expired, please login again' }})
            })
      } else {
        this.$router.push({ name: `Login` })
      }
    }
  }
}
</script>

<style>
.global-container {
  @apply mx-auto px-7 lg:px-12 xl:px-16 2xl:px-20 3xl:px-32
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

#app{
  min-height: 100vh;
  position: relative;
}
</style>
