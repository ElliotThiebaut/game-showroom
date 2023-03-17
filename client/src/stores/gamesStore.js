import { defineStore } from "pinia";
import axios from "axios";

export const useGameStore = defineStore('games', {
    state: () => ({
        games: []
    }),

    actions: {
        async getAllGames() {
            try {
                const response =
                    await axios
                        .get(`${import.meta.env.VITE_API_URL}/games`, {
                            headers: {
                                'Authorization':  'KEY uJ4cN0kZ7Q1kn98NzTYzngoLX7YUsWh7'
                            }
                        })

                for (const game of response.data) {
                    if (game.videoUrl && game.imgUrl) {
                        this.games.push(game)
                    }
                }

            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },

        getGameIndex(id) {
            return this.games.findIndex(game => game._id === id);
        },

        async postAnswer(userId, gameId, answersData) {
            try {
                await axios
                    .post(`${import.meta.env.VITE_API_URL}/answer/${userId}/${gameId}`, answersData, {
                        headers: {
                            'Authorization':  'KEY uJ4cN0kZ7Q1kn98NzTYzngoLX7YUsWh7'
                        }
                    })
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        }
    },
})