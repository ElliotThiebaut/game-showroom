import {MongoClient} from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = `mongodb://${process.env.DB_HOST}/`
const client = new MongoClient(mongoUri)

async function mongoConnect() {
    try {
        await client.connect();

    } catch (e) {
        console.error(e);
    }
}

export {
    client,
    mongoConnect
}