const config = {
  API_URL:
    process.env.NODE_ENV == "production" ||
    (process.env.NODE_ENV == "development" &&
      process.env.TUNNELING_ENABLED == "true")
      ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      : "http://localhost:5000"
};

export default config;
