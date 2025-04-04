import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  if ([userName, email, password].some((field) => field === "")) {
    throw new ApiError(400, "All Fields are Required");
  }

  const userExist = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (userExist) {
    throw new ApiError(400, "User Already exists");
  }

  const user = await User.create({
    userName,
    email,
    password,
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError(500, "Something went wrong while registering the User");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userCreated, "User Registered Successfully"));
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    console.log("jelllj");
    console.log(`accessToken ${accessToken}  refreshToken ${refreshToken}`);
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "All Fields are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User does not exists");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  console.log(`accessToken1 ${accessToken}  refreshToken1 ${refreshToken}`);

  const updatedUser = User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(200, updatedUser, "User LoggedIn Successfully");
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log(`${user}:Ima sdfjkshf`);

  if (!user) {
    throw new ApiError("Unauthorized request");
  }

  const updatedUser = await User.findByIdAndUpdate(
    user?._id,
    { refreshToken: "" },
    { new: true }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError("Unauthorized request");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  console.log("ok");

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(200, updatedUser, "User LoggedOut Successfully");
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "unAuthorized Request");
  }

  const fetchedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, fetchedUser, "User fetched Successfully"));
});

export { registerUser, loginUser, logoutUser, getCurrentUser };
