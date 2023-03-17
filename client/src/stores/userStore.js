import {defineStore} from "pinia";
import axios from "axios";

export const useUserStore = defineStore('user', {
    state: () => ({
        isGuest: false,
        id: '',
        email: '',
        name: '',
        firstVisit: false,
        viewedVideo: [],
    }),

    actions: {
        reset() {
            this.isGuest = false
            this.id = ''
            this.email = ''
            this.name = ''
            this.firstVisit = false
            this.viewedVideo = []
        },

        async getUser(formEmail, localId) {
            if (formEmail) {
                try {
                    const response =
                        await axios
                            .get(`${import.meta.env.VITE_API_URL}/user?email=${formEmail}`, {
                                headers: {
                                    'Authorization':  'KEY uJ4cN0kZ7Q1kn98NzTYzngoLX7YUsWh7'
                                }
                            })

                    localStorage.setItem('userId', response.data._id);
                    this.id = response.data._id
                    this.name = response.data.name
                    this.email = response.data.email
                    this.firstVisit = response.data.firstVisit
                    this.viewedVideo = response.data.viewedVideo
                } catch (error) {
                    throw new Error(error.response.status.toString());
                }
            } else if (localId) {
                try {
                    const response =
                        await axios
                            .get(`${import.meta.env.VITE_API_URL}/user?id=${localStorage.getItem('userId')}`, {
                                headers: {
                                    'Authorization':  'KEY uJ4cN0kZ7Q1kn98NzTYzngoLX7YUsWh7'
                                }
                            })

                    localStorage.setItem('userId', response.data._id);
                    this.id = response.data._id
                    this.name = response.data.name
                    this.email = response.data.email
                    this.firstVisit = response.data.firstVisit
                    this.viewedVideo = response.data.viewedVideo

                }
                catch (error) {
                    throw new Error(error.response.status.toString());
                }
            }
        },

        async addViewedVideo(addedGameId) {
            try {
                await axios
                    .put(`${import.meta.env.VITE_API_URL}/user/video/${this.id}/${addedGameId}`, {}, {
                        headers: {
                            'Authorization':  'KEY uJ4cN0kZ7Q1kn98NzTYzngoLX7YUsWh7'
                        }
                    })

                this.viewedVideo.push(addedGameId)
                return 'success'
            }
            catch (e) {
                throw Error
            }
        },

        async deleteViewedVideo(deletedGameId){
            try {
                await axios
                    .delete(`${import.meta.env.VITE_API_URL}/user/video/${this.id}/${deletedGameId}`, {
                        headers: {
                            'Authorization':  'KEY uJ4cN0kZ7Q1kn98NzTYzngoLX7YUsWh7'
                        }
                    })

                const indexVideo = this.viewedVideo.indexOf(deletedGameId);
                this.viewedVideo.splice(indexVideo, 1)
                return 'success'
            }
            catch (error) {
                throw new Error(error.response.status.toString());
            }
        },

        async updateFirstVisit(){
            try {
                await axios
                    .put(`${import.meta.env.VITE_API_URL}/user/firstvisit/${this.id}?status=false`, {}, {
                        headers: {
                            'Authorization':  'KEY uJ4cN0kZ7Q1kn98NzTYzngoLX7YUsWh7'
                        }
                    })

                this.firstVisit = false
                return 'success'
            }
            catch (error) {
                throw new Error(error.response.status.toString());
            }
        }
    }
})