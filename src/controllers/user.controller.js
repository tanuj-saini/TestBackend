import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    const{fullname,email,password,username}=req.body
    if([fullname,email,password,username].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required");
    }
    const existUser=await User.findOne({$or:[{email},{username}]});
    if(existUser){
        throw new ApiError(409,"User already exists");
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
     const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
   
    

     console.log(avatarLocalPath,coverImageLocalPath);
     if(!avatarLocalPath ){
         throw new ApiError(400,"Avatar and cover image are required");
     }
     const avatar = await uploadCloudinary(avatarLocalPath);
        const coverImage = await uploadCloudinary(coverImageLocalPath);

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