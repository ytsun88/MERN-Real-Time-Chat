const express = require("express");
const { Server } = require("socket.io");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const authRouter = require("./routers/authRouter");
const server = require("http").createServer(app);
const session = require("express-session");
const redisClient = require("./redis");
require("dotenv").config();
const passport = require("passport");
const { sessionMiddleware, wrap } = require("./controllers/serverController");
const {
  addFriend,
  initializeUser,
  onDisconnect,
  dm,
} = require("./controllers/socketController");
require("./config/passport")(passport);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(sessionMiddleware);
app.use("/auth", authRouter);

io.use(wrap(sessionMiddleware));
io.use((socket, next) => {
  if (!socket.request.session || !socket.request.session.user) {
    next(new Error("Not authorized"));
  } else {
    next();
  }
});
io.on("connect", (socket) => {
  initializeUser(socket);

  socket.on("add_friend", (friendName, cb) => {
    addFriend(socket, friendName, cb);
  });

  socket.on("dm", (message) => {
    dm(socket, message);
  });

  socket.on("disconnecting", () => onDisconnect(socket));
});

server.listen(4000, () => {
  console.log("Server listening on port 4000");
});
