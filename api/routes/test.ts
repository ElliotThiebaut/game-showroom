import {FastifyInstance} from "fastify";

async function routes (server: FastifyInstance) {
    server.get('/', (request, reply) => {
        return {ping: 'pong'}
    })
}

export default routes