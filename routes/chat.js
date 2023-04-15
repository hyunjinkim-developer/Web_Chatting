// Backend chat.js
// Base route: /chat

const express = require("express");
const controller = require("../controller/Cchat");
const router = express.Router();

router.get("/", controller.index);

// io.on("connection", controller.connection);

module.exports = router;
