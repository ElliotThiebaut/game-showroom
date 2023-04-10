import {FastifyInstance} from "fastify";
import prisma from '../prisma';

// Prefix '/games' is added in api\app.ts
async function routes (server: FastifyInstance) {
    server.get('/', (request, reply) => {
        return {ping: 'pong'}
    })
}

export default routes