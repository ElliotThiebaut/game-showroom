import express from 'express'
import bodyParser from "body-parser";
import cors from 'cors';
import {client, mongoConnect} from "./db-connexion.js";
import {ApiError, errorHandler} from "./middleware/error.js";

import {router, router as routerGathering} from "./routes/gathering.js"
import {Auth} from "./middleware/auth.js";


// Configuring express and its middleware
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Using routers to register all routes

app.use(routerGathering)

app.get('/health', async(req, res) => {
    res.send({status: 'ok'})
})

//Catching all unknown routes
app.all('*', (req, res, next) => {
    return next(new ApiError(`The route ${req.originalUrl} does not exist`, 'Unknown route','unknown-route', 404))
});

// Using error middleware
app.use(errorHandler)

//Connecting to the mongoDB database
mongoConnect().catch(console.error)

//Listening to port 3000 for new requests
app.listen(port, () => console.log(`API running and listening on port ${port}!`));