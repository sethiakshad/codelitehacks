import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;
const pool = new Pool({
    user: process.env.POSTGRE_USER,
    host: process.env.POSTGRE_HOST,
    database: process.env.POSTGRE_DATABASE,
    password: process.env.POSTGRE_PASSWORD,
    port: Number(process.env.POSTGRE_PORT),
    ssl: {
        rejectUnauthorized: false
    }
});

console.log();

export default pool;