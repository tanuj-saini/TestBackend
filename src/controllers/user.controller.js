import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import User from "../models/User.js";
import clodinary from "../utils/clodinary.js";
import ApiResponse from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    const{fullname,email,password,username}=req.body
    if([fullname,email,password,username].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required");
    }
    const existUser= User.findOne({$or:[{email},{username}]});
    if(existUser){
        throw new ApiError(409,"User already exists");
    }
     const avatarLocalPath= req.files?.avatar?.[0]?.path;
     const coverImageLocalPath = req.files?.cover?.[0]?.path;
     if(!avatarLocalPath ){
         throw new ApiError(400,"Avatar and cover image are required");
     }
     const avatar = await clodinary.upload(avatarLocalPath);
        const coverImage = await clodinary.upload(coverImageLocalPath);

    if(!avatar ){
        throw new ApiError(500,"Error uploading images");
    }  
    const user =await User.create({
        fullname,
        email,
        password,
        username,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });
    const createUser =await User.findById(user._id).select("-password -refreshToken");
    if(!createUser){
        throw new ApiError(500,"Error creating user");
    }
    console.log(createUser);
    return res.status(201).json(new ApiResponse(201,"User created Success",createUser));




}
); 
export { registerUser };
