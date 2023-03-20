<template>
    <GameEditor @cancelEditor="gameEditorVisibility = false" :game-index="editorGameIndex" v-if="gameEditorVisibility" />

    <!-- Deleting Game modal -->
    <div v-if="isDeletingGameModal">
        <div class="backdrop-blur-sm bg-gray-600/50 overflow-auto py-10 lg:px-20 xl:px-40 2xl:px-72 3xl:px-[35rem] px-5 fixed z-10 inset-0 w-full h-screen">
            <div class="bg-primary-red text-white text-center rounded-md px-5 lg:px-10 py-10 mt-44 max-w-lg mx-auto">
                <h1 class="font-title text-xl">Are you sure you want to delete this game ?</h1>
                <p class="my-10 font-text text-lg">
                    All the answers related to this game will still be accessible.<br />
                    To restore the game later, please contact the administrator.
                </p>
                <div class="flex justify-between">
                    <div @click="deleteGame" class="bg-white text-primary-red px-14 py-3 mr-2 rounded cursor-pointer font-subtitle shadow-lg">Yes</div>
                    <div @click="isDeletingGameModal = false" class="border-2 border-white text-white px-14 py-3 ml-2 rounded cursor-pointer font-subtitle shadow-lg">No</div>
                </div>
            </div>
        </div>
    </div>

    <HeaderCard>
        <div>
            <p>
                Total number of games : <span class="font-bold text-lg lg:text-xl font-title">{{ gamesStore.getNumberOfGames }}</span>
            </p>
        </div>
        <div
            @click="openEditor(-1)"
            class="w-full text-center mt-10 lg:mt-0 lg:w-auto bg-white rounded font-subtitle text-lg text-primary-red py-2 lg:px-5 flex justify-center items-center cursor-pointer"
        >
            <p>Add a game</p>
        </div>
    </HeaderCard>

    <div class="mt-10 mb-16 flex-col">
        <GameLine
            class="my-5 py-3 border-b-2 first:pt-0 last:pb-0 last:border-none"
            @deleteGame="deleteGameModal"
            @openGameEditor="openEditor"
            v-for="game in gamesStore.games"
            :key="game._id"
            :game-index="gamesStore.getIndexOfGame(game._id)"
        />
    </div>

    <!-- Loading spinner -->
    <div v-if="isLoading" class="h-[60vh] flex flex-col justify-center">
        <ClipLoader :loading="true" :color="'#E62953'" :size="'50px'" />
    </div>
</template>

<script>
import HeaderCard from "@/components/HeaderCard.vue";
import GameLine from "@/components/GameLine.vue";
import GameEditor from "@/components/GameEditor.vue";
import ClipLoader from "vue-spinner/src/ClipLoader.vue";
import { mapStores } from "pinia";
import { useGamesStore } from "@/stores/gamesStore";
import { useLogicStore } from "@/stores/logicStore";

export default {
    components: { HeaderCard, GameLine, GameEditor, ClipLoader },

    data() {
        return {
            isLoading: false,
            gameEditorVisibility: false,
            editorGameIndex: Number,
            deletingGameIndex: Number,
            isDeletingGameModal: false,
        };
    },

    computed: {
        ...mapStores(useGamesStore, useLogicStore),
    },

    methods: {
        openEditor(index) {
            this.editorGameIndex = index;
            this.gameEditorVisibility = true;
        },

        deleteGameModal(index) {
            this.deletingGameIndex = index;
            this.isDeletingGameModal = true;
        },

        deleteGame() {
            this.gamesStore
                .deleteGame(this.gamesStore.games[this.deletingGameIndex]._id)
                .then(() => {
                    this.isDeletingGameModal = false;
                    this.logicStore.newAlert("success", "Game deleted !");
                })
                .catch(e => {
                    this.isDeletingGameModal = false;
                    this.logicStore.newAlert("error", "A error occured, please try again later");
                });
        },
    },

    watch: {
        gameEditorVisibility() {
            if (this.gameEditorVisibility === true) {
                document.documentElement.style.overflow = "hidden";
            } else {
                document.documentElement.style.overflow = "auto";
            }
        },
    },
};
</script>

<style scoped></style>
