import dotenv from "dotenv";
dotenv.config();
import pool from "./config/database.js";

async function run() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'factory_waste_profiles';");
    console.log("COLUMNS:", res.rows);
  } catch(err) {
    console.error("ERROR:", err);
  } finally {
    process.exit(0);
  }
}
run();
