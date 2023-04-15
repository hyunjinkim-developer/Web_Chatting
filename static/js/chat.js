// Frontend chat.js

// Using Socket.IO, Add CDN
let socket = io.connect();

let myNickname;
let myColor;
let tempImagePath = "/static/src/img/MainProfile.jpg";

function enterChat() {
  socket.emit("setUserData", document.querySelector(".enter-nickname").value);
}

/* Send message to server */
function msgtoServer() {
  const msgData = {
    // To show sender's nickname and color to the receiver
    nickname: myNickname,
    color: myColor,

    msg: document.querySelector(".enter-message").value,
    // Set receiver's socket.id for DM, an option selected from select.nickname-list
    dm: document.querySelector(".nickname-list").value,
  };
  // Selected nickname of receiver for DM
  const selectTag = document.querySelector(".nickname-list");
  const receiver = selectTag.options[selectTag.selectedIndex].text;

  // Prevent sending message to oneself
  if (receiver === myNickname) {
    alert("You cannot send message to yourself!");
    return;
  }

  // Show DM on my-chat
  if (msgData.dm !== "all") {
    let chatList = document.querySelector(".chat-list");

    let msgBox = document.createElement("div");
    msgBox.classList.add("vertical-center");

    let profile = document.createElement("div");
    profile.setAttribute("class", "profile");

    let profileImage = document.createElement("img");
    profileImage.setAttribute("class", "profile-img");
    profileImage.setAttribute("alt", "MainProfile");
    // Set profile image from server ??????
    profileImage.setAttribute("src", tempImagePath);

    let nickname = document.createElement("div");

    nickname.textContent = `${myNickname} 👉🏻 ${receiver}`;
    nickname.style.color = "whitesmoke";

    let msg = document.createElement("div");
    msg.setAttribute("class", "message");

    msgBox.classList.add("my-chat");

    msg.textContent = msgData.msg;
    msg.style.background = msgData.color; // Change color of message
    msg.classList.add("secret-chat");

    // Show element in client browser
    chatList.append(msgBox);
    msgBox.appendChild(profile);
    msgBox.appendChild(msg);
    profile.appendChild(profileImage);
    profile.appendChild(nickname);
  }

  socket.emit("msgtoServer", msgData);

  // Clear input.enter-message tag
  document.querySelector(".enter-message").value = "";
}

socket.on("connect", () => {
  console.log("⭕ Cli️ent socket connected >>", socket.id);
});

/* Notice users status */
socket.on("noticeEnter", (msg) => {
  document
    .querySelector(".chat-list")
    .insertAdjacentHTML("beforeend", `<div class="notice-enter">${msg}</div>`);
});

socket.on("noticeLeave", (msg) => {});

/* When the user successfully enters the chat */
socket.on("enterySuccess", (userData) => {
  myNickname = userData.nickname;
  myColor = userData.color;

  // Remove .enter-chat-box
  document.querySelector(".enter-chat-box").classList.add("display-none");
  // Show div.chat-box
  document.querySelector(".chat-box").classList.remove("display-none");
});

/* Update nickname list in client side every time when new user user enters or leaves
    Add a new user as a option tag of select.nickname-list tags */
socket.on("updateNicknameList", (userObj) => {
  // userObj -> { socket.id: {nickname: [nickname], color: [color]} }

  // Default options is to send message to all user
  let options = `<option value="all">All</option>`;

  for (let key in userObj) {
    // option: value: [socket.id] or "all"
    options += `<option value=${key}>${userObj[key].nickname}</option>`;
  }
  // Replace div.nickname-list with updated select tag
  document.querySelector(".nickname-list").innerHTML = options;
});

/* Get message from server */
socket.on("msgtoClient", (msgData) => {
  /* msgData -> {
        nickname: "",
        color: "",
        msg: "",
        dm: "[socket.id of receiver]"
      } */

  let chatList = document.querySelector(".chat-list");

  let msgBox = document.createElement("div");
  msgBox.classList.add("vertical-center");

  let profile = document.createElement("div");
  profile.setAttribute("class", "profile");

  let profileImage = document.createElement("img");
  profileImage.setAttribute("class", "profile-img");
  profileImage.setAttribute("alt", "MainProfile");

  let nickname = document.createElement("div");

  let msg = document.createElement("div");
  msg.setAttribute("class", "message");

  if (msgData.dm === "all") {
    // Message sent to all
    if (msgData.nickname === myNickname) {
      // My message
      msgBox.classList.add("my-chat");
    } else {
      // Other's message
      msgBox.classList.add("other-chat");
    }
  } else {
    // Direct Message
    msg.classList.add("secret-chat");
  }

  // Set profile image from server ??????
  profileImage.setAttribute("src", tempImagePath);
  // Set nickname and message data from server
  nickname.textContent = msgData.nickname;
  nickname.style.color = "whitesmoke";
  msg.textContent = msgData.msg;
  // Change color of message
  msg.style.background = msgData.color;

  // Show element in client browser
  chatList.append(msgBox);
  msgBox.appendChild(profile);
  msgBox.appendChild(msg);
  profile.appendChild(profileImage);
  profile.appendChild(nickname);
});

/* Error Handling */
socket.on("errorSameNickname", (msg) => {
  alert(msg);
});
