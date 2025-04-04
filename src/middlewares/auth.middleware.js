import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      throw new ApiError(400, "Unauthorized request");
    }

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(400, "Invalid AccessToken kk");
    }

    req.user = user;
    console.log("user", user);

    next();
  } catch (error) {
    throw new ApiError(401, "Invalid AccessToken ll");
  }
});

// const verifyJWT = asyncHandler(async (req, res, next) => {
//   try {
//     const token =
//       req.cookies?.accessToken ||
//       req.header("Authorization")?.replace("Bearer ", "");

//     console.log(`fetch token ${token}`);

//     if (!token) {
//       throw new ApiError(401, "Access token is required");
//     }

//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//     const user = await User.findById(decodedToken._id).select(
//       "-password -refreshToken"
//     );
//     if (!user) {
//       throw new ApiError(401, "Invalid access token");
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       throw new ApiError(401, "Token has expired");
//     } else if (error.name === "JsonWebTokenError") {
//       throw new ApiError(401, "Invalid token");
//     } else {
//       throw new ApiError(401, error?.message || "Invalid access token");
//     }
//   }
// });

export { verifyJWT };
