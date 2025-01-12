import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";


const generateRefreshTokenandAccessToken = async(userId) => {
    try{
      const user=  await User.findById(userId);
        if(!user){
            throw new ApiError(404,"User not found");
        }
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {refreshToken,accessToken};


    }catch(error){
        throw new ApiError(500,"Error generating tokens");
    }
}


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

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;
    if (!(email || username) || !password) {
        throw new ApiError(400, "Email/Username and password are required");
    }
    const user  = await User.findOne({$or:[{email},{username}]});
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        throw new ApiError(401, "Invalid credentials");
    }
     const {accessToken,refreshToken} = await  generateRefreshTokenandAccessToken(user._id)
     const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
      const options ={
        httpOnly:true,
        secure: true
      }
      return res.status(200).cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"Login success",));

   
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id,{"$set":{refreshToken : undefined }},{
    new:true
  });
  const options ={
    httpOnly:true,
    secure: true
  }
  return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options) 
    .json(new ApiResponse(200,{},"user logged out"));



});
    



export { registerUser,loginUser,logoutUser };