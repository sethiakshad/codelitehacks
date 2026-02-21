import pool from "./config/database.js";

async function test() {
    try {
        console.log("Checking factories table...");
        const result = await pool.query(
            `SELECT column_name, data_type, is_nullable
             FROM information_schema.columns 
             WHERE table_name = 'factories'`
        );
        console.log("Columns:", result.rows);
        process.exit(0);
    } catch (err) {
        console.error("DB Error:", err.message);
        process.exit(1);
    }
}
test();
