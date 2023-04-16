import {FastifyInstance} from "fastify";
import prisma from '../prisma';
import { clerkClient } from "../clerk";
import {verifyUser} from "../auth";

const postRegisterOptions = {
    body: {
        type: 'object',
        properties: {
            clerk_id: { type: 'string' }
        },
        required: ['clerk_id']
    }
}

// Prefix '/users' is added in api\app.ts
async function routes (server: FastifyInstance) {
    server.get('/', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply, true)
        }
    }, async (request, reply) => {
        try {
            const dbUsers = await prisma.user.findMany({
                where: {
                    isDeleted: false
                },
                orderBy: {
                    created_at: 'desc'
                }
            })

            const clerkUsers = await clerkClient.users.getUserList();

            return dbUsers.map(dbUser => {
                const clerkUser = clerkUsers.find(clerkUser => clerkUser['id'] === dbUser['clerk_id'])
                return {...dbUser, clerkUser}
            })
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.get('/me', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply)
        }
    }, async (request, reply) => {
        return request.authenticatedUser
    })

    server.get('/:userId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply)
        }
    }, async (request, reply) => {
        const { userId } = request.params as { userId: string }
        try {
            const dbUsers = await prisma.user.findMany({
                where: {
                    AND: [{id: userId}, {isDeleted: false}]
                }
            })

            if (dbUsers.length === 0) return reply.code(404).send({error: 'User not found'})

            let clerkUser
            try {
                clerkUser = await clerkClient.users.getUser(dbUsers[0].clerk_id)
            } catch (e: any) {
                request.log.error(`Clerk error : ${e}`)
                return reply.code(500).send({error: 'Internal server error'})
            }

            return reply.code(200).send({
                ...dbUsers[0],
                clerkUser
            })
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.post('/new', {
        schema: postRegisterOptions
    }, async (request, reply) => {
        const {clerk_id} = request.body as {clerk_id: string}

        try {
            await clerkClient.users.getUser(clerk_id)

            await clerkClient.users.updateUser(clerk_id, {publicMetadata: {role: 'user'}});
        } catch (e) {
            return reply.code(400).send({error: 'No clerk user found'})
        }

        try {
            const user = await prisma.user.create({
                data: {
                    clerk_id
                }
            })

            return reply.code(201).send(user)
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            if (e.code === 'P2002') return reply.code(400).send({error: 'User already exists'})
            else return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.put('/update/tutorial/:userId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply)
        },
    }, async (request, reply) => {
        const { userId } = request.params as { userId: string }
        try {
            await prisma.user.update({
                data: {
                    showTutorial: false
                },
                where: {
                    id: userId,
                }
            })

            return reply.code(200).send({message: 'User updated'})
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            if (e.code === 'P2025') return reply.code(404).send({error: 'User not found'})
            else return  reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.put('/update/admin/:userId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply, true)
        },
    }, async (request, reply) => {
        const { userId } = request.params as { userId: string }
        try {
            const dbUsers = await prisma.user.findMany({
                where: {
                    AND: [{id: userId}, {isDeleted: false}]
                }
            })

            if (dbUsers.length === 0) return reply.code(404).send({error: 'User not found'})

            try {
                await clerkClient.users.updateUser(dbUsers[0].clerk_id, {publicMetadata: {role: 'admin'}});
            } catch (e: any) {
                request.log.error(`Clerk error : ${e}`)
                return reply.code(500).send({error: 'Internal server error'})
            }

            return reply.code(200).send({message: 'User updated'})
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.delete('/delete/:userId', {
        preHandler: async (request, reply) => {
            await verifyUser(request, reply, true)
        }
    }, async (request, reply) => {
        const { userId } = request.params as { userId: string }
        try {
            await prisma.user.update({
                data: {
                    isDeleted: true
                },
                where: {
                    id: userId,
                }
            })

            return reply.code(200).send({message: 'User deleted'})
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            if (e.code === 'P2025') return reply.code(404).send({error: 'User not found'})
            return reply.code(500).send({error: 'Internal server error'})
        }
    })
}

export default routes