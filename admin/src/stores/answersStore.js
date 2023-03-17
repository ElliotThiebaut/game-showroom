import {defineStore} from "pinia";
import {useLogicStore} from "@/stores/logicStore";
import axios from "axios";

export const useAnswersStore = defineStore('answers', {
    state: () => ({
        answers: []
    }),

    getters: {
      getNumberOfAnswers() {
          return this.answers.length
      },

      getNumberOfFullAnswers() {
          return this.answers.filter(value => value.answers.length === 5).length
      },

      getTableAnswerData() {
          let data = []
          for (const answer of this.answers) {
              let answerObject = {}
              for (const answerElement of answer.answers) {
                  answerObject[answerElement.question] = answerElement.answer
              }

              answerObject.name = `${answer.user.surname} ${answer.user.name}`
              answerObject.email = answer.user.email
              answerObject.game = answer.game.name

              data.push(answerObject)
          }
          return data
      },

      getTableColumns() {
          let data = [
              {
                  name: "Name",
                  prop: "name",
                  autoSize: true,
                  size: 150,
              },
              {
                  name: "Email",
                  prop: "email",
                  autoSize: true,
                  size: 270
              },
              {
                  name: "Game",
                  prop: "game",
                  autoSize: true,
                  size: 150
              },
          ]

          for (const answer of this.answers) {
              for (const answerElement of answer.answers) {
                  if (!data.find(question => question.name === answerElement.question)) {
                      data.push({
                          name: answerElement.question,
                          prop: answerElement.question,
                          autoSize: true,
                          size: 350
                      })
                  }
              }
          }

          return data
      }
    },

    actions: {
        async exportAnswer() {
            const logicStore = useLogicStore()
            try {
                const response = await axios
                    .get(`${import.meta.env.VITE_API_URL}/answers?export=true`, {
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

        async fetchAnswers() {
            const logicStore = useLogicStore()
            try {
                const response = await axios
                    .get(`${import.meta.env.VITE_API_URL}/answers`, {
                        headers: {
                            'Authorization': `KEY ${logicStore.key}`
                        }
                    })

                this.answers = response.data
            } catch (error) {
                throw new Error(error.response.status.toString());
            }
        }
    }
})