import {defineStore} from "pinia";
import axios from "axios";
import {useLogicStore} from "@/stores/logicStore";
import {useGamesStore} from "@/stores/gamesStore";

export const useUsersStore = defineStore('users', {
    state: () => ({
        users: []
    }),

    getters: {
        getNumberOfUsers() {
          return this.users.length
        },

        getNumberOfFirstVisitUser() {
          return this.users.filter(value => value.firstVisit === false).length
        },

        getNumberOfOneVideoUser() {
            const gamesStore = useGamesStore()
            if (gamesStore.getNumberOfGames === 0) {
                return 'N/A'
            } else {
                return this.users.filter(value => value.viewedVideo.length >= 1).length
            }
        },

        getNumberOfHalfVideoUser() {
            const gamesStore = useGamesStore()
            if (gamesStore.getNumberOfGames === 0) {
                return 'N/A'
            } else {
                return this.users.filter(value => value.viewedVideo.length >= gamesStore.getNumberOfGames / 2).length
            }
        },

        getNumberOfAllVideoUser() {
            const gamesStore = useGamesStore()
            if (gamesStore.getNumberOfGames === 0) {
                return 'N/A'
            } else {
                return this.users.filter(value => value.viewedVideo.length === gamesStore.getNumberOfGames).length
            }
        },

        getTableUserData() {
          let data = JSON.parse(JSON.stringify(this.users))
          for (const object of data) {
              object.firstVisit = !object.firstVisit
              delete object['_id']
              delete object['timestamp']
              delete object['viewedVideo']
          }
          return data
      }
    },

    actions: {
        async exportUser() {
            const logicStore = useLogicStore()
            try {
                const response = await axios
                    .get(`${import.meta.env.VITE_API_URL}/users?export=true`, {
                        responseType: 'blob',
                        headers: {
                            'Authorization': `KEY ${logicStore.key}`
                        }
                    })

                window.open(URL.createObjectURL(response.data));
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },

        async fetchUsers() {
            const logicStore = useLogicStore()

            try {
                const response = await axios
                    .get(`${import.meta.env.VITE_API_URL}/users`, {
                        headers: {
                            'Authorization': `KEY ${logicStore.key}`
                        }
                    })

                this.users = response.data
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },

        async deleteUser(email) {
            const logicStore = useLogicStore()

            try {
                const response = await axios
                    .delete(`${import.meta.env.VITE_API_URL}/user/${this.users[this.users.findIndex(user => user.email === email)]._id}`, {
                        headers: {
                            'Authorization': `KEY ${logicStore.key}`
                        }
                    })

                this.users.splice(this.users.findIndex(user => user.email === email) , 1)
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        }
    }
})