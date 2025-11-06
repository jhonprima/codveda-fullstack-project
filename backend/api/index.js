const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
// const http = require('http'); // Dinonaktifkan
// const { Server } = require('socket.io'); // Dinonaktifkan

// Impor rute
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();
// const httpServer = http.createServer(app); // Dinonaktifkan
const prisma = new PrismaClient();
// const io = new Server(httpServer, { ... }); // Dinonaktifkan

const PORT = 5000;

// MIDDLEWARE
app.use(cors({
    origin: 'http://localhost:5173', // Nanti kita tambahkan URL Vercel di sini
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());

// Middleware Prisma (Socket.io dinonaktifkan)
app.use((req, res, next) => {
    req.prisma = prisma;
    // req.io = io; // Dinonaktifkan
    next();
});

// RUTES
app.get('/', (req, res) => {
    res.send('Selamat Datang di Toko React Saya!');
});
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Logika Socket.io dinonaktifkan
// io.on('connection', (socket) => { ... });

// JALANKAN SERVER (Kembali ke 'app.listen')
app.listen(PORT, () => {
    console.log(`Server (NON-WebSocket) berjalan di http://localhost:${PORT}`);
});