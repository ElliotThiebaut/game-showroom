import {FastifyInstance} from "fastify";
import prisma from '../prisma';
import {verifyUser} from "../authHandler";
import {Game} from "@prisma/client";
import axios from "axios";

const postNewGameOptions = {
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

const postUpdateGameOptions = {
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

// Prefix '/games' is added in api\app.ts
async function routes (server: FastifyInstance) {
    server.get('/', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply)
        }
    }, (request, reply) => {
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

    server.get('/:gameId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply)
        }
    }, async (request, reply) => {
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

    server.post('/new', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply, true)
        },
        schema: postNewGameOptions
    }, async (request, reply) => {
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

    server.put('/update/:gameId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply, true)
        },
        schema: postUpdateGameOptions
    }, async (request, reply) => {
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

    server.delete('/delete/:gameId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply, true)
        },
    }, async (request, reply) => {
        const { gameId } = request.params as { gameId: string }
        let dbGame: Game
        let isImgDeleted = false
        let isVideoDeleted = false

        try {
            dbGame = await prisma.game.findUniqueOrThrow({
                where: {
                    id: gameId,
                }
            })

        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            reply.code(404)
            throw new Error('Invalid game id')
        }

        if (dbGame.imgUrl) {
            try {
                await axios.delete(`https://storage.bunnycdn.com/game-showroom/${dbGame.imgUrl.replace('https://cdn.game-showroom.roquette-lab.fr/', '')}`, {
                    headers: {
                        AccessKey: process.env.BUNNYCDN_STORAGE_ACCESS_KEY
                    }
                })
                isImgDeleted = true
            } catch (e) {
                request.log.error(`Bunny CDN error : ${e}`)
                return reply.code(500).send({error: 'Internal server error'})
            }
        }

        if (dbGame.videoUrl) {
            try {
                await axios.delete(`https://video.bunnycdn.com/library/112680/videos/${dbGame.videoUrl.replace('https://vz-68bdb7a7-8f8.b-cdn.net/', '').replace('/playlist.m3u8', '')}`, {
                    headers: {
                        AccessKey: process.env.BUNNYCDN_STREAM_ACCESS_KEY,
                    }
                })
                isVideoDeleted = true
            } catch (e) {
                request.log.error(`Bunny CDN error : ${e}`)
                return reply.code(500).send({error: 'Internal server error'})
            }
        }

        try {
            await prisma.game.update({
                data: {
                    isDeleted: true,
                    imgUrl: isImgDeleted ? null : undefined,
                    videoUrl: isVideoDeleted ? null : undefined
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