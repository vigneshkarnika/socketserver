const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());
const httpServer = require("http").createServer(app);
const options = {};
const io = require("socket.io")(httpServer, options);

const redisAdapter = require("socket.io-redis");
io.adapter(redisAdapter({ host: process.env.REDIS_URL, port: 6379 }));
app.use(express.static("public"));
app.get("/publish", function (req, res) {
  try {
    console.log(req.query.app, req.query.topic, req.query.data);
    io.sockets.emit(
      req.query.app + "/" + req.query.topic,
      JSON.stringify(req.query.data)
    );
    io.sockets.emit(
      "appdebug",
      `${req.query.app}/${req.query.topic}: ${req.query.data}`
    );
    res.send({
      status: "success",
    });
  } catch (error) {
    res.send({
      status: "failed",
    });
  }
});

app.post("/publish", function (req, res) {
  try {
    console.log(req.body);
    console.log(req.body.app, req.body.topic, JSON.stringify(req.body.data));
    io.sockets.emit(req.body.app + "/" + req.body.topic, req.body.data);
    io.sockets.emit(
      "appdebug",
      `${req.body.app}/${req.body.topic}: ${JSON.stringify(req.body.data)}`
    );
    res.send({
      status: "success",
    });
  } catch (error) {
    res.send({
      status: "failed",
    });
  }
});
app.get("/log", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});
io.on("connection", (socket) => {
  console.log("new client connected");
  socket.on("message", (msg) => {
    console.log("message: " + msg);
  });
});

httpServer.listen(3004, function () {
  console.log(`Server running on 3004 port, PID: ${process.pid}`);
});
