require("dotenv").config();
const express = require("express");
const app = express();
const currentPORT = process.env.PORT;

app.get("/hello", (req, res) => {
  res.send("hello");
});

app.listen(currentPORT, "0.0.0.0", () => {
  console.log(`connected at port ${currentPORT}`);
});
