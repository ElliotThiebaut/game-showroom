<template>
  <div class="backdrop-blur-sm bg-gray-600/50 overflow-auto py-10 lg:px-20 xl:px-40 2xl:px-72 px-5 fixed z-10 inset-0 w-full h-screen">
    <div class="bg-white text-center rounded-md px-5 lg:px-10 py-10 mx-auto">
      <h1 v-if="!isNewGame" class="font-title text-xl text-primary-red mb-5 xl:mb-10 xl:text-2xl" :class="isGameIncomplete ? 'text-yellow-500 mb-1  xl:mb-3' : ''">Editing : {{ formGame.name }} <span v-if="isGameIncomplete">(Inactive)</span></h1>
      <p v-if="isGameIncomplete" class="text-yellow-500 font-text font-bold mb-5 xl:mb-10 xl:text-lg">This game is missing a image or a video</p>
      <h1 v-if="isNewGame" class="font-title text-xl text-primary-red mb-5 xl:mb-10 xl:text-2xl">New Game</h1>

      <form v-if="!firstFileUpload" @submit.prevent="saveGame" method="post">

        <div class="flex flex-col xl:flex-row xl:justify-between">

          <div class="w-full xl:mr-5 xl:w-3/5">
            <p class="font-subtitle text-2xl text-left my-5">Information :</p>
            <div class="flex flex-col text-left mb-8">
              <label for="name" class="font-subtitle">Name</label>
              <input id="name" type="text" class="border-b-2 border-b-primary-red bg-primary-red/10 mt-1 font-text p-1" required v-model="formGame.name">
            </div>
            <div class="flex flex-col text-left mb-8">
              <label for="category" class="font-subtitle">Category</label>
              <input id="category" type="text" class="border-b-2 border-b-primary-red bg-primary-red/10 mt-1 font-text p-1" required v-model="formGame.category">
            </div>
            <div class="flex flex-col text-left mb-8">
              <label for="description" class="font-subtitle">Description</label>
              <textarea id="description" type="text" class="border-b-2 border-b-primary-red bg-primary-red/10 mt-1 font-text p-1" rows="10" required v-model="formGame.description" />
            </div>
            <div class="flex flex-col text-left mb-8">
              <label for="designer" class="font-subtitle">Designers (seperated by coma)</label>
              <input id="designer" type="text" class="border-b-2 border-b-primary-red bg-primary-red/10 mt-1 font-text p-1" required v-model="formGame.designer">
            </div>
            <div class="flex flex-col text-left mb-8">
              <label for="illustrator" class="font-subtitle">Illustrators (seperated by coma)</label>
              <input id="illustrator" type="text" class="border-b-2 border-b-primary-red bg-primary-red/10 mt-1 font-text p-1" required v-model="formGame.illustrator">
            </div>

            <!--  Upload cover  -->
            <form v-if="!isNewGame" @submit.prevent="saveCover" class="flex flex-col text-left mb-8" method="post" name="cover">
              <p class="font-subtitle">Cover image</p>
              <input ref="coverFile" class="file:bg-primary-red/10 hover:file:bg-primary-red/20 file:text-primary-red file:font-subtitle file:rounded-lg file:border-none file:p-2 file:mr-4 mt-3 bg-primary-red/5 rounded-lg font-text cursor-pointer file:cursor-pointer" id="cover" type="file">
              <button :disabled="uploadingCover || uploadingVideo" type="submit" class="bg-primary-red rounded text-white font-title py-2 px-4 mt-5 flex justify-center" :class="uploadingVideo ? 'cursor-not-allowed bg-primary-red/50' : ''">
                <svg v-if="uploadingCover" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ coverButton }}
              </button>
            </form>

            <!--  Upload video  -->
            <form v-if="!isNewGame" @submit.prevent="saveVideo" class="flex flex-col text-left mb-8" enctype="multipart/form-data" method="post" name="cover">
              <p class="font-subtitle">Game video</p>
              <input ref="videoFile" class="file:bg-primary-red/10 hover:file:bg-primary-red/20 file:text-primary-red file:font-subtitle file:rounded-lg file:border-none file:p-2 file:mr-4 mt-3 bg-primary-red/5 rounded-lg font-text cursor-pointer file:cursor-pointer" id="cover" type="file">
              <button :disabled="uploadingCover || uploadingVideo" type="submit" class="bg-primary-red rounded text-white font-title py-2 px-4 mt-5 flex justify-center" :class="uploadingCover ? 'cursor-not-allowed bg-primary-red/50' : ''">
                <svg v-if="uploadingVideo" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ videoButton }}
              </button>
            </form>
          </div>

          <div class="flex flex-col text-left mb-8 w-full xl:ml-5">
            <p class="font-subtitle text-2xl my-5">Questions :</p>
            <div v-for="(stop, indexS) in formGame.videoStops" class="p-2 lg:px-5 my-5 bg-primary-red rounded-lg text-white">
              <div class="flex justify-between">
                <label class="font-text underline decoration-2 underline-offset-2 text-xl">Video stop {{ indexS + 1 }} :</label>
                <div class="flex items-center">
                  <plus-circle-icon @click="addStop" class="w-5 h-5 text-white mr-2 cursor-pointer"/>
                  <minus-circle-icon v-if="formGame.videoStops.length > 1" @click="deleteStop(indexS)" class="w-5 h-5 text-white cursor-pointer"/>
                </div>
              </div>
              <div class="flex flex-col text-left mt-4 mb-6">
                <div class="flex">
                  <ExclamationIcon v-if="stop.timestamp === 0" class="h-7 w-7 text-yellow-300 mr-1"/>
                  <label class="font-text" :class="stop.timestamp === 0 ? 'text-yellow-300 font-bold' : ''">Timestamp (in seconds)</label>
                </div>
                <input type="number" class="bg-white text-black rounded mt-1 font-text p-2" required v-model="stop.timestamp">
              </div>
              <div v-for="(question, indexQ) in stop.questions" class="bg-primary-purple rounded-lg my-3 px-2 py-4 lg:px-5">
                <div class="flex flex-col mb-4">
                  <div class="flex justify-between ml-">
                    <label class="font-text">Question {{ indexQ + 1 }} :</label>
                    <div class="flex items-center">
                      <plus-circle-icon @click="addQuestion(indexS)" class="w-5 h-5 text-primary-pink mr-2 cursor-pointer"/>
                      <minus-circle-icon v-if="stop.questions.length > 1" @click="deleteQuestion(indexS, indexQ)" class="w-5 h-5 text-primary-pink cursor-pointer"/>
                    </div>
                  </div>
                  <input type="text" class="bg-white text-black rounded mt-1 font-text p-2" required v-model="question.question">
                </div>
                <div class="flex flex-col">
                  <label class="font-text">Available answers (seperated by coma) :</label>
                  <input type="text" class="bg-white text-black rounded mt-1 font-text p-2" required v-model="question.answers">
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="flex justify-between w-full mt-10">
          <button :disabled="uploadingCover || uploadingVideo" type="submit" class="mx-auto bg-primary-red rounded text-white font-title py-2 px-4 w-2/5" :class="uploadingVideo || uploadingCover ? 'cursor-not-allowed bg-primary-red/50' : ''">Save</button>
          <button :disabled="uploadingCover || uploadingVideo" @click="$emit('cancelEditor')" class="mx-auto border-2 border-primary-red text-primary-red font-title py-2 px-4 rounded w-2/5" :class="uploadingVideo || uploadingCover ? 'cursor-not-allowed border-primary-red/50 text-primary-red/50' : ''">Cancel</button>
        </div>
      </form>

      <div v-if="firstFileUpload">
        <!--  Upload cover  -->
        <p class="text-lg font-subtitle text-primary-red mb-10">Please upload a cover image and a video for the game</p>
        <div class="flex flex-col lg:flex-row lg:w-full lg:justify-around lg:mt-24">
          <form @submit.prevent="saveCover" class="flex flex-col text-left mb-14" method="post" name="cover">
            <p class="font-subtitle">Cover image</p>
            <input ref="coverFile" class="file:bg-primary-red/10 hover:file:bg-primary-red/20 file:text-primary-red file:font-subtitle file:rounded-lg file:border-none file:p-2 file:mr-4 mt-3 bg-primary-red/5 rounded-lg font-text cursor-pointer file:cursor-pointer" id="cover" type="file">
            <button :disabled="uploadingCover || uploadingVideo" type="submit" class="bg-primary-red rounded text-white font-title py-2 px-4 mt-5 flex justify-center" :class="uploadingVideo || coverButton === 'Cover updated !' ? 'cursor-not-allowed bg-primary-red/50' : ''">
              <svg v-if="uploadingCover" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ coverButton }}
            </button>
          </form>

          <!--  Upload video  -->
          <form @submit.prevent="saveVideo" class="flex flex-col text-left mb-8" enctype="multipart/form-data" method="post" name="cover">
            <p class="font-subtitle">Game video</p>
            <input ref="videoFile" class="file:bg-primary-red/10 hover:file:bg-primary-red/20 file:text-primary-red file:font-subtitle file:rounded-lg file:border-none file:p-2 file:mr-4 mt-3 bg-primary-red/5 rounded-lg font-text cursor-pointer file:cursor-pointer" id="cover" type="file">
            <button :disabled="uploadingCover || uploadingVideo" type="submit" class="bg-primary-red rounded text-white font-title py-2 px-4 mt-5 flex justify-center" :class="uploadingCover || videoButton === 'Video updated !' ? 'cursor-not-allowed bg-primary-red/50' : ''">
              <svg v-if="uploadingVideo" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ videoButton }}
            </button>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from "pinia";
import {useGamesStore} from "@/stores/gamesStore";
import {PlusCircleIcon} from "@heroicons/vue/solid";
import {MinusCircleIcon} from "@heroicons/vue/solid";
import {ExclamationIcon} from "@heroicons/vue/solid";
import {useLogicStore} from "@/stores/logicStore";

export default {
  components: {PlusCircleIcon, MinusCircleIcon, ExclamationIcon},

  props: {
    gameIndex: Number,
  },

  data(){
    return{
      formGame: {},
      uploadingCover: false,
      uploadingVideo: false,
      firstFileUpload: false,
      isNewGame: false,
      coverButton: 'Upload now',
      videoButton: 'Upload now'
    }
  },

  computed: {
    ...mapState(useGamesStore, ['games']),

    game() {
      return this.games[this.gameIndex]
    },

    isGameIncomplete() {
      if (!this.isNewGame) {
        return !this.game.videoUrl || !this.game.imgUrl
      } else {
        return false
      }
    }
  },

  methods: {
    ...mapActions(useGamesStore, ['updateGame', 'addGame', 'updateGameCover', 'updateGameVideo']),
    ...mapActions(useLogicStore, ['newAlert']),

    saveGame() {
      this.formGame.designer = this.formGame.designer.toString().split(',').map(el => el.trim())
      this.formGame.illustrator = this.formGame.illustrator.toString().split(',').map(el => el.trim())

      for (const stop of this.formGame.videoStops) {
        for (const question of stop.questions) {
          question.answers = question.answers.toString().split(',').map(el => el.trim())
        }
      }

      if (!this.isNewGame) {
        this.updateGame(this.formGame._id, this.formGame)
            .then(() => {
              this.newAlert('success', 'Game successfully updated !')
              this.$emit('cancelEditor')
            })
            .catch((e) => {
              this.newAlert('error', 'A error occurred, please try again later')
            })
      } else {
        this.addGame(this.formGame)
            .then(() => {
              this.newAlert('success', 'Game successfully added !')
              this.firstFileUpload = true
            })
            .catch((e) => {
              this.newAlert('error', 'A error occurred, please try again')
            })
      }
    },

    saveCover() {
      if (this.$refs.coverFile.files[0]) {
        this.coverButton = 'Uploading...'
        this.uploadingCover = true
        this.updateGameCover(this.formGame._id, this.$refs.coverFile.files[0])
            .then(() => {
              this.newAlert('success', 'Cover successfully updated !')
              this.uploadingCover = false
              this.coverButton = 'Cover updated !'
              if (this.isNewGame) {
                if (this.$refs.videoFile.files[0] && this.$refs.coverFile.files[0]) {
                  this.$emit('cancelEditor')
                }
              } else {
                this.$refs.coverFile.value = null
              }

            })
            .catch((e) => {
              this.newAlert('error', 'A error occurred, please try again later')
              this.uploadingCover = false
            })
      } else {
        this.newAlert('warning', 'You need to select a file before uploading !')
      }
    },

    saveVideo() {
      if (this.$refs.videoFile.files[0]) {
        this.videoButton = 'Uploading...'
        this.uploadingVideo = true
        this.updateGameVideo(this.formGame._id, this.$refs.videoFile.files[0])
            .then(() => {
              this.videoButton = 'Video updated !'
              this.uploadingVideo = false
              this.newAlert('success', 'Video successfully updated !')
              if (this.isNewGame) {
                if (this.$refs.videoFile.files[0] && this.$refs.coverFile.files[0]) {
                  this.$emit('cancelEditor')
                }
              } else {
                this.$refs.videoFile.value = null
              }
            })
            .catch((e) => {
              this.newAlert('error', 'A error occurred, please try again later')
              this.uploadingVideo = false
            })
      } else {
        this.newAlert('warning', 'You need to select a file before uploading !')
      }
    },

    addStop() {
      this.formGame.videoStops.push({
        timestamp: this.formGame.videoStops[this.formGame.videoStops.length - 1].timestamp + 1,
        questions: [{
          question: 'Your new question ?',
          answers: ['Answer 1, Answer 2']
        }]
      })
    },

    deleteStop(index){
      this.formGame.videoStops.splice(index, 1)
    },

    addQuestion(index) {
      this.formGame.videoStops[index].questions.push({
        question: 'Your new question ?',
        answers: ['Answer 1, Answer 2']
      })
    },

    deleteQuestion(indexS, indexQ){
      this.formGame.videoStops[indexS].questions.splice(indexQ, 1)
    }
  },

  created() {
    if (this.gameIndex !== -1) {
      this.formGame = JSON.parse(JSON.stringify(this.game))
    } else {
      this.isNewGame = true
      this.formGame = {
        name: '',
        category: '',
        description: '',
        designer: [],
        illustrator: [],
        imgUrl: '',
        videoUrl: '',
        videoStops: [
            {
              questions: [
                {
                  question: 'What do you think about the theme ?',
                  answers: ['It really fits the game', 'It\'s ok', 'It seems irrelevant']
                },
                {
                  question: 'What do you think about the gameplay ?',
                  answers: ['I enjoy it', 'It\'s seems ok', 'I don\'t like it']
                },
                {
                  question: 'What do you think about the artworks ?',
                  answers: ['It looks very nice', 'It\'s just ok', 'It will kill the game']
                },
              ],
            timestamp: 0
          },
          {
            questions: [
              {
                question: 'What is your final thought about this game ?\n',
                answers: ['I\'m very interested', 'Maybe', 'I\'m not interested']
              }
            ],
            timestamp: 0
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>