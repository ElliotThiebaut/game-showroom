import Fastify from 'fastify'
import test from  "./routes/test"

const server = Fastify({
    logger: true
})

server.get('/health', async () => {
    return {status: 'ok'}
})

server.register(test, {prefix: 'test'})

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