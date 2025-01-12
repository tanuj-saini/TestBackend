import {asyncHandler} from '../utils/asyncHandler';
import {ApiError} from '../utils/ApiError';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
export const VerifyJWT = asyncHandler(async (req, _ , next) => {
   
   try {
     const token = req.cookies?.accessToken || req.headers("authorization")?.replace("Bearer ","");
     if(!token){
         throw new ApiError(401,"Unauthorized");
     }
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    const user= await User.findById(decodedToken._id).select("-password -refreshToken");
     if(!user){
          throw new ApiError(404,"User not found");
     }
     req.user = user;
     next();
   } catch (error) {
       throw new ApiError(401,err?.message || "Unauthorized");
    
   }


    
}
);