<template>
    <HeaderCard>
        <div>
            <p>
                Total number of answers : <span class="font-bold text-lg lg:text-xl font-title">{{ answersStore.getNumberOfAnswers }}</span>
            </p>
            <p>
                Number of full answers: <span class="font-bold text-lg lg:text-xl font-title">{{ answersStore.getNumberOfFullAnswers }}</span>
            </p>
        </div>
        <div
            @click="answersStore.exportAnswer"
            class="w-full text-center mt-10 lg:mt-0 lg:w-auto bg-white rounded font-subtitle text-lg text-primary-red py-2 lg:px-5 flex justify-center items-center cursor-pointer"
        >
            <p>Export</p>
        </div>
    </HeaderCard>

    <v-grid class="h-[40vh]" readonly="true" autoSizeColumn="true" theme="material" filter="true" :source="answersStore.getTableAnswerData" :columns="answersStore.getTableColumns" />

    <!-- Loading spinner -->
    <div v-if="isLoading" class="h-[50vh] flex flex-col justify-center">
        <ClipLoader :loading="true" :color="'#009A89'" :size="'50px'" />
    </div>
</template>

<script>
import { useAnswersStore } from "@/stores/answersStore";
import { mapStores } from "pinia";
import HeaderCard from "@/components/HeaderCard.vue";
import ClipLoader from "vue-spinner/src/ClipLoader.vue";
import VGrid from "@revolist/vue3-datagrid";
import { useLogicStore } from "@/stores/logicStore";

export default {
    components: { ClipLoader, VGrid, HeaderCard },

    data() {
        return {
            isLoading: false,
        };
    },

    computed: {
        ...mapStores(useLogicStore, useAnswersStore),
    },

    created() {
        if (this.answersStore.answers.length === 0 && this.logicStore.key) {
            this.isLoading = true;
            this.answersStore
                .fetchAnswers()
                .then(() => {
                    this.isLoading = false;
                })
                .catch(e => {
                    this.logicStore.newAlert("error", "A error occured, please try again later");
                });
        }

        this.logicStore.$subscribe((mutation, state) => {
            if (state.key) {
                if (this.answersStore.answers.length === 0) {
                    this.isLoading = true;
                    this.answersStore
                        .fetchAnswers()
                        .then(() => {
                            this.isLoading = false;
                        })
                        .catch(e => {
                            this.logicStore.newAlert("error", "A error occured, please try again later");
                        });
                }
            }
        });
    },
};
</script>

<style scoped></style>
