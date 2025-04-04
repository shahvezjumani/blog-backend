import mongoose, { Schema } from "mongoose";

const articleShema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    featuredImage: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true, // Ensure the slug is unique
      index: true,  // Make slug searchable for efficiency
    },
    status: {
      type: String,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Article = mongoose.model("Article", articleShema);
