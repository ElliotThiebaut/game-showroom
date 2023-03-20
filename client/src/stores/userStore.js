import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
    state: () => ({
        id: "",
        email: "",
        name: "",
        firstVisit: false,
        viewedVideo: [],
    }),

    actions: {
        reset() {
            this.id = "";
            this.email = "";
            this.name = "";
            this.firstVisit = false;
            this.viewedVideo = [];
        },

        async registerUser(formData) {
            try {
                console.log("Register 2");
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/register`,
                    {
                        email: formData.formRegisterEmail,
                        name: formData.formRegisterName,
                        surname: formData.formRegisterSurname,
                        company: formData.formRegisterCompany,
                        country: formData.formRegisterCountry,
                        service: formData.formRegisterService,
                    },
                    {
                        headers: {
                            Authorization: `KEY ${import.meta.env.VITE_DB_GATHERING_KEY}`,
                        },
                    },
                );
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },

        async getUser(formEmail, localId) {
            if (formEmail) {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/user?email=${formEmail}`, {
                        headers: {
                            Authorization: `KEY ${import.meta.env.VITE_DB_GATHERING_KEY}`,
                        },
                    });

                    localStorage.setItem("userId", response.data._id);
                    this.id = response.data._id;
                    this.name = response.data.name;
                    this.email = response.data.email;
                    this.firstVisit = response.data.firstVisit;
                    this.viewedVideo = response.data.viewedVideo;
                } catch (error) {
                    throw new Error(error.response.status.toString());
                }
            } else if (localId) {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/user?id=${localStorage.getItem("userId")}`, {
                        headers: {
                            Authorization: `KEY ${import.meta.env.VITE_DB_GATHERING_KEY}`,
                        },
                    });

                    localStorage.setItem("userId", response.data._id);
                    this.id = response.data._id;
                    this.name = response.data.name;
                    this.email = response.data.email;
                    this.firstVisit = response.data.firstVisit;
                    this.viewedVideo = response.data.viewedVideo;
                } catch (error) {
                    throw new Error(error.response.status.toString());
                }
            }
        },

        async addViewedVideo(addedGameId) {
            try {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/user/video/${this.id}/${addedGameId}`,
                    {},
                    {
                        headers: {
                            Authorization: `KEY ${import.meta.env.VITE_DB_GATHERING_KEY}`,
                        },
                    },
                );

                this.viewedVideo.push(addedGameId);
                return "success";
            } catch (e) {
                throw Error;
            }
        },

        async deleteViewedVideo(deletedGameId) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/user/video/${this.id}/${deletedGameId}`, {
                    headers: {
                        Authorization: `KEY ${import.meta.env.VITE_DB_GATHERING_KEY}`,
                    },
                });

                const indexVideo = this.viewedVideo.indexOf(deletedGameId);
                this.viewedVideo.splice(indexVideo, 1);
                return "success";
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },

        async updateFirstVisit() {
            try {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/user/firstvisit/${this.id}?status=false`,
                    {},
                    {
                        headers: {
                            Authorization: `KEY ${import.meta.env.VITE_DB_GATHERING_KEY}`,
                        },
                    },
                );

                this.firstVisit = false;
                return "success";
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        },
    },
});
