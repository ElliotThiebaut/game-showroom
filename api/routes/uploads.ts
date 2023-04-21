import {FastifyInstance} from "fastify";
import prisma from '../prisma';
import axios from "axios";
import * as fs from "fs";
import {pipeline} from "stream";
import * as util from "util";
import {verifyUser} from "../authHandler";
const pump = util.promisify(pipeline)

// Prefix '/uploads' is added in api\app.ts
async function routes (server: FastifyInstance) {
    server.post('/game/cover/:gameId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply, true)
        }
    }, async (request, reply) => {
        const { gameId } = request.params as { gameId: string }

        let game = []
        try {
            game = await prisma.game.findMany({
                where: {
                    AND: [{id: gameId}, {isDeleted: false}]
                },
                select: {
                    id: true,
                    imgUrl: true,
                    name: true
                }
            })

            if (game.length === 0) return reply.code(404).send({error: 'Game not found'})
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }

        const data = await request.file({ limits: { fileSize: 5000000 } })

        if (!data) return reply.code(400).send({error: 'No file provided'})
        if (data.mimetype !== 'image/png' && data.mimetype !== 'image/jpeg') return reply.code(400).send({error: 'File must be a png or jpeg'})

        if (game[0].imgUrl) {
            try {
                await axios.delete(`https://storage.bunnycdn.com/game-showroom/${game[0].imgUrl.replace('https://cdn.game-showroom.roquette-lab.fr/', '')}`, {
                    headers: {
                        AccessKey: process.env.BUNNYCDN_STORAGE_ACCESS_KEY
                    }
                })
            } catch (e) {
                request.log.error(`Bunny CDN error : ${e}`)
                return reply.code(500).send({error: 'Internal server error'})
            }
        }

        let fileName
        try {
            const buffer = await data.toBuffer()

            fileName = `${game[0].name.toUpperCase().split(' ').join('')}_${game[0].id}-${Date.now()}.${data.mimetype === 'image/png' ? 'png' : 'jpg'}`

            await axios.put(`https://storage.bunnycdn.com/game-showroom/${fileName}`, buffer, {
                headers: {
                    AccessKey: process.env.BUNNYCDN_STORAGE_ACCESS_KEY,
                    'Content-Type': 'application/octet-stream'
                }
            })
        } catch (err: any) {
            if (err.code === 'FST_REQ_FILE_TOO_LARGE') return reply.code(400).send({error: 'File must be under 5MB'})
            else return  reply.code(500).send({error: 'Internal server error'})
        }

        try {
            await prisma.game.update({
                data: {
                    imgUrl: `https://cdn.game-showroom.roquette-lab.fr/${fileName}`
                },
                where: {
                    id: gameId,
                }
            })

            return reply.code(200).send({message: 'Cover uploaded', url: `https://cdn.game-showroom.roquette-lab.fr/${fileName}`})
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            if (e.code === 'P2025') return reply.code(404).send({error: 'Game not found'})
            else return  reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.post('/game/video/:gameId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply, true)
        }
    }, async (request, reply) => {
        const { gameId } = request.params as { gameId: string }

        let game = []
        try {
            game = await prisma.game.findMany({
                where: {
                    AND: [{id: gameId}, {isDeleted: false}]
                },
                select: {
                    id: true,
                    videoUrl: true,
                    name: true
                }
            })

            if (game.length === 0) return reply.code(404).send({error: 'Game not found'})
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }

        const data = await request.file({ limits: { fileSize: 2000000000 } })

        if (!data) return reply.code(400).send({error: 'No file provided'})
        if (data.mimetype !== 'video/mp4') return reply.code(400).send({error: 'File must be a mp4'})

        if (game[0].videoUrl) {
            try {
                await axios.delete(`https://video.bunnycdn.com/library/112680/videos/${game[0].videoUrl.replace('https://vz-68bdb7a7-8f8.b-cdn.net/', '').replace('/playlist.m3u8', '')}`, {
                    headers: {
                        AccessKey: process.env.BUNNYCDN_STREAM_ACCESS_KEY,
                    }
                })
            } catch (e) {
                request.log.error(`Bunny CDN error : ${e}`)
                return reply.code(500).send({error: 'Internal server error'})
            }
        }

        let cdnResponse
        try {
            await pump(data.file, fs.createWriteStream(`./temp/${data.filename}`))
            const fileName = `${game[0].name.toUpperCase().split(' ').join('')}_${game[0].id}-${Date.now()}.mp4`

            cdnResponse = await axios.post(`https://video.bunnycdn.com/library/112680/videos`, {"title": fileName}, {
                headers: {
                    AccessKey: process.env.BUNNYCDN_STREAM_ACCESS_KEY
                }
            })

            await axios.put(`https://video.bunnycdn.com/library/112680/videos/${cdnResponse.data.guid}`, fs.createReadStream(`./temp/${data.filename}`), {
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                headers: {
                    AccessKey: process.env.BUNNYCDN_STREAM_ACCESS_KEY,
                    'Content-Type': 'application/octet-stream'
                }
            })

            fs.unlinkSync(`./temp/${data.filename}`)
        } catch (err: any) {
            fs.unlinkSync(`./temp/${data.filename}`)
            if (err.code === 'FST_REQ_FILE_TOO_LARGE') return reply.code(400).send({error: 'File must be under 5MB'})
            else return  reply.code(500).send({error: 'Internal server error'})
        }

        try {
            await prisma.game.update({
                data: {
                    videoUrl: `https://vz-68bdb7a7-8f8.b-cdn.net/${cdnResponse.data.guid}/playlist.m3u8`
                },
                where: {
                    id: gameId,
                }
            })

            return reply.code(200).send({message: 'Video uploaded', url: `https://vz-68bdb7a7-8f8.b-cdn.net/${cdnResponse.data.guid}/playlist.m3u8`})
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            if (e.code === 'P2025') return reply.code(404).send({error: 'Game not found'})
            else return  reply.code(500).send({error: 'Internal server error'})
        }
    })
}

export default routes