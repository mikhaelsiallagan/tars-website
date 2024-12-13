require('dotenv').config(); // Memuat variabel dari file .env

const express = require('express');
const cors = require('cors'); // Import middleware CORS
const app = express();

// Tambahkan middleware CORS
app.use(cors());

// Middleware untuk menangani JSON
app.use(express.json());

// Cek koneksi ke database (contoh dengan pg)
const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432 // Default PostgreSQL port
});

// Tes koneksi ke database
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to database:', res.rows[0]);
    }
});

// Middleware untuk menangani JSON
app.use(express.json()); // Menambahkan middleware untuk membaca body request dalam format JSON

// Endpoint utama
app.get('/', (req, res) => {
    res.send('Backend with environment variables is working!');
});

// Endpoint POST /api/scans
app.post('/api/scans', async (req, res) => {
    const { detected_type, image_url } = req.body; // Data dari ESP32

    if (!detected_type || !image_url) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO scans (detected_type, image_url) VALUES ($1, $2) RETURNING *`,
            [detected_type, image_url]
        );

        res.status(201).json({ message: 'Scan saved', data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save scan' });
    }
});

// Endpoint GET /api/scans untuk log aktivitas
app.get('/api/scans', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM scans ORDER BY timestamp DESC`);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch scans' });
    }
});

// Endpoint GET /api/stats (untuk mendapatkan statistik sampah)
app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT detected_type, COUNT(*) AS count FROM scans GROUP BY detected_type`
        );

        const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
        const stats = result.rows.map(row => ({
            type: row.detected_type,
            count: parseInt(row.count),
            percentage: ((row.count / total) * 100).toFixed(2)
        }));

        res.status(200).json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Endpoint untuk data grafik donat
app.get('/donut-data', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT detected_type, COUNT(*) AS count FROM scans GROUP BY detected_type`
        );

        const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);

        const labels = result.rows.map(row => row.detected_type);
        const values = result.rows.map(row => ((row.count / total) * 100).toFixed(2));

        res.status(200).json({ labels, values });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch donut data' });
    }
});

// Jalankan server
const PORT = process.env.PORT || 4232;
app.listen(PORT, () => {
    // console.log(`Server is running on http://localhost:${PORT}`);
});