import sqlite3 from 'sqlite3';

const DB_FILE = './database.sqlite';
const db = new sqlite3.Database(DB_FILE);

// Initialize tables if they don't exist
const initSQL = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    factory_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS factories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    industry_type TEXT,
    registration_number TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    latitude REAL,
    longitude REAL,
    annual_production_capacity INTEGER,
    number_of_employees INTEGER,
    esg_rating REAL,
    circularity_score REAL,
    hazardous_waste_license BOOLEAN,
    iso_certified BOOLEAN,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS factory_waste_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    factory_id INTEGER,
    waste_type TEXT,
    waste_category TEXT,
    average_quantity_per_month REAL,
    unit TEXT,
    hazardous BOOLEAN,
    storage_condition TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    factory_id INTEGER,
    product_type TEXT,
    production_volume REAL,
    production_month TEXT
);

CREATE TABLE IF NOT EXISTS waste_ratios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_type TEXT,
    waste_type TEXT,
    ratio REAL
);

CREATE TABLE IF NOT EXISTS emission_factors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material TEXT,
    virgin_emissions REAL,
    recycling_emissions REAL,
    transport_emissions REAL
);
`;

db.exec(initSQL, (err) => {
    if (err) console.error("DB Init Error:", err);
    else console.log("SQLite (Fallback) DB Initialized.");
});

function pgToSqlite(query, params) {
    let sqliteQuery = query;
    if (params) {
        params.forEach((_, i) => {
            sqliteQuery = sqliteQuery.replace(new RegExp(`\\$${i + 1}\\b`, 'g'), '?');
        });
    }
    // Format query correctly for sqlite
    // Also change true/false to 1/0 for sqlite dialect compat

    return sqliteQuery;
}

const pool = {
    query: (text, params) => {
        return new Promise((resolve, reject) => {
            const sqliteQuery = pgToSqlite(text, params);

            if (sqliteQuery.trim().toUpperCase().startsWith('SELECT') || sqliteQuery.toUpperCase().includes('RETURNING')) {
                db.all(sqliteQuery, params || [], (err, rows) => {
                    if (err) return reject(err);
                    resolve({ rows, rowCount: rows.length });
                });
            } else {
                db.run(sqliteQuery, params || [], function (err) {
                    if (err) return reject(err);
                    resolve({ rows: [], rowCount: this.changes });
                });
            }
        });
    }
};

export default pool;
