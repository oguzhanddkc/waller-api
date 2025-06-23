import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRouter from "./routes/transactionsRouter.js";
import job from "./config/cron.js";

dotenv.config();
const app = express();

if (process.env.NODE_ENV !== "production") {
  job.start();
}

const PORT = process.env.PORT || 5001;

// Middleware to parse JSON requests
app.use(rateLimiter);
app.use(express.json());
// app.use((req, res, next) => {
//   console.log(`${req.method} request for '${req.url}'`);
//   next();
// });

app.get("api/health", (req, res) => {
  res.status(200).json({ message: "API is healthy" });
});

app.use("/api/transactions", transactionsRouter);
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
