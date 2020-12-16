/* eslint-disable linebreak-style */
const { Pool } = require("pg");

require("dotenv").config();

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASS,
  port: process.env.PORT,
});

module.exports = pool;
