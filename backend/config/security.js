module.exports = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  helmet: {
    enabled: true,
    contentSecurityPolicy: true,
  },
  validation: {
    enabled: true,
    strict: true,
  },
};
