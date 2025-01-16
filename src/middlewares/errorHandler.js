
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(new ApiResponse(err.statusCode, err.message, null, err.errors));
    }
    console.error(err);
    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
};

export default errorHandler;