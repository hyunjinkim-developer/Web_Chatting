const express = require("express");
const app = express();
const PORT = 8080;
// User Socket.IO on server side
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.set("view engine", "ejs");
app.use("/views", express.static(__dirname + "/views"));
app.use("/static", express.static(__dirname + "/static"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routers
const indexRouter = require("./routes/index");
app.use("/", indexRouter);
const chatRouter = require("./routes/chat");
app.use("/chat", chatRouter);

// ?? Separate socket /////////////////////////////////////////////////////

const userObj = {};
const nicknameList = []; // For checking nickname redundancy
const colorPool = [
  "#FFAADD",
  "#FFD6A5",
  "#FDFFB6",
  "#CAFFBF",
  "#98F6FF",
  "#A0C4FF",
  "#BDB2FF",
  "#FFC6FF",
  "#FFFFFC",
];
const colorPoolCount = colorPool.length;

/* Shuffle color Pool */
function shuffle(array) {
  /* Get numbers in -0.5 ~ 0.5 range becomes index of sort() */
  array.sort(() => Math.random() - 0.5);
}
shuffle(colorPool);

/* Update client side nickname list */
function updateNicknameList(userObj) {
  io.emit("updateNicknameList", userObj);
}

/* When socket is connected */
io.on("connection", (socket) => {
  console.log("⭕️ Server socket connected >>", socket.id);

  /* Set user data from a client on the server */
  socket.on("setUserData", (nickname) => {
    /* Check nickname redundancy */
    if (nicknameList.indexOf(nickname) > -1) {
      // Already same nickname exists
      socket.emit(
        "errorSameNickname",
        "Oops!😰\nThere's already same nickname exists.\nPlease enter another one!"
      );
    } else {
      // Save user data
      //  color : to show message in client,
      //    colorPool shuffles everytime the server opens
      const userData = {
        nickname: nickname,
        color: colorPool[Object.keys(userObj).length % colorPoolCount],
      };
      userObj[socket.id] = userData;
      nicknameList.push(nickname); // For checking nickname redundancy
      // Notice the client that the user enters the chat
      io.emit("noticeEnter", `${nickname} enters.`);
      // When the user successfully enters the chat
      socket.emit("enterySuccess", userData);
      // Update client nickname list
      updateNicknameList(userObj);
    }
  });

  /* Get message from client */
  socket.on("msgtoServer", (msgData) => {
    /* msgData -> {
      nickname: "",
      color: "",
      msg: "",
      dm: "[socket.id of receiver]"
    } */

    if (msgData.dm === "all") {
      // Send the message to all clients
      io.emit("msgtoClient", msgData);
    } else {
      io.to(msgData.dm).emit("msgtoClient", msgData);
    }
  });

  /* Detect disconnection */
  socket.on("disconnect", () => {
    console.log("❌ Server Socket Disconnected", socket.id);

    // Update other users that the user leaves the chat
    let userData = userObj[socket.id];
    /* When reload the page, socket.id change
        Prevent the server stopped
    */
    if (!userData) return;
    let deletedNickname = userData.nickname;
    io.emit("noticeLeave", `${deletedNickname} left.`);

    /* Delete user data from userObj */
    delete userObj[socket.id];

    /* Update nicknameList */
    updateNicknameList();
    // Remove nickname from nicknameList (For checking nickname redundancy)
    const idx = nicknameList.indexOf(deletedNickname);
    if (idx > -1) nicknameList.splice(idx, 1);
  });
});

///////////////////////////////////////////////////////////

// 404 Error
app.use("*", (req, res) => {
  res.render("404");
});

/* CAUTION! 
    When using socket.io,
    use http.listen() to create a listener on the specified port or path */
http.listen(PORT, () => {
  console.log(`https://localhost:${PORT}`);
});
