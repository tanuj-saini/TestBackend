import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";




//User Session
const generateRefreshTokenandAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
     
            return res.status(404).json(new ApiError(404, "User not found"));
        }
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { refreshToken, accessToken };
    } catch (error) {

        return res.status(500).json(new ApiError(500, "Error generating tokens"));
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const{fullname,email,password,username}=req.body
    if([fullname,email,password,username].some((field)=>field?.trim()==="")){
        
        return res.status(400).json(new ApiError(400,"All fields are required"));
    }
    const existUser=await User.findOne({$or:[{email},{username}]});
    if(existUser){
        
        return res.status(409).json(new ApiError(409,"User already exists"));
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
     const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
   
    

     console.log(avatarLocalPath,coverImageLocalPath);
     if(!avatarLocalPath ){
        
         return res.status(400).json(new ApiError(400,"Avatar and cover image are required"));
     }
     const avatar = await uploadCloudinary(avatarLocalPath);
        const coverImage = await uploadCloudinary(coverImageLocalPath);

    if(!avatar ){
      
        return res.status(500).json(new ApiError(500,"Error uploading images"));
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

        return res.status(500).json(new ApiError(500,"Error creating user"));
    }
    console.log(createUser);
    return res.status(201).json(new ApiResponse(201,"User created Success",createUser));




}
); 
// Assuming asyncHandler is properly set



const loginUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;
   if (!(email || username) || !password) {

   return res.status(400).json(new ApiError(400, "Email/Username and password are required"));
    }
   const user = await User.findOne({ $or: [{ email }, { username }] });
   if (!user) {
   
   return res.status(404).json(new ApiError(404, "User not found"));
    }
   const isPasswordMatch = await user.comparePassword(password);
   if (!isPasswordMatch) {
    return res.status(406).json(new ApiError(406, "Invalid credentials"));
    }
   const { refreshToken, accessToken } = await generateRefreshTokenandAccessToken(user._id);
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
   const options = {
   httpOnly: true,
   secure: true
    };
   return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
   .json(new ApiResponse(
    200, 
    {
        user: loggedInUser, accessToken, refreshToken
    },
    "User logged In Successfully"
));
   });

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { "$unset": { refreshToken: 1 } }, { new: true });
    const options = {
        httpOnly: true,
        secure: true
    };
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});




















//Tokens
const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken|| req.headers["authorization"]?.replace("Bearer ", ""); 
    if (!refreshToken) {

        return res.status(402).json(new ApiError(402, "Unauthorized"));
    }
    try {
        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {

            
            return res.status(404).json(new ApiError(404, "User not found"));
        }
        if(user?.refreshToken !== refreshToken){
     
            return res.status(402).json(new ApiError(402,"Refresh Token Expired"));
        }
        const options = {
            httpOnly:true,
            secure:trueu
        }
        const {accessToken,newRefreshToken} = await generateRefreshTokenandAccessToken(user._id);
        return res.status(200).cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(new ApiResponse(200,{accessToken,newRefreshToken},"Token refreshed successfully"));
    } catch (error) {
  
        return res.status(402).json(new ApiError(401, error?.message || "Invalid Refresh Token"));
        
    }
})
















//UserModification
const changePassword = asyncHandler(async (req, res)=> {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {

        return res.status(400).json(new ApiError(400, "Old password and new password are required"));
    }
    const user =await User.findById(req.user?._id);
    if (!user) {
     
        return res.status(404).json(new ApiError(404, "User not found"));
    }
    const isPasswordMatch = await user.comparePassword(oldPassword);
    if (!isPasswordMatch) {
  
        return res.status(402).json(new ApiError(402, "Invalid credentials"));
    }
    user.password = newPassword;
    await user.save({
        validateBeforeSave: false
    });
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));

});
    
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) {

        return res.status(404).json(new ApiError(404, "User not found"));
    }
    return res.status(200).json(new ApiResponse(200, user, "User found"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullname, email, username } = req.body;
    if (!fullname || !email  || !username) {

        return res.status(400).json(new ApiError(400, "At least one field is required"));
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set :{
        fullname,
        email,
        username
    
    }
} ,{
        new: true,// update hone ke bad updated data return karega
      
    }).select("-password -refreshToken");
    if (!user) {
      
        return res.status(404).json(new ApiError(404, "User not found"));
    }
    return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.path;
    if (!avatarLocalPath) {
       
        return res.status(400).json(new ApiError(400, "Avatar is required"));
    }
    const avatar = await uploadCloudinary(avatarLocalPath);
    if (!avatar.url) {
       
        return res.status(500).json(new ApiError(500, "Error uploading image"));
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
        avatar: avatar.url
        }
    }, {
        new: true
    }).select("-password -refreshToken");
    if (!user) {

        return res.status(404).json(new ApiError(404, "User not found"));
    }
    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
}) 

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.files?.path;
    if (!coverImageLocalPath) {

        return res.status(400).json(new ApiError(400, "Cover image is required"));
    }
    const coverImage = await uploadCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
   
        return res.status(500).json(new ApiError(500, "Error uploading image"));
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
        coverImage: coverImage.url
        }
    }, {
        new: true
    }).select("-password -refreshToken");
    if (!user) {
        
        return res.status(404).json(new ApiError(404, "User not found"));
    }
    return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"));
})













//Aggregation
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if(!username){

        return res.status(400).json(new ApiError(400,"Username is missing"));
    }
    //we can do with find user by username then find by id
    const channel =await   User.aggregate([
       {
              $match:{
                username : username?.toLowerCase()
              }
         },
         {
              $lookup:{
                from:"subcriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
              }
         },
        {
            $lookup:{
                from:"subcriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{$size:"$subscribers"},//$ is used to access the fields//count :{$size:"$matcheq"}
                subscribedToCount:{$size:"$subscribedTo"},
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                }

            }
        }
        
        },
        {
            $project:{
                fullname:1,
                username:1,
                avatar:1,
                coverImage:1,
                isSubscribed:1,
                subscriberCount:1,

               subscribedToCount:1
            }
        }
     ]);
        if(!channel?.length){

            return res.status(404).json(new ApiError(404,"Channel not found"));
        }
        return res.status(200).json(new ApiResponse(200,channel[0],"Channel found"));


});

const watchHistorys = asyncHandler(async (req, res) => {
    const user = User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id) 
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline :[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $arrayElemAt:["$owner",0]
                            }
                        }
                    }
                ]

            }
        },
       
    ]);
    return res.status(200).json(new ApiResponse(200, user[0].watchHistory,
         "Watch history found"));

})








export { registerUser,loginUser,logoutUser,getCurrentUser,
    changePassword,updateUserDetails,updateUserAvatar,
    updateUserCoverImage ,refreshAccessToken,
    watchHistorys,getUserChannelProfile};    