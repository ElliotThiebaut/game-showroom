import { defineStore } from "pinia";

export const useLogicStore = defineStore('logic', {
    state: () => ({
        alertHandler: {
            isError: false,
            level: 'error',
            message: 'A error occurred, please try again later'
        }
    }),

    actions: {
        newAlert(level, message) {
            this.alertHandler.level = level
            this.alertHandler.message = message
            this.alertHandler.isError = true
        }
    },
})