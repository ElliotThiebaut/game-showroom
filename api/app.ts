import 'dotenv/config'
import Fastify from 'fastify'
import testRoutes from  "./routes/test"
import dbConnector from "./dbConnector";

const server = Fastify({
    logger: true
})

server.register(dbConnector)

server.get('/health', async () => {
    return {status: 'ok'}
})

server.register(testRoutes, {prefix: 'test'})

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