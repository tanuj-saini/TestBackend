import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';



export const VerifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "");
        console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        next(new ApiError(401, error?.message || "Unauthorized"));
    }
});
// import asyncHandler from '../utils/asyncHandler.js';
// import {ApiError} from '../utils/ApiError.js';
// import jwt from 'jsonwebtoken';
// import {User} from '../models/user.model.js';
// export const VerifyJWT = asyncHandler(async (req, _ , next) => {
   
//    try {
//      const token = req.cookies?.accessToken || req.headers("authorization")?.replace("Bearer ","");
//      if(!token){
//          throw new ApiError(401,"Unauthorized");
//      }
//     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
//     const user= await User.findById(decodedToken._id).select("-password -refreshToken");
//      if(!user){
//           throw new ApiError(404,"User not found");
//      }
//      req.user = user;
//      next();
//    } catch (error) {
//     console.log(error);
//        throw new ApiError(401,err?.message || "Unauthorized");
//    }
// }
// );