const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
//app.get players
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
SELECT *
FROM cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})
//app.post /players/
app.post('/players/', async (request, response) => {
  const getDetails = request.body
  const {playerName, jerseyNumber, role} = getDetails
  const addPlayerQuery = `INSERT INTO cricket_team(playerName,jerseyNumber,role)
Values ${playerName}
${jerseyNumber}
${role}`
  const playersArrayPost = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})
//getplayerid
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
SELECT*
FROM cricket_team
where playerId=${playerId}`
  const player = await db.get(getPlayerQuery)
  const {player_id, player_name, jersey_number, role} = player
  const dbResponse = {
    playerId: player_id,
    playerName: player_name,
    jerseyNumber: jersey_number,
    role: role,
  }
  response.send(dbResponse)
})
//putmethod
app.put('/players/:playerId/', async (request, response) => {
  const getBody = request.body
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = getBody
  const getPlayerQuery = `
  update cricket_team
  SET player_name:${playerName},
  jersey_number:${jerseyNumber},
  role:${role}
  where player_id=${playerId}`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})
//delete players
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
DELETE FROM cricket_team
where playerId=${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app
