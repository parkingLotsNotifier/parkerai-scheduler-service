const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const env = {
  PORT: process.env.PORT,
  ADDRS: process.env.ADDRS,
  QUEUE_NAME: process.env.QUEUE_NAME,
  API_GATEWAY_BASE_ADDRS: process.env.API_GATEWAY_BASE_ADDRS,
};

module.exports = env;
