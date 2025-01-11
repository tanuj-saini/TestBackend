import express from "express";
import dotenv from "dotenv";

import connectDB from "./db/index.js";
dotenv.config();
const app = express();
connectDB();


