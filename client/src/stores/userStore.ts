import { defineStore } from "pinia";
import { clerk } from "@/clerk";

export const useUserStore = defineStore("user", () => {
    const user = clerk.user

    return { user };
});
