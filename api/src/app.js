import express from 'express'
import bodyParser from "body-parser";
import cors from 'cors';
import {mongoConnect} from "./db-connexion.js";
import {ApiError, errorHandler} from "./middleware/error.js";

import {router as routerGathering} from "./routes/gathering.js"


// Configuring express and its middleware
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Using routers to register all routes

app.use(routerGathering)

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