import {FastifyInstance} from "fastify";
import prisma from '../prisma';

const postNewGameOptions = {
    schema: {
        body: {
            type: 'object',
            properties: {
                name: { type: 'string', minLength: 1 },
                category: { type: 'string', minLength: 2 },
                description: { type: 'string', minLength: 2 },
                designers: {
                    type: 'array',
                    minItems: 1,
                    items: { type: 'string' }
                },
                illustrators: {
                    type: 'array',
                    minItems: 1,
                    items: { type: 'string' }
                }
            },
            required: ['name', 'category', 'description', 'designers', 'illustrators']
        }
    }
}

const postUpdateGameOptions = {
    schema: {
        body: {
            type: 'object',
            properties: {
                name: { type: 'string', minLength: 1 },
                category: { type: 'string', minLength: 2 },
                description: { type: 'string', minLength: 2 },
                designers: {
                    type: 'array',
                    minItems: 1,
                    items: { type: 'string' }
                },
                illustrators: {
                    type: 'array',
                    minItems: 1,
                    items: { type: 'string' }
                }
            }
        }
    }
}

// Prefix '/games' is added in api\app.ts
async function routes (server: FastifyInstance) {
    server.get('/', (request, reply) => {
        try {
            return prisma.game.findMany({
                where: {
                    isDeleted: false
                },
                include: {
                    gameQuestions: true
                },
                orderBy: {
                    created_at: 'desc'
                }
            })
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.get('/:gameId', async (request, reply) => {
        const { gameId } = request.params as { gameId: string }
        try {
            const games = await prisma.game.findMany({
                where: {
                    AND: [{id: gameId}, {isDeleted: false}]
                },
                include: {
                    gameQuestions: true
                },
            })

            if (games.length === 0) return reply.code(404).send({error: 'Game not found'})
            else return reply.code(200).send(games[0])
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.post('/new', postNewGameOptions, async (request, reply) => {
        const {name, category, description, designers, illustrators} = request.body as {
            name: string,
            category: string,
            description: string,
            designers: string[],
            illustrators: string[]
        }

        try {
            const game = await prisma.game.create({
                data: {
                    name,
                    category,
                    description,
                    designers,
                    illustrators
                }
            })

            return reply.code(201).send(game)
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.put('/update/:gameId', postUpdateGameOptions, async (request, reply) => {
        const { gameId } = request.params as { gameId: string }
        const { name, category, description, designers, illustrators } = request.body as {
            name: string | undefined,
            category: string | undefined,
            description: string | undefined,
            designers: string[] | undefined,
            illustrators: string[] | undefined
        }

        try {
            const game = await prisma.game.update({
                where: {
                    id: gameId
                },
                data: {
                    name,
                    category,
                    description,
                    designers,
                    illustrators
                }
            })

            return reply.code(200).send(game)
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            if (e.code === 'P2025') return reply.code(404).send({error: 'Game not found'})
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.delete('/delete/:gameId', async (request, reply) => {
        const { gameId } = request.params as { gameId: string }
        try {
            await prisma.game.update({
                data: {
                    isDeleted: true
                },
                where: {
                    id: gameId,
                }
            })

            await prisma.gameQuestion.updateMany({
                data: {
                    isDeleted: true
                },
                where: {
                    game_id: gameId,
                }
            })

            return reply.code(200).send({message: 'Game deleted'})
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            if (e.code === 'P2025') return reply.code(404).send({error: 'Game not found'})
            return reply.code(500).send({error: 'Internal server error'})
        }
    })
}
export default routes