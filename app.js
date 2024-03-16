const express = require("express");
const app = express();

app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

let initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`Error at ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer()


const convertDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};


//get players list
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team ORDER BY id;`;

  const playersArray = await db.all(getPlayersQuery);

  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

function getPlayerDetails(dbObject) {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
}

//get player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);
  response.send(getPlayerDetails(player));
});

//post player or adding player

app.post("/players/", async (request, response) => {
  try {
    const playerDetails = request.body;
    const {id,playerName, jerseyNumber, role } = playerDetails;
    const addPlayerQuery = `INSERT INTO cricket_team (id,player_name,jersey_number,role)
       VALUES ('${id}','${playerName}',${jerseyNumber},'${role}');`;
    const dbResponse = await db.run(addPlayerQuery);
    //const id = dbResponse.lastID;
    response.send("Player Added to Team");
  } catch (e) {
    console.log(`error from POST ${e.message}`);
  }
});

//update player

app.put("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const playerDetails = request.body;
    const { playerName, jerseyNumber, role } = playerDetails;
    const updatePlayerQuery = `UPDATE cricket_team SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
        WHERE player_id = ${playerId}`;

    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
  } catch (e) {
    console.log(`error from put${e.error}`);
  }
});

//DELETE PLAYER FROM TABLE

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team 
    WHERE player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;

