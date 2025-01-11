import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const currentPORT = process.env.PORT || 8080;

app.get("/hello", (req, res) => {
  res.send("hello");
});
app.get("/king", (req, res) => {});

app.listen(currentPORT, "0.0.0.0", () => {
  console.log(`connected at port ${currentPORT}`);
});
