import { defineStore } from "pinia";
import axios from "axios";

export const useGameStore = defineStore("games", {
    state: () => ({
        games: [],
    }),

    getters: {
        getCategories() {
            return Array.from(new Set(this.games.map(game => game.category)));
        },
    },

    actions: {
        async getAllGames() {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/games`, {
                    headers: {
                        Authorization: `KEY ${import.meta.env.VITE_DB_GATHERING_KEY}`,
                    },
                });

                for (const game of response.data) {
                    if (game.videoUrl && game.imgUrl) {
                        this.games.push(game);
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
                await axios.post(`${import.meta.env.VITE_API_URL}/answer/${userId}/${gameId}`, answersData, {
                    headers: {
                        Authorization: `KEY ${import.meta.env.VITE_DB_GATHERING_KEY}`,
                    },
                });
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },
    },
});
