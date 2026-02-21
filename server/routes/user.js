import {Router} from "express"
import pool from "../config/database.js"

const router = Router();

router.get("/", async (req, res) => {
   const result = await pool.query("SELECT * FROM students");
    res.status(200).json({
        data: result.rows,
        message: "Users fetched successfully"
    });
});

export default router;
