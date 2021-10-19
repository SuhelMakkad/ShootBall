const app = require("express")();
const cors = require("cors");
const http = require("http").Server(app);
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
app.use(jsonParser);

const { MongoClient } = require("mongodb");
const { parse } = require("path");

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 4000;

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("hello", (data) => {
    console.log(data);
    socket.broadcast.emit("helloo", data);
  });

  socket.on("disconnect", function () {
    console.log("A user disconnected");
  });

  socket.on("createNewRoom", (gameId) => {
    socket.join(gameId);
    console.log("game joined" + gameId);
  });

  socket.on("joinRoom", (gameId, canvasSize) => {
    socket.join(gameId);
    io.to(gameId).emit("playerJoined", canvasSize);
  });

  socket.on("updateScore", (gameId, score) => {
    io.to(gameId).emit("updateScore", score);
  });

  socket.on("gameOver", (gameId) => {
    io.to(gameId).emit("gameOver");
  });

  socket.on("addProjectile", (gameId, projectile) => {
    io.to(gameId).emit("addProjectile", projectile);
  });

  socket.on("addEnemy", (gameId, enemy) => {
    io.to(gameId).emit("addEnemy", enemy);
  });

  socket.on("updatePlayerColors", (gameId, colors) => {
    io.to(gameId).emit("updatePlayerColors", colors);
  });
});

app.get("/getLeaderboard", async (req, res) => {
  const uri =
    "mongodb+srv://admin:97235@cluster0.qvosb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const leaderboardCollection = client.db("shoot_ball").collection("leaderboard");
    const leaderboard = await leaderboardCollection.find().sort({ score: -1 }).limit(10);
    leaderboard.toArray((err, result) => {
      if (err) res.send(err);
      return res.send(result);
    });
  } catch (e) {
    console.error(e);
    return res.send("Somthing went wrong");
  }
});

app.post("/setScore", async (req, res) => {
  const uri =
    "mongodb+srv://admin:97235@cluster0.qvosb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const data = { name: req.body.name, score: parseInt(req.body.score) };
    if (isNaN(data.score)) {
      return res.send({ status: "FAILED", message: "Plase Enter Valide Score" });
    }
    await client.connect();
    const leaderboardCollection = client.db("shoot_ball").collection("leaderboard");
    leaderboardCollection.insertOne(data);
    return res.send({ status: "SUCCESS", message: "Score saved" });
  } catch (e) {
    console.error(e);
    return res.send("Somthing went wrong");
  }
});

http.listen(PORT, () => {
  console.log("listening on *:" + PORT);
});
