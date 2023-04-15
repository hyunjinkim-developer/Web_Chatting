// Backend index.js
// Base route: /

const express = require("express");
const controller = require("../controller/Cindex");
const router = express.Router();

router.get("/", controller.index);

module.exports = router;
