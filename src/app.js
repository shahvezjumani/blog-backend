import express, { json, urlencoded } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import { ApiResponse } from "./utils/ApiResponse.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  json({
    limit: "16kb",
  })
);
app.use(
  urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(cookieparser());
app.use(express.static("public"));

// Global error handler middleware
// app.use((err, req, res, next) => {
//   const statusCode = err.statusCode || 500;

//   res.status(statusCode).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//     error: err.error || [],
//   });
// });

console.log(process.env.CORS_ORIGIN);

app.get("/api/data", (req, res) => {
  res.json(new ApiResponse(200, {}, "Hello Shahvez"));
});

import userRouter from "./routes/user.routes.js";
import articleRouter from "./routes/article.routes.js";
app.use("/api/v1/users", userRouter);
app.use("/api/v1/articles", articleRouter);

export default app;
