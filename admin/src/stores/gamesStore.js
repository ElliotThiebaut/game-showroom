import {defineStore} from "pinia";
import {useLogicStore} from "@/stores/logicStore";
import axios from "axios";

export const useGamesStore = defineStore('games', {
    state: () => ({
        games: []
    }),

    getters: {
        getNumberOfGames() {
            return this.games.length
        }
    },

    actions: {
        async fetchGames() {
            const logicStore = useLogicStore()

            try {
                const response = await axios
                    .get(`${import.meta.env.VITE_API_URL}/games`, {
                        headers: {
                            'Authorization': `KEY ${logicStore.key}`
                        }
                    })

                this.games = response.data
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },

        getIndexOfGame(id) {
            return this.games.findIndex(game => game._id === id);
        },

        async updateGame(id, gameData) {
            const logicStore = useLogicStore()

            try {
                const response = await axios
                    .put(`${import.meta.env.VITE_API_URL}/game/${id}`, gameData,{
                        headers: {
                            'Authorization': `KEY ${logicStore.key}`
                        }
                    })

                this.games[this.getIndexOfGame(id)] = gameData
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },

        async addGame(gameData) {
            const logicStore = useLogicStore()

            try {
                const response = await axios
                    .post(`${import.meta.env.VITE_API_URL}/game/`, gameData,{
                        headers: {
                            'Authorization': `KEY ${logicStore.key}`
                        }
                    })

                gameData._id = response.data._id
                this.games.push(gameData)
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },

        async deleteGame(id){
            const logicStore = useLogicStore()

            try {
                const response = await axios
                    .delete(`${import.meta.env.VITE_API_URL}/game/${id}`, {
                        headers: {
                            'Authorization': `KEY ${logicStore.key}`
                        }
                    })

                this.games.splice(this.getIndexOfGame(id), 1)
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },

        async updateGameCover(id, file){
            const logicStore = useLogicStore()

            let coverFormData = new FormData();
            coverFormData.append('cover', file)

            try {
                const response = await axios
                    .post(`${import.meta.env.VITE_API_URL}/cover/${id}`, coverFormData,{
                        headers: {
                            'Authorization': `KEY ${logicStore.key}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    })

                this.games[this.getIndexOfGame(id)].imgUrl = response.data.url
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },

        async updateGameVideo(id, file){
            const logicStore = useLogicStore()

            let videoFormData = new FormData();
            videoFormData.append('video', file)

            try {
                const response = await axios
                    .post(`${import.meta.env.VITE_API_URL}/video/${id}`, videoFormData,{
                        headers: {
                            'Authorization': `KEY ${logicStore.key}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    })

                this.games[this.getIndexOfGame(id)].videoUrl = response.data.url
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },
    }
})