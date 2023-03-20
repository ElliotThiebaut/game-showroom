import { defineStore } from "pinia";
import { useUsersStore } from "@/stores/usersStore";
import { useGamesStore } from "@/stores/gamesStore";
import axios from "axios";

export const useLogicStore = defineStore("logic", {
    state: () => ({
        key: "",
        alertHandler: {
            isError: false,
            level: "error",
            message: "A error occurred, please try again later",
        },
    }),

    actions: {
        async checkKey(formKey) {
            const gamesStore = useGamesStore();
            const userStore = useUsersStore();

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                    headers: {
                        Authorization: `KEY ${formKey}`,
                    },
                });

                localStorage.setItem("gatheringKey", formKey);
                this.key = formKey;
                gamesStore.fetchGames();
                userStore.users = response.data;
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },

        newAlert(level, message) {
            this.alertHandler.level = level;
            this.alertHandler.message = message;
            this.alertHandler.isError = true;
        },
    },
});
