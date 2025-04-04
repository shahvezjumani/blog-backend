import {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
  updatePost,
} from "../controllers/article.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";

const router = Router();

router.use(verifyJWT);

router.route("/createPost").post(upload.single("featuredImage"), createPost);
router.route("/getPosts").get(getAllPosts);
router.route("/getPost/:slug").get(getPost);
router.route("/deletePost/:slug").delete(deletePost);
router
  .route("/updatePost/:slugg")
  .post(upload.single("featuredImage"), updatePost);

export default router;
