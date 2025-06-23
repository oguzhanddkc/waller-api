import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip;
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return res.status(429).json({ error: "Too many requests" });
    }

    next();
  } catch (error) {
    console.log("Rate limiter error:", error);
    next(error);
  }
};

export default rateLimiter;
