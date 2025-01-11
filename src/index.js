import express from "express";
import dotenv from "dotenv";

import connectDB from "./db/index.js";
dotenv.config();
const app = express();


connectDB();

// ;(async ()=>{
//   try{
//     await mongoose.connect(DB)
//     app.on("error", (err) => {
//       console.error("ERROR:", err);
//       throw err;
//     });
//     app.listen(currentPORT, "0.0.0.0", () => {
//       console.log(`connected at port ${currentPORT}`);
//     });
    
    

//   }catch(e){
//     console.error("ERROR:",e)
//     throw e
//   }
// })()


