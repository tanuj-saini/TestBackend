import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';



// export const VerifyJWT = asyncHandler(async (req, res, next) => {
//     try {
//         const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "");
//         console.log(token);
//         if (!token) {
//             throw new ApiError(401, "Unauthorized");
//         }
//         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//         const user = await User.findById(decodedToken._id).select("-password -refreshToken");
//         if (!user) {
//             throw new ApiError(404, "User not found");
//         }
//         req.user = user;
//         next();
//     } catch (error) {
//         console.log(error);
//         next(new ApiError(401, error?.message || "Unauthorized"));
//     }
// });

export const VerifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Retrieve token from cookies or authorization header
        const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "");
        console.log(token);

        if (!token) {
            // No token provided
            throw new ApiError(401, "Access token missing");
        }

        try {
            // Verify the token
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken._id).select("-password -refreshToken");
            if (!user) {
                throw new ApiError(404, "User not found");
            }

            // Attach the user to the request object and proceed
            req.user = user;
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                // Access token has expired
                return res.status(401).json({
                    error: "Access token expired",
                    code: "TOKEN_EXPIRED",
                });
            } else if (error.name === "JsonWebTokenError") {
                // Invalid token
                return res.status(401).json({
                    error: "Invalid access token",
                    code: "TOKEN_INVALID",
                });
            } else {
                // Other errors
                throw new ApiError(401, error.message || "Unauthorized");
            }
        }
    } catch (error) {
        console.log(error);
        next(new ApiError(401, error.message || "Unauthorized"));
    }
});