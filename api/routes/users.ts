import {FastifyInstance} from "fastify";
import prisma from '../prisma';

const postRegisterOptions = {
    schema: {
        body: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                username: { type: 'string', minLength: 2 }
            },
            required: ['email', 'username']
        }
    }
}

// Prefix '/users' is added in api\app.ts
async function routes (server: FastifyInstance) {
    server.get('/', (request, reply) => {
        try {
            return prisma.user.findMany({
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

    server.get('/:userId', async (request, reply) => {
        const { userId } = request.params as { userId: string }
        try {
            const users = await prisma.user.findMany({
                where: {
                    AND: [{id: userId}, {isDeleted: false}]
                }
            })

            if (users.length === 0) return reply.code(404).send({error: 'User not found'})
            else return reply.code(200).send(users[0])
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.post('/new', postRegisterOptions, async (request, reply) => {
        const {email, username} = request.body as {email: string, username: string}

        function isValidEmail(email: string): boolean {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(email);
        }

        if (!isValidEmail(email)) return reply.code(400).send({error: 'Invalid email'})

        try {
            const user = await prisma.user.create({
                data: {
                    email,
                    username
                }
            })

            return reply.code(201).send(user)
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            if (e.code === 'P2002' && e.meta.target[0] === 'email') return reply.code(400).send({error: 'Email already exists'})
            else if (e.code === 'P2002' && e.meta.target[0] === 'username') return reply.code(400).send({error: 'Username already exists'})
            else return reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.put('/tutorial/:userId', async (request, reply) => {
        const { userId } = request.params as { userId: string }
        try {
            await prisma.user.update({
                data: {
                  tutorial: false
                },
                where: {
                    id: userId,
                }
            })

            return reply.code(200).send({message: 'User updated'})
        } catch (e: any) {
            e.clientVersion ? request.log.error(`Prisma error : ${e.code}`) : request.log.error(e)
            console.log(e)
            if (e.code === 'P2025') return reply.code(404).send({error: 'User not found'})
            else return  reply.code(500).send({error: 'Internal server error'})
        }
    })

    server.delete('/delete/:userId', async (request, reply) => {
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