<template>
    <div class="global-container h-20 flex bg-primary-red justify-between items-center font-title text-white text-lg">
        <router-link to="/">
            <img class="w-12" src="@/assets/img/Roquette-Lab-Picto-Blanc.png" alt="logo" />
        </router-link>
        <div class="flex items-center">
            <a href="mailto:contact@roquette-lab.fr?subject=Board Game Gallerie" class="cursor-pointer 2xl:text-xl" target="_blank">Contact Us</a>
            <LogoutIcon v-if="!isLoginPage" @click="logout" class="h-7 w-7 2xl:h-8 2xl:w-8 text-white ml-7 lg:ml-12 2xl:ml-20 cursor-pointer" />
        </div>
    </div>
</template>

<script>
import { LogoutIcon } from "@heroicons/vue/outline";
import { mapActions } from "pinia";
import { useUserStore } from "@/stores/userStore";

export default {
    components: { LogoutIcon },

    computed: {
        isLoginPage() {
            return this.$router.currentRoute.value.name === "Login";
        },
    },

    methods: {
        ...mapActions(useUserStore, ["reset"]),

        logout() {
            this.reset();
            localStorage.removeItem("userId");
            this.$router.push({ name: `Login` });
        },
    },
};
</script>

<style scoped></style>
