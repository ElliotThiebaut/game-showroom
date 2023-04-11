import {FastifyInstance} from "fastify";
import prisma from '../prisma';

const postNewAnswerOptions = {
    schema: {
        body: {
            type: 'object',
            properties: {
                answer: { type: 'string' }
            },
            required: ['answer']
        },
        params: {
            type: 'object',
            properties: {
                gameQuestionId: { type: 'string', minLength: 2 },
                userId: { type: 'string', minLength: 2 }
            }
        }
    }
}

async function routes (server: FastifyInstance) {
    server.get('/', async (request, reply) => {
        try {
            return prisma.answers.findMany({
                orderBy: {
                    created_at: 'desc'
                },
                include: {
                    gameQuestion: true,
                }
            })
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.get('/game-question/:gameQuestionId', async (request, reply) => {
        const { gameQuestionId } = request.params as { gameQuestionId: string }
        try {
            const answers = await prisma.answers.findMany({
                where: {
                    gameQuestion_id: gameQuestionId
                },
                orderBy: {
                    created_at: 'desc'
                },
                include: {
                    gameQuestion: true,
                }
            })

            if (answers.length === 0) return reply.code(404).send({error: 'Game question not found'})
            else return reply.code(200).send(answers)
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.get('/user/:userId', async (request, reply) => {
        const { userId } = request.params as { userId: string }
        try {
            const answers = await prisma.answers.findMany({
                where: {
                    user_id: userId
                },
                orderBy: {
                    created_at: 'desc'
                },
                include: {
                    gameQuestion: true,
                }
            })

            if (answers.length === 0) return reply.code(404).send({error: 'User not found'})
            else return reply.code(200).send(answers)
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.get('/game/:gameId', async (request, reply) => {
        const { gameId } = request.params as { gameId: string }
        try {
            const answers = await prisma.answers.findMany({
                where: {
                    gameQuestion: {
                        game_id: gameId
                    }
                },
                orderBy: {
                    created_at: 'desc'
                },
                include: {
                    gameQuestion: true,
                }
            })

            if (answers.length === 0) return reply.code(404).send({error: 'Game not found'})
            else return reply.code(200).send(answers)
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.post('/new/game-question/:gameQuestionId/user/:userId', postNewAnswerOptions, async (request, reply) => {
        const { gameQuestionId, userId } = request.params as { gameQuestionId: string, userId: string }
        const { answer } = request.body as { answer: string }

        try {
            const newAnswer = await prisma.answers.upsert({
                where: {
                    gameQuestion_id_user_id: {
                        gameQuestion_id: gameQuestionId,
                        user_id: userId
                    }
                },
                update: {
                    answer,
                    isDeleted: false
                },
                create: {
                    gameQuestion_id: gameQuestionId,
                    user_id: userId,
                    answer
                }
            })

            return reply.code(201).send(newAnswer)
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.delete('/delete/game-question/:gameQuestionId/user/:userId', async (request, reply) => {
        const { gameQuestionId, userId } = request.params as { gameQuestionId: string, userId: string }
        try {
            await prisma.answers.update({
                where: {
                    gameQuestion_id_user_id: {
                        gameQuestion_id: gameQuestionId,
                        user_id: userId
                    }
                },
                data: {
                    isDeleted: true
                }
            })

            return reply.code(200).send({message: 'Answer deleted'})
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            if (e.code === 'P2025') return reply.code(404).send({error: 'Answer not found'})
            return reply.code(500).send({error: 'Internal server error'})
        }
    })
}

export default routes