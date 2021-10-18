const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 4000

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

http.listen(PORT, () => {
  console.log("listening on *:" + PORT);
});
