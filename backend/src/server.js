const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const { Server } = require('socket.io');

// Impor semua rute Anda
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();
const httpServer = http.createServer(app);

// === INISIALISASI PRISMA (HANYA SEKALI) ===
// Kita buat satu instance dan biarkan Prisma mengelola koneksinya
const prisma = new PrismaClient();
// =========================================

// Inisialisasi Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Izinkan frontend React
        methods: ["GET", "POST"]
    }
});

const PORT = 5000;

// === MIDDLEWARE ===
// CORS harus dijalankan pertama
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Middleware untuk parsing JSON
app.use(express.json());

// === MIDDLEWARE PRISMA & IO (VERSI SEDERHANA) ===
// Kita hanya 'menempelkan' instance yang sudah ada ke setiap request
app.use((req, res, next) => {
    req.prisma = prisma; // Tempelkan instance Prisma
    req.io = io;       // Tempelkan instance Socket.io
    next();
});
// =============================================

// --- RUTES ---
app.get('/', (req, res) => {
    res.send('Selamat Datang di Toko React Saya!');
});
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// --- LOGIKA SOCKET.IO ---
io.on('connection', (socket) => {
    console.log(`🔌 Socket terhubung: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`🔌 Socket terputus: ${socket.id}`);
    });
});

// --- JALANKAN SERVER ---
httpServer.listen(PORT, () => {
    console.log(`Server (dan Socket.io) berjalan di http://localhost:${PORT}`);
    
    // Kita biarkan Prisma melakukan 'lazy connect' (terhubung saat query pertama).
    // Ini jauh lebih tahan banting terhadap database yang 'tertidur'.
});