<template>
    <div class="backdrop-blur-sm bg-gray-800/50 overflow-auto py-10 lg:px-20 xl:px-40 2xl:px-72 3xl:px-[35rem] px-5 fixed z-10 inset-0 w-full h-screen">
        <div class="bg-white rounded-md px-5 lg:px-10 py-10">
            <form @submit.prevent="close" method="post">
                <div v-if="!lastVideoStop" v-for="(question, index) in questions" class="flex flex-col my-10">
                    <label :for="index" class="font-subtitle text-primary-red text-md lg:text-xl">{{ question.question }}</label>

                    <select v-model="userAnswers[index]" :id="index" required class="mt-2 cursor-pointer font-subtitle text-lg bg-primary-red/10 rounded p-2 text-gray-800">
                        <option class="font-subtitle py-3 text-lg text-black text-gray-800" disabled selected>-- select an option --</option>
                        <option class="font-subtitle py-3 text-lg text-gray-800" v-for="answer in question.answers" :value="answer">{{ answer }}</option>
                    </select>
                </div>

                <div v-if="lastVideoStop" class="flex flex-col my-16">
                    <label class="font-subtitle text-primary-red text-md lg:text-xl">Anything to add ?</label>
                    <textarea class="font-text p-3 text-lg text-black bg-primary-red/10 rounded mt-5" rows="7" v-model="lastQuestion" />
                </div>

                <button type="submit" class="text-white font-title text-lg rounded w-full font-bold font-title text-2xl py-5 px-2 bg-primary-red">Continue video</button>
            </form>
        </div>
    </div>
</template>

<script>
import { mapStores, mapActions } from "pinia";
import { useUserStore } from "@/stores/userStore";
import { useLogicStore } from "@/stores/logicStore";
import { useGameStore } from "@/stores/gamesStore";

export default {
    props: {
        questions: Array,
        gameId: String,
        lastVideoStop: Boolean,
    },

    data() {
        return {
            userAnswers: [],
            lastQuestion: "",
        };
    },

    computed: {
        ...mapStores(useUserStore),
    },

    methods: {
        ...mapActions(useLogicStore, ["newAlert"]),
        ...mapActions(useGameStore, ["postAnswer"]),

        close() {
            if (this.lastVideoStop) {
                let requestData = [
                    {
                        question: "Anything to add ?",
                        answer: this.lastQuestion,
                    },
                ];

                this.postAnswer(this.userStore.id, this.gameId, requestData)
                    .then(() => {
                        this.userStore
                            .addViewedVideo(this.gameId)
                            .then(() => {
                                this.$emit("closeModal");
                            })
                            .catch(e => {
                                this.$emit("closeModal");
                                this.newAlert("error", "A error occurred while saving your answers, please try again later");
                            });
                    })
                    .catch(error => {
                        this.$emit("closeModal");
                        this.newAlert("error", "A error occurred while saving your answers, please try again later");
                    });
            } else {
                let requestData = [];

                for (const [index, answer] of this.userAnswers.entries()) {
                    requestData.push({
                        question: this.questions[index].question,
                        answer: answer,
                    });
                }

                this.postAnswer(this.userStore.id, this.gameId, requestData)
                    .then(() => {
                        this.$emit("closeModal");
                    })
                    .catch(error => {
                        this.$emit("closeModal");
                        this.newAlert("error", "A error occurred while saving your answers, please try again later");
                    });
            }
        },
    },
};
</script>

<style scoped></style>
