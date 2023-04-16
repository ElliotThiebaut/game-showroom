import { createClerkClient } from "@clerk/fastify";
import * as dotenv from 'dotenv'
dotenv.config()

export const clerkOptions = {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY
};
export const clerkClient = createClerkClient(clerkOptions);