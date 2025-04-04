import { asyncHandler } from "../utils/asyncHandler.js";
import { Article } from "../models/article.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFileFromCloudinary,
} from "../utils/cloudinary.js";

const validateFields = (fields) => {
  if (fields.some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
};

const createPost = asyncHandler(async (req, res) => {
  const { title, content, status, slug } = req.body;
  console.log("I am create check", title, content, status, slug);

  validateFields([title, content, status, slug]);

  const articeExist = await Article.findOne({ slug });
  if (articeExist) {
    throw new ApiError(400, "Post already exists");
  }

  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const featuredImageLocalPath = req.file?.path;
  if (!featuredImageLocalPath) {
    throw new ApiError(400, "FeaturedImage is Required");
  }

  const featuredImage = await uploadOnCloudinary(featuredImageLocalPath);
  if (!featuredImage) {
    throw new ApiError(
      500,
      "Something went wrong while uploading featured image on Cloudinary"
    );
  }

  const article = await Article.create({
    title,
    content,
    status,
    owner: user?._id,
    featuredImage: featuredImage?.url || "",
    slug,
  });

  if (!article) {
    // const publicId = featuredImage.url.split("/").pop().split(".")[0];
    const isImageDeleted = await deleteFileFromCloudinary(
      featuredImage?.publicId
    );
    if (!isImageDeleted) {
      throw new ApiError(500, "Failed to delete image from Cloudinary");
    }
    throw new ApiError(500, "Somewent went wrong while creating the post");
  }

  // const imageUrl = article.featuredImage;

  return res
    .status(201)
    .json(new ApiResponse(201, article, "Post Created Sucessfully"));
});

const updatePost = asyncHandler(async (req, res) => {
  const { title, content, status, slug } = req.body;
  const { slugg } = req.params;

  console.log("I am update check", title, content, status, slugg);

  validateFields([title, content, status]);

  const articleExist = await Article.findById(slugg);
  if (!articleExist) {
    throw new ApiError(400, "Post does not exists");
  }

  const user = req.user;
  if (!user) {
    throw new ApiError(400, "Unathorized Request");
  }

  if (articleExist.owner.toString() !== user._id?.toString()) {
    throw new ApiError(400, "User is not the owner of the post");
  }

  const imageUrl = articleExist.featuredImage;
  const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract publicId from URL

  // const isImageDeleted = await deleteFileFromCloudinary(publicId);
  // if (!isImageDeleted) {
  //   throw new ApiError(500, "Failed to delete image from Cloudinary");
  // }

  const featuredImageLocalPath = req.file?.path;
  if (!featuredImageLocalPath) {
    throw new ApiError(400, "FeaturedImage is Required");
  }

  const featuredImage = await uploadOnCloudinary(featuredImageLocalPath);
  if (!featuredImage) {
    throw new ApiError(
      500,
      "Something went wrong while uploading featured image on Cloudinary"
    );
  }

  const article = await Article.findByIdAndUpdate(
    slugg,
    {
      $set: {
        title,
        content,
        status,
        owner: user?._id,
        featuredImage: featuredImage?.url || "",
      },
    },
    { new: true }
  );

  // if (!article) {
  //   throw new ApiError(500, "Somewent went wrong while updating the post");
  // }

  return res
    .status(200)
    .json(new ApiResponse(200, article, "Post Updated Sucessfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  // const { slug } = req.body;
  const { slug } = req.params;
  if (!slug) {
    throw new ApiError(400, "Slug is needed");
  }

  const article = await Article.findById(slug);
  if (!article) {
    throw new ApiError(400, "Post does not exists");
  }

  const user = req.user;
  if (!user) {
    throw new ApiError(400, "Unathorized Request");
  }

  if (article.owner.toString() !== user._id?.toString()) {
    throw new ApiError(400, "User is not the owner of the post");
  }

  const imageUrl = article.featuredImage;
  const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract publicId from URL

  const isImageDeleted = await deleteFileFromCloudinary(publicId);
  if (!isImageDeleted) {
    throw new ApiError(500, "Failed to delete image from Cloudinary");
  }

  await Article.findByIdAndDelete(slug);

  // const articleExist = await Article.findOne({ slug });
  // if (articleExist) {
  //   throw new ApiError(400, "something went wrong while deleting the post");
  // }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

const getPost = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    throw new ApiError(400, "Slug is required");
  }

  // const user = req.user;
  // if (!user) {
  //   throw new ApiError(400, "Unathorized Request");
  // }

  const article = await Article.findById(slug);
  if (!article) {
    throw new ApiError(400, "Post does not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, article, "Post fetched Successfully"));
});

const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Article.find({});
  if (posts.length === 0) {
    throw new ApiError(200, "Posts does not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "All posts fetched successfully"));
});

const getFilePreview = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "Unauthorized user");
  }

  const featuredImage = Article.findOne({ owner: user?._id }).featuredImage;

  if (!featuredImage) {
    throw new ApiError(400, "Image does not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, featuredImage, "Image fetched successfully"));
});

export { createPost, updatePost, deletePost, getPost, getAllPosts };
