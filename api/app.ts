import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import * as dotenv from 'dotenv'

import users from "./routes/users";
import games from "./routes/games";
import uploads from "./routes/uploads";
import gamesQuestions from "./routes/gamesQuestions";
import answers from "./routes/answers";

dotenv.config()

const server = Fastify({
    logger: true
})

server.register(multipart)

server.register(users, {prefix: 'users'})
server.register(games, {prefix: 'games'})
server.register(uploads, {prefix: 'uploads'})
server.register(gamesQuestions, {prefix: 'game-questions'})
server.register(answers, {prefix: 'answers'})

server.get('/health', async () => {
    return {status: 'ok'}
})

const start = async () => {
    try {
        await server.listen({ port: 3000 })
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

start()
    .then(() => {
        server.log.info('Server started !')
})