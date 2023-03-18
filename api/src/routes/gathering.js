import express from "express";
import multer from "multer";
import ObjectsToCsv from 'objects-to-csv';
import {client} from "../db-connexion.js";
import {ObjectId} from "mongodb";
import {ApiError} from "../middleware/error.js";
import {Auth} from "../middleware/auth.js";
import fs from "fs";
import * as path from "path";
import axios from "axios";

import dotenv from 'dotenv'
dotenv.config()

const coverStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'temp')
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + path.extname(file.originalname))
    }
})
const coverFilter = (req, file, callback) => {
    const fileSize = parseInt(req.headers["content-length"])
    if (fileSize > 5000000) {
        callback(new ApiError('File too large', 'File to large for the request', 'wrong-format', 400), false);
    }

    if (file.mimetype.split("/")[1] === "png") {
        callback(null, true)
    } else {
        callback(new ApiError('Invalid file format', 'Invalid file format for the request', 'wrong-format', 400), false);
    }
};

const videoStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'temp')
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + path.extname(file.originalname))
    }
})
const videoFilter = (req, file, callback) => {
    const fileSize = parseInt(req.headers["content-length"])

    if (fileSize > 1000000000) {
        callback(new ApiError('File too large', 'File to large for the request', 'wrong-format', 400), false);
    }

    if (file.mimetype.split("/")[1] === "mp4") {
        callback(null, true)
    } else {
        callback(new ApiError('Invalid file format', 'Invalid file format for the request', 'wrong-format', 400), false);
    }
};

const coverUpload = multer({storage: coverStorage, fileFilter: coverFilter})
const videoUpload = multer({storage: videoStorage, fileFilter: videoFilter})

export const router = express.Router();

// Get all users (admin)
router.get('/users', Auth.ensureRole(['gathering-admin-database']), async(req, res, next) => {
    const query = {deleted: { $ne: true }}

    if (req.query.export && req.query.export === 'true') {
        const data = await client.db('boardgamegallerie').collection('users').find(query).toArray()
        for (const user of data) {
            user.firstVisit = user.firstVisit.toString()

            const dateTimestamp = new Date(user.timestamp)
            user.timestamp = dateTimestamp.toLocaleString("fr-FR")

            let videoViewName = []
            for (const video of user.viewedVideo) {
                const gameDb = await client.db('boardgamegallerie').collection('games').findOne({_id: video}, {projection: {name: 1}})
                videoViewName.push(gameDb.name)
            }
            user.viewedVideo = videoViewName.toString()

            delete user["_id"]
        }

        const csv = new ObjectsToCsv(data);

        try {
            await csv.toDisk('./temp/usersGathering.csv');
        } catch (e) {
            return next(new ApiError('A error occurred', 'A error occurred while generating the csv', 'server-error', 500))
        }
        const readStream = fs.createReadStream('./temp/usersGathering.csv')

        console.log(`(${res.locals.user}) Generated CSV Users in /users`)
        res.status(201)
        res.set('Content-disposition', `attachment; filename=usersGathering.csv`)
        res.contentType("text/csv");
        readStream.pipe(res)
        readStream.on('end', () => {
            fs.unlinkSync('./temp/usersGathering.csv')
        })
    } else {
        res.send(await client.db('boardgamegallerie').collection('users').find(query).toArray())
    }
})

// Get one user by ID or email
router.get('/user', Auth.ensureRole(['gathering-database']), async(req, res, next) => {
    if (req.query.id) {
        let paramsObjectId
        try {
            paramsObjectId = new ObjectId(req.query.id)
        } catch (e) {
            return next(new ApiError('Invalid user ID', 'Invalid user ID for the request', 'wrong-params', 404))
        }

        const dbUser = await client.db('boardgamegallerie').collection('users').findOne({$and: [{_id: paramsObjectId}, {deleted: { $ne: true }}]})

        if (!dbUser) {
            return next(new ApiError('Invalid user ID', 'Invalid user ID for the request', 'wrong-params', 404))
        } else {
            res.send(dbUser)
        }
    } else if(req.query.email) {
        const dbUser = await client.db('boardgamegallerie').collection('users').findOne({$and: [{email: req.query.email.toLowerCase()}, {deleted: { $ne: true }}]})

        if (!dbUser) {
            return next(new ApiError('Invalid user email', 'Invalid user email for the request', 'wrong-params', 404))
        } else {
            res.send(dbUser)
        }
    } else {
        return next(new ApiError('No ID given', 'No ID for the request', 'wrong-params', 422))
    }
})

// Add a new user
router.post('/register', Auth.ensureRole(['gathering-database']), async(req, res, next) => {
    const {email, name, surname, company, service, country} = {...req.body}

    if (!email || !name || !surname || !company || !service || !country) {
        return next(new ApiError('Cannot add user with missing parameters', 'Cannot add user with missing parameters', 'missing-body', 422))
    }

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (!emailRegex.test(email.toLowerCase())) {
        return next(new ApiError('Cannot add user with incorrect email', 'Cannot add user with incorrect email', 'missing-body', 422))
    }

    const dbUser = await client.db('boardgamegallerie').collection('users').findOne({email: email.toLowerCase()})

    if (!dbUser) {
        let addedUser = await client.db('boardgamegallerie').collection('users').insertOne({
            email: email.toLowerCase(),
            surname: surname.replace(/[<>]/gi, ''),
            name: name.replace(/[<>]/gi, ''),
            company: company.replace(/[<>]/gi, ''),
            country: country.replace(/[<>]/gi, ''),
            service: service.replace(/[<>]/gi, ''),
            firstVisit: true,
            viewedVideo: [],
            timestamp: Date.now()
        })

        if (addedUser.acknowledged) {
            console.log(`(${res.locals.user}) User added in /register`);
            res.status(201).send({message:'User added'})

        } else {
            return next(new ApiError('A error occurred while adding the user', 'A error occurred while adding the user', 'db-error', 500))
        }
    } else {
        const update = {
            $set: {
                surname: surname.replace(/[<>]/gi, ''),
                name: name.replace(/[<>]/gi, ''),
                company: company.replace(/[<>]/gi, ''),
                country: country.replace(/[<>]/gi, ''),
                service: service.replace(/[<>]/gi, ''),
                timestamp: Date.now(),
                deleted: false
            }
        }

        let updatedUser = await client.db('boardgamegallerie').collection('users').updateOne({email: email.toLowerCase()}, update)

        if (updatedUser.acknowledged && updatedUser.matchedCount){
            console.log(`(${res.locals.user}) User updated in /register`);
            res.send({message:'User updated'})
        } else {
            return next(new ApiError('A error occurred while updating the user', 'A error occurred while updating the user', 'db-error', '500'))
        }
    }

})

// Update firstVisit status of a user
router.put('/user/firstvisit/:userId', Auth.ensureRole(['gathering-database']), async(req, res, next) => {
    // Test if user id passed is correct and exists in DB
    let userObjectId
    let dbUser

    try {
        userObjectId = new ObjectId(req.params.userId)
        dbUser = await client.db('boardgamegallerie').collection('users').findOne({$and: [{_id: userObjectId}, {deleted: { $ne: true }}]})

        if (!dbUser) {
            return next(new ApiError('Invalid user ID', 'Invalid user ID for the request', 'wrong-params', 404))
        }
    } catch (e) {
        return next(new ApiError('Invalid user ID', 'Invalid user ID for the request', 'wrong-params', 404))
    }

    if (req.query.status.toLowerCase() !== 'true' && req.query.status.toLowerCase() !== 'false') {
        return next(new ApiError('Invalid query', 'Invalid query for the request', 'wrong-params', 400))

    }

    let newFirstVisit = JSON.parse(req.query.status.toLowerCase());

    const update = {
        $set: {
            firstVisit: newFirstVisit
        }
    }

    let updatedUser = await client.db('boardgamegallerie').collection('users').updateOne({_id: userObjectId}, update)
    if (updatedUser.acknowledged && updatedUser.matchedCount){
        console.log(`(${res.locals.user}) First visit updated in /user/firstvisit`);
        res.send({message:'First visit updated'})
    } else {
        return next(new ApiError('A error occurred while updating first visit', 'A error occurred while updating first visit', 'db-error', '500'))
    }
})

// Update viewed video of a user
router.put('/user/video/:userId/:gameId', Auth.ensureRole(['gathering-database']), async(req, res, next) => {
    // Check if video exists with ID
    let gameObjectId
    let dbGame
    try {
        gameObjectId = new ObjectId(req.params.gameId)
        dbGame = await client.db('boardgamegallerie').collection('games').findOne({$and: [{_id: gameObjectId}, {deleted: { $ne: true }}]})

        if (!dbGame) {
            return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
        }

    } catch (e) {
        return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
    }

    // Test if user id passed is correct and exists in DB
    let userObjectId
    let dbUser
    try {
        userObjectId = new ObjectId(req.params.userId)
        dbUser = await client.db('boardgamegallerie').collection('users').findOne({$and: [{_id: userObjectId}, {deleted: { $ne: true }}]})

        if (!dbUser) {
            return next(new ApiError('Invalid user ID', 'Invalid user ID for the request', 'wrong-params', 404))
        }
    } catch (e) {
        return next(new ApiError('Invalid user ID', 'Invalid user ID for the request', 'wrong-params', 404))
    }

    const alreadyExists = dbUser.viewedVideo.findIndex(video => video.toString() === gameObjectId.toString());
    if (alreadyExists !== -1) {
        return next(new ApiError('Video already viewed', 'Video already viewed', 'wrong-params', 400))
    }

    let newViewedVideo = [...dbUser.viewedVideo]
    newViewedVideo.push(gameObjectId)

    const update = {
        $set: {
            viewedVideo: newViewedVideo
        }
    }

    let updatedUser = await client.db('boardgamegallerie').collection('users').updateOne({_id: userObjectId}, update)
    if (updatedUser.acknowledged && updatedUser.matchedCount){
        console.log(`(${res.locals.user}) Viewed video added in /user/video`);
        res.send({message:'Viewed video added'})
    } else {
        return next(new ApiError('A error occurred while adding viewed video', 'A error occurred while adding viewed video', 'db-error', '500'))
    }

})

// Remove viewed video of a user
router.delete('/user/video/:userId/:gameId', Auth.ensureRole(['gathering-database']), async(req, res, next) => {
    // Check if video exists with ID
    let gameObjectId
    let dbGame
    try {
        gameObjectId = new ObjectId(req.params.gameId)
        dbGame = await client.db('boardgamegallerie').collection('games').findOne({$and: [{_id: gameObjectId}, {deleted: { $ne: true }}]})

        if (!dbGame) {
            return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
        }

    } catch (e) {
        return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
    }

    // Test if user id passed is correct and exists in DB
    let userObjectId
    let dbUser
    try {
        userObjectId = new ObjectId(req.params.userId)
        dbUser = await client.db('boardgamegallerie').collection('users').findOne({$and: [{_id: userObjectId}, {deleted: { $ne: true }}]})

        if (!dbUser) {
            return next(new ApiError('Invalid user ID', 'Invalid user ID for the request', 'wrong-params', 404))
        }
    } catch (e) {
        return next(new ApiError('Invalid user ID', 'Invalid user ID for the request', 'wrong-params', 404))
    }

    const alreadyExists = dbUser.viewedVideo.findIndex(video => video.toString() === gameObjectId.toString());
    if (alreadyExists === -1) {
        return next(new ApiError('Video not viewed', 'Video not viewed', 'wrong-params', 400))
    }

    let newViewedVideo = [...dbUser.viewedVideo]
    newViewedVideo.splice(alreadyExists, 1)

    const update = {
        $set: {
            viewedVideo: newViewedVideo
        }
    }

    let updatedUser = await client.db('boardgamegallerie').collection('users').updateOne({_id: userObjectId}, update)
    if (updatedUser.acknowledged && updatedUser.matchedCount){
        console.log(`(${res.locals.user}) Viewed video removed in /user/video`);
        res.send({message:'Viewed video removed'})
    } else {
        return next(new ApiError('A error occurred while removing viewed video', 'A error occurred while removing viewed video', 'db-error', '500'))
    }

})

// Soft delete a user by ID (admin)
router.delete('/user/:id', Auth.ensureRole(['gathering-admin-database']), async(req,res,next) => {
    // Test if user id passed is correct and exists in DB
    let userObjectId
    let dbUser
    try {
        userObjectId = new ObjectId(req.params.id)
        dbUser = await client.db('boardgamegallerie').collection('users').findOne({$and: [{_id: userObjectId}, {deleted: { $ne: true }}]})

        if (!dbUser) {
            return next(new ApiError('Invalid user ID', 'Invalid user ID for the request', 'wrong-params', 404))
        }
    } catch (e) {
        return next(new ApiError('Invalid user ID', 'Invalid user ID for the request', 'wrong-params', 404))
    }

    const update = {
        $set: {deleted: true}
    }

    let updatedUser = await client.db('boardgamegallerie').collection('users').updateOne({_id: userObjectId}, update)
    if (updatedUser.acknowledged && updatedUser.matchedCount){
        console.log(`(${res.locals.user}) User deleted in /user`);
        res.send({message:'User deleted'})
    } else {
        return next(new ApiError('A error occurred while deleting the user', 'A error occurred while deleting the user', 'db-error', '500'))
    }

})



// Get all games
router.get('/games', Auth.ensureRole(['gathering-database']), async(req, res, next) => {
    res.send(await client.db('boardgamegallerie').collection('games').find({deleted: { $ne: true }}).toArray())
})

// Get one game by ID
router.get('/game/:id', Auth.ensureRole(['gathering-database']), async(req, res, next) => {
    let paramsObjectId
    try {
        paramsObjectId = new ObjectId(req.params.id)
    } catch (e) {
        return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
    }

    const dbGame = await client.db('boardgamegallerie').collection('games').findOne({$and: [{_id: paramsObjectId}, {deleted: { $ne: true }}]})

    if (!dbGame) {
        return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
    } else {
        res.send(dbGame)
    }
})

// Add a new game (admin)
router.post('/game', Auth.ensureRole(['gathering-admin-database']), async(req, res, next) => {
    if (!req.body.designer || !req.body.illustrator || !req.body.videoStops) {
        return next(new ApiError('Invalid game data', 'Invalid game data for the request', 'wrong-params', 400))
    }

    if ((req.body.designer && req.body.designer.length === 0) || (req.body.illustrator && req.body.illustrator.length === 0) || ((req.body.videoStops && req.body.videoStops.length === 0))) {
        return next(new ApiError('Invalid game data', 'Invalid game data for the request', 'wrong-params', 400))
    }

    for (const videoStop of req.body.videoStops) {
        if (!videoStop.questions || (videoStop.questions && videoStop.questions.length === 0)) {
            return next(new ApiError('Invalid game data', 'Invalid game data for the request', 'wrong-params', 400))
        }

        for (const question of videoStop.questions) {
            if (!question.answers || (question.answers && question.answers.length === 0)) {
                return next(new ApiError('Invalid game data', 'Invalid game data for the request', 'wrong-params', 400))
            }
        }
    }

    const {name, category, description, designer, illustrator, imgUrl, videoUrl, videoStops} = {...req.body}

    let addedGame = await client.db('boardgamegallerie').collection('games').insertOne({
        name,
        category,
        description,
        designer,
        illustrator,
        imgUrl,
        videoUrl,
        videoStops,
        timestamp: Date.now(),
        deleted: false
    })

    if (addedGame.acknowledged) {
        console.log(`(${res.locals.user}) Game added in /game`);
        res.status(201).send({message:'Game added', _id: addedGame.insertedId})

    } else {
        return next(new ApiError('A error occurred while adding the game', 'A error occurred while adding the game', 'db-error', 500))
    }
})

// Update a game (admin)
router.put('/game/:id', Auth.ensureRole(['gathering-admin-database']), async(req, res, next) => {
    let paramsObjectId
    try {
        paramsObjectId = new ObjectId(req.params.id)
    } catch (e) {
        return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
    }

    const updateData = {}

    if ((req.body.designer && req.body.designer.length === 0) || (req.body.illustrator && req.body.illustrator.length === 0) || ((req.body.videoStops && req.body.videoStops.length === 0))) {
        return next(new ApiError('Invalid game data', 'Invalid game data for the request', 'wrong-params', 400))
    }

    for (const videoStop of req.body.videoStops) {
        if (!videoStop.questions || (videoStop.questions && videoStop.questions.length === 0)) {
            return next(new ApiError('Invalid game data', 'Invalid game data for the request', 'wrong-params', 400))
        }

        for (const question of videoStop.questions) {
            if (!question.answers || (question.answers && question.answers.length === 0)) {
                return next(new ApiError('Invalid game data', 'Invalid game data for the request', 'wrong-params', 400))
            }
        }
    }

    if (req.body.name) {updateData.name = req.body.name}
    if (req.body.category) {updateData.category = req.body.category}
    if (req.body.description) {updateData.description = req.body.description}
    if (req.body.designer) {updateData.designer = req.body.designer}
    if (req.body.illustrator) {updateData.illustrator = req.body.illustrator}
    if (req.body.imgUrl) {updateData.imgUrl = req.body.imgUrl}
    if (req.body.videoUrl) {updateData.videoUrl = req.body.videoUrl}
    if (req.body.videoStops) {updateData.videoStops = req.body.videoStops}
    updateData.timestamp = Date.now()

    const update = {
        $set: updateData
    }

    let updatedGame = await client.db('boardgamegallerie').collection('games').updateOne({$and: [{_id: paramsObjectId}, {deleted: { $ne: true }}]}, update)
    if (updatedGame.acknowledged && updatedGame.matchedCount){
        console.log(`(${res.locals.user}) Game updated in /game`);
        res.send({message:'Game updated'})
    } else {
        return next(new ApiError('A error occurred while updating the game', 'A error occurred while updating the game', 'db-error', '500'))
    }
})

// Upload a cover image for a game (admin)
router.post('/cover/:gameId', Auth.ensureRole(['gathering-admin-database']), coverUpload.single('cover'), async(req, res, next) => {
    let dbGame
    let gameObjectId
    try {
        gameObjectId = new ObjectId(req.params.gameId)
        dbGame = await client.db('boardgamegallerie').collection('games').findOne({$and: [{_id: gameObjectId}, {deleted: { $ne: true }}]})

        if (!dbGame) {
            return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
        }
    } catch (e) {
        return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
    }

    if (!req.file || Object.keys(req.file).length === 0) {
        return next(new ApiError('No files sent', 'No files sent with the request', 'wrong-params', 400))
    }

    const url = `${req.params.gameId}_${Date.now()}.png`

    try {
        let response = await axios.put(`https://storage.bunnycdn.com/boardgamegallerie/${url}`, fs.createReadStream(req.file.path), {
            headers: {
                AccessKey: process.env.IMAGE_CDN_KEY,
                'Content-Type': 'application/octet-stream'
            }
        })

        fs.unlinkSync(`./temp/${req.file.filename}`)
    } catch (e) {
        console.log(e.response)
        fs.unlinkSync(`./temp/${req.file.filename}`)
        return next(new ApiError('A error occurred while uploading to the CDN', 'A error occurred while uploading to the CDN', 'api-error', '500'))
    }

    let updatedGame = await client.db('boardgamegallerie').collection('games').updateOne({$and: [{_id: gameObjectId}, {deleted: { $ne: true }}]}, {$set: {imgUrl: `https://cdn-boardgamegallerie.roquette-lab.fr/${url}`}})
    if (updatedGame.acknowledged && updatedGame.matchedCount){
        console.log(`(${res.locals.user}) Cover updated in /cover`);
        res.send({message:'Cover updated', url: `https://cdn-boardgamegallerie.roquette-lab.fr/${url}`})
    } else {
        return next(new ApiError('A error occurred while updating the cover', 'A error occurred while updating the cover', 'db-error', '500'))
    }
})

// Upload a video for a game (admin)
router.post('/video/:gameId', Auth.ensureRole(['gathering-admin-database']), videoUpload.single('video'), async(req, res, next) => {
    let dbGame
    let gameObjectId
    try {
        gameObjectId = new ObjectId(req.params.gameId)
        dbGame = await client.db('boardgamegallerie').collection('games').findOne({$and: [{_id: gameObjectId}, {deleted: { $ne: true }}]})

        if (!dbGame) {
            return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
        }
    } catch (e) {
        return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
    }

    if (!req.file || Object.keys(req.file).length === 0) {
        return next(new ApiError('No files sent', 'No files sent with the request', 'wrong-params', 400))
    }

    // Create video object in CDN to get a video ID
    let createVideoResponse
    try {
        createVideoResponse = await axios.post(`https://video.bunnycdn.com/library/104396/videos`, {"title": `${dbGame.name}_${Date.now()}`}, {
            headers: {
                AccessKey: process.env.VIDEO_CDN_KEY,
            }
        })

        const uploadVideoResponse = await axios.put(`https://video.bunnycdn.com/library/104396/videos/${createVideoResponse.data.guid}`, fs.createReadStream(req.file.path), {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: {
                AccessKey: process.env.VIDEO_CDN_KEY,
                'Content-Type': 'application/octet-stream'
            }
        })

        fs.unlinkSync(`./temp/${req.file.filename}`)
    } catch (e) {
        fs.unlinkSync(`./temp/${req.file.filename}`)
        return next(new ApiError('A error occurred while uploading to the CDN', 'A error occurred while uploading to the CDN', 'api-error', '500'))
    }

    let updatedGame = await client.db('boardgamegallerie').collection('games').updateOne({$and: [{_id: gameObjectId}, {deleted: { $ne: true }}]}, {$set: {videoUrl: `https://vz-8b616db8-c84.b-cdn.net/${createVideoResponse.data.guid}/playlist.m3u8`}})
    if (updatedGame.acknowledged && updatedGame.matchedCount){
        console.log(`(${res.locals.user}) Video updated in /video`);
        res.send({message:'Video updated', url: `https://vz-b4aff626-324.b-cdn.net/${createVideoResponse.data.guid}/playlist.m3u8`})
    } else {
        return next(new ApiError('A error occurred while updating the video', 'A error occurred w' +
            'hile updating the video', 'db-error', '500'))
    }
})

// Soft delete a game by ID (admin)
router.delete('/game/:id', Auth.ensureRole(['gathering-admin-database']), async(req,res,next) => {
    // Test if game id passed is correct and exists in DB
    let gameObjectId
    let dbGame
    try {
        gameObjectId = new ObjectId(req.params.id)
        dbGame = await client.db('boardgamegallerie').collection('games').findOne({$and: [{_id: gameObjectId}, {deleted: { $ne: true }}]})

        if (!dbGame) {
            return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
        }
    } catch (e) {
        return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
    }

    const update = {
        $set: {deleted: true}
    }

    let updatedGame = await client.db('boardgamegallerie').collection('games').updateOne({_id: gameObjectId}, update)
    if (updatedGame.acknowledged && updatedGame.matchedCount){
        console.log(`(${res.locals.user}) Game deleted in /game`);
        res.send({message:'Game deleted'})
    } else {
        return next(new ApiError('A error occurred while deleting the game', 'A error occurred while deleting the game', 'db-error', '500'))
    }

})



// Get all answers (admin)
router.get('/answers', Auth.ensureRole(['gathering-admin-database']), async(req, res, next) => {
    let data
    try {
        data = await client.db('boardgamegallerie').collection('answers').find().toArray()
        for (const answer of data) {
            answer.game = await client.db('boardgamegallerie').collection('games').findOne({_id: answer.game_id}, {projection: {videoStops: 0, timestamp: 0}})
            answer.user = await client.db('boardgamegallerie').collection('users').findOne({_id: answer.user_id}, {projection: {firstVisit: 0, viewedVideo: 0, timestamp: 0}})

            delete answer['game_id']
            delete answer['user_id']
        }
    } catch (e) {
        return next(new ApiError('A error occurred while accessing DB', 'A error occurred while accessing DB', 'db-error', '500'))
    }

    if (req.query.export && req.query.export === 'true') {
        for (const answer of data) {
            const dateTimestamp = new Date(answer.timestamp)
            answer.timestamp = dateTimestamp.toLocaleString("fr-FR")

            answer.game = answer.game.name
            answer.name = `${answer.user.surname} ${answer.user.name}`
            answer.email = answer.user.email

            for (const answerElement of answer.answers) {
                answer[answerElement.question] = answerElement.answer
            }

            delete answer["_id"]
            delete answer["user"]
            delete answer["answers"]
        }

        const csv = new ObjectsToCsv(data);

        try {
            await csv.toDisk('./temp/answersGathering.csv');
        } catch (e) {
            return next(new ApiError('A error occurred', 'A error occurred while generating the csv', 'server-error', 500))
        }
        const readStream = fs.createReadStream('./temp/answersGathering.csv')

        console.log(`(${res.locals.user}) Generated CSV Users in /answers`)
        res.status(201)
        res.set('Content-disposition', `attachment; filename=answersGathering.csv`)
        res.contentType("text/csv");
        readStream.pipe(res)
        readStream.on('end', () => {
            fs.unlinkSync('./temp/answersGathering.csv')
        })
    } else {
        res.send(data)
    }
})

// Add or update an answer
router.post('/answer/:user/:game', Auth.ensureRole(['gathering-database']), async(req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError('No answer passed', 'No answer passed for the request', 'wrong-params', 404))
    }

    // Test if user id passed is correct and exists in DB
    let userObjectId
    let dbUser
    try {
        userObjectId = new ObjectId(req.params.user)
        dbUser = await client.db('boardgamegallerie').collection('users').findOne({$and: [{_id: userObjectId}, {deleted: { $ne: true }}]})

        if (!dbUser) {
            return next(new ApiError('Invalid user ID', 'Invalid user ID for the request', 'wrong-params', 404))
        }
    } catch (e) {
        return next(new ApiError('Invalid user ID', 'Invalid user ID for the request', 'wrong-params', 404))
    }

    // Test if game id passed is correct and exists in DB
    let gameObjectId
    let dbGame
    try {
        gameObjectId = new ObjectId(req.params.game)
        dbGame = await client.db('boardgamegallerie').collection('games').findOne({$and: [{_id: gameObjectId}, {deleted: { $ne: true }}]})

        if (!dbGame) {
            return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
        }
    } catch (e) {
        return next(new ApiError('Invalid game ID', 'Invalid game ID for the request', 'wrong-params', 404))
    }

    // Check if there already is an answer
    const dbAnswer = await client.db('boardgamegallerie').collection('answers').findOne({game_id: gameObjectId, user_id: userObjectId})
    if (dbAnswer) {
        let oldAnswers = dbAnswer.answers
        let newAnswers = req.body

        for (const newAnswer of newAnswers) {
            const oldIndex = oldAnswers.findIndex(oldAnswer => oldAnswer.question === newAnswer.question);
            if (oldIndex !== -1) {
                oldAnswers.splice(oldIndex, 1)
            }
        }
        const updatedAnswers = [...oldAnswers, ...newAnswers]


        const update = {
            $set: {
                answers: updatedAnswers,
                timestamp: Date.now()
            }
        }

        let updatedAnswer = await client.db('boardgamegallerie').collection('answers').updateOne({game_id: gameObjectId, user_id: userObjectId}, update)
        if (updatedAnswer.acknowledged && updatedAnswer.matchedCount){
            console.log(`(${res.locals.user}) Answer updated in /answer`);
            res.send({message:'Answer updated'})
        } else {
            return next(new ApiError('A error occurred while updating the answer', 'A error occurred while updating the answer', 'db-error', '500'))
        }
    } else {
        let addedAnswer = await client.db('boardgamegallerie').collection('answers').insertOne({
            game_id: gameObjectId,
            user_id: userObjectId,
            answers: req.body,
            timestamp: Date.now()
        })

        if (addedAnswer.acknowledged) {
            console.log(`(${res.locals.user}) Answer added in /answer`);
            res.status(201).send({message:'Answer added'})
        } else {
            return next(new ApiError('A error occurred while adding the answer', 'A error occurred while adding the answer', 'db-error', 500))
        }
    }
})