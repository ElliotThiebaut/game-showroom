import Fastify from 'fastify'
import users from "./routes/users";
import games from "./routes/games";

const server = Fastify({
    logger: true
})

server.get('/health', async () => {
    return {status: 'ok'}
})

server.register(users, {prefix: 'users'})
server.register(games, {prefix: 'games'})

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