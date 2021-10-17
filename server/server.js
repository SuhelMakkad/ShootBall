const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("hello", (data) => {
    console.log(data);
    socket.broadcast.emit("helloo", data);
  });

  socket.on("disconnect", function () {
    console.log("A user disconnected");
  });

  socket.on("createNewRoom", (gameId, hostName) => {
    socket.join(gameId);
    console.log("game joined" + gameId);
  });

  socket.on("joinRoom", (gameId, playerName) => {
    io.to(gameId).emit("playerJoined", playerName);
  });

  socket.on("updateScore", (gameId, score) => {
    io.to(gameId).emit("updateScore", score);
  });
});

http.listen(4000, () => {
  console.log("listening on *:4000");
});
