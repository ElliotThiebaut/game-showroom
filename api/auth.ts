import {getAuth} from "@clerk/fastify";
import {FastifyReply, FastifyRequest} from "fastify";
import * as dotenv from 'dotenv'
import prisma from './prisma';
import { clerkClient } from "./clerk";
dotenv.config()

export async function verifyUser (request: FastifyRequest, reply: FastifyReply, isAdminRoute: boolean = false) {
    let { userId  } = getAuth(request);
    let clerkUser
    let dbUser

    const isDevUser = request.headers.authorization === `KEY ${process.env.USER_DEV_KEY}` && request.ip === process.env.USER_DEV_IP

    if (isDevUser) userId = 'user_2OLYwGo4wCaAIQv70TseUZU20GN'

    if (!userId) {
        reply.code(401)
        throw new Error('Missing credentials')
    }

    try {
        clerkUser = await clerkClient.users.getUser(userId)
    } catch (e) {
        reply.code(401)
        throw new Error('Invalid credentials')
    }

    try {
        dbUser = await prisma.user.findUniqueOrThrow({
            where: {
                clerk_id: clerkUser.id
            }
        })

    } catch (e: any) {
        e.clientVersion ? request.log.error(`Prisma auth error : ${e.code}`) : request.log.error(e)
        reply.code(500)
        throw new Error('Internal server error')
    }

    if (isAdminRoute && clerkUser.publicMetadata.role !== 'admin') {
        reply.code(403)
        throw new Error('Access Forbidden')
    }

    // @ts-ignore
    if (request.params?.hasOwnProperty('userId') && request.params.userId !== dbUser.id && clerkUser.publicMetadata.role !== 'admin') {
        reply.code(403)
        throw new Error('Access Forbidden')
    }

    request.authenticatedUser = {
        ...dbUser,
        clerkUser: clerkUser
    }
    return
}