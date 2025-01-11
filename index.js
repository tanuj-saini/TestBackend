require("dotenv").config();
const express = require("express");
const app = express();
const currentPORT = process.env.PORT;

app.listen(currentPORT, "0.0.0.0", () => {
  console.log(`connected at port ${currentPORT}`);
});
