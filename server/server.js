const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

io.on("connection", function (socket) {
  console.log("A user connected");

  socket.on("disconnect", function () {
    console.log("A user disconnected");
  });
});

http.listen(4000, function () {
  console.log("listening on *:4000");
});
