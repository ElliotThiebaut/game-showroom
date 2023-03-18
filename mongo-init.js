db = db.getSiblingDB("boardgamegallerie");

db.createCollection('users')
db.users.insertOne({
    "email": "demo@roquette-lab.fr",
    "surname": "Roquette",
    "name": "Lab",
    "company": "Roquette Lab",
    "country": "France",
    "service": "it",
    "firstVisit": true,
    "viewedVideo": [],
    "timestamp": Date.now(),
    "deleted": false
})