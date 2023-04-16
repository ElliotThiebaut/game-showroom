import * as dotenv from 'dotenv'

export default function envConfig() {
    dotenv.config({ path: '.env.dev' });
    dotenv.config();
}