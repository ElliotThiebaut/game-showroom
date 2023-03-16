import fastifyPlugin from 'fastify-plugin'
import fastifyMongo from '@fastify/mongodb'
import {FastifyInstance} from "fastify";

async function dbConnector (server: FastifyInstance) {
    server.register(fastifyMongo, {
        url: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_SERVER}?authMechanism=DEFAULT`,
        forceClose: true,
        database: 'board-game-gallerie'
    })
}

export default fastifyPlugin(dbConnector)