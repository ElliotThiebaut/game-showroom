import { defineStore } from "pinia";
import { clerk } from "@/clerk";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
    const user = ref(clerk.user)

    return { user };
});
