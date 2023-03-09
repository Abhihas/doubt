const express = require("express");
const app = express();
let sqlite3 = require("sqlite3");
let path = require("path");
let { open } = require("sqlite");
let db = null;

let dbpath = path.join(__dirname, "cricketTeam.db");
let initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("server started");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

initializeDBAndServer();

//get
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//get particular id
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let getSqlQuery = `
    SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  let array = await db.get(getSqlQuery);
  response.send(array);
});

app.use(express.json());

//post
app.post("/players/", async (request, response) => {
  let bodyDetails = request.body;
  let { player_name, jersey_number, role } = bodyDetails;
  let getSql = `
    INSERT INTO
      cricket_team (player_name,jersey_number,role)
    VALUES
      (
        '${player_name}',
         ${jersey_number},
         '${role}'
      );`;

  let dbRes = await db.run(getSql);
  let playId = dbRes.lastID;
  response.send({ playId: playId });
});

//put
app.put("/players/:playerId/", async (request, response) => {
  const bookDetails = request.body;
  let { playerId } = request.params;
  const { player_name, jersey_number, role } = bookDetails;

  const updateBookQuery = `
    UPDATE
      cricket_team
    SET
      player_name='${player_name}',
      jersey_number=${jersey_number},


      role='${role}'
    WHERE
      player_id = ${playerId};`;
  let book_Of = await db.run(updateBookQuery);
  response.send("Player Details Updated");
});

//detete
app.delete("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;

  const deleteBookQuery = `
    DELETE FROM
        cricket_team
    WHERE
        player_id = ${playerId};`;
  let book_Of = await db.run(deleteBookQuery);
  response.send("Player Removed");
});

module.exports = app;
