import {FastifyInstance} from "fastify";


async function routes (server: FastifyInstance) {
    const collection = server.mongo.db?.collection('test')

    server.get('/', async (request, reply) => {
        const result = await collection?.find().toArray()
        if (result?.length === 0) {
            return reply.code(404).send({ message: 'No test documents' })
        }
        return result
    })
}

export default routes