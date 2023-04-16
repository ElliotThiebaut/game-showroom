import {FastifyInstance} from "fastify";
import prisma from '../prisma';
import {verifyUser} from "../auth";

const postNewGameQuestionOptions = {
    body: {
        type: 'object',
        properties: {
            videoTimestamp: { type: 'number' },
            questionType: { type: 'string', enum: ['TEXT', 'SELECT', 'SELECT_MULTIPLE', 'RANGE'] },
            question: { type: 'string', minLength: 2 },
            defaultAnswers: {
                type: 'array',
                minItems: 1,
                items: { type: 'string' }
            },
        },
        required: ['videoTimestamp', 'questionType', 'question']
    },
    params: {
        type: 'object',
        properties: {
            gameId: { type: 'string', minLength: 2 }
        }
    }
}

const postUpdateGameQuestionOptions = {
    body: {
        type: 'object',
        properties: {
            videoTimestamp: { type: 'number' },
            questionType: { type: 'string', enum: ['TEXT', 'SELECT', 'SELECT_MULTIPLE', 'RANGE'] },
            question: { type: 'string', minLength: 2 },
            defaultAnswers: {
                type: 'array',
                items: { type: 'string' }
            },
        }
    },
    params: {
        type: 'object',
        properties: {
            gameQuestionId: { type: 'string', minLength: 2 }
        }
    }
}

enum QuestionTypes {
    TEXT = 'TEXT',
    SELECT = 'SELECT',
    SELECT_MULTIPLE = 'SELECT_MULTIPLE',
    RANGE = 'RANGE'
}

async function routes (server: FastifyInstance) {
    server.get('/', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply)
        }
    }, async (request, reply) => {
        try {
            return prisma.gameQuestion.findMany({
                where: {
                    isDeleted: false
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

    server.get('/:gameQuestionId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply)
        }
    }, async (request, reply) => {
        const { gameQuestionId } = request.params as { gameQuestionId: string }
        try {
            const gameQuestions = await prisma.gameQuestion.findMany({
                where: {
                    AND: [{id: gameQuestionId}, {isDeleted: false}]
                }
            })

            if (gameQuestions.length === 0) return reply.code(404).send({error: 'Game question not found'})
            else return reply.code(200).send(gameQuestions[0])
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.get('/game/:gameId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply)
        }
    }, async (request, reply) => {
        const { gameId } = request.params as { gameId: string }

        try {
            return prisma.gameQuestion.findMany({
                where: {
                    AND: [{game_id: gameId}, {isDeleted: false}]
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

    server.post('/new/:gameId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply, true)
        },
        schema: postNewGameQuestionOptions
    }, async (request, reply) => {
        const { gameId } = request.params as { gameId: string }
        const { videoTimestamp, questionType, question, defaultAnswers } = request.body as { videoTimestamp: number, questionType: QuestionTypes, question: string, defaultAnswers: string[] }

        if ((questionType === 'SELECT' || questionType === 'SELECT_MULTIPLE' || questionType === 'RANGE') && !defaultAnswers) return reply.code(400).send({error: 'Missing defaultAnswers property for questionType SELECT, SELECT_MULTIPLE or RANGE'})

        try {
            const gameQuestion = await prisma.gameQuestion.create({
                data: {
                    videoTimestamp,
                    questionType,
                    question,
                    defaultAnswers,
                    game: {
                        connect: { id: gameId },
                    }
                }
            })

            return reply.code(201).send(gameQuestion)
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            if (e.code === 'P2025') return reply.code(404).send({error: 'Game not found'})
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.put('/update/:gameQuestionId',  {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply, true)
        },
        schema: postUpdateGameQuestionOptions
    }, async (request, reply) => {
        const { gameQuestionId } = request.params as { gameQuestionId: string }
        const { videoTimestamp, questionType, question, defaultAnswers } = request.body as {
            videoTimestamp: number | undefined,
            questionType: QuestionTypes | undefined,
            question: string | undefined,
            defaultAnswers: string[] | undefined
        }

        try {
            const gameQuestion = await prisma.gameQuestion.update({
                where: {
                    id: gameQuestionId
                },
                data: {
                    videoTimestamp,
                    questionType,
                    question,
                    defaultAnswers,
                }
            })

            return reply.code(200).send(gameQuestion)
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            if (e.code === 'P2025') return reply.code(404).send({error: 'Game question not found'})
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.delete('/delete/:gameQuestionId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply, true)
        }
    }, async (request, reply) => {
        const { gameQuestionId } = request.params as { gameQuestionId: string }
        try {
            await prisma.gameQuestion.update({
                data: {
                    isDeleted: true
                },
                where: {
                    id: gameQuestionId,
                }
            })

            return reply.code(200).send({message: 'Game question deleted'})
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            if (e.code === 'P2025') return reply.code(404).send({error: 'Game question not found'})
            return reply.code(500).send({error: 'Internal server error'})
        }
    })
}

export default routes