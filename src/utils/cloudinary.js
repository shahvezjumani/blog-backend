// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });
//     console.log("FILE is uploaded on Cloudinary", response.url);
//     console.log("Cloudinary response", response);
//     fs.unlinkSync(localFilePath);
//     return response;
//   } catch (error) {
//     fs.unlinkSync(localFilePath);
//     return null;
//   }
// };

// export { uploadOnCloudinary };

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // auto type for image, video, and other files
    });
    console.log("FILE is uploaded on Cloudinary", response.url);
    console.log("Cloudinary response", response);
    fs.unlinkSync(localFilePath); // Delete local file after uploading
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // Ensure the local file is deleted even on error
    console.error("Error uploading file to Cloudinary", error);
    return null;
  }
};

// Function to delete file from Cloudinary
const deleteFileFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary delete response", result);
    if (result.result === "ok") {
      console.log("File deleted successfully from Cloudinary");
      return true;
    } else {
      console.error("Failed to delete file from Cloudinary");
      return false;
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary", error);
    return false;
  }
};

export { uploadOnCloudinary, deleteFileFromCloudinary };
