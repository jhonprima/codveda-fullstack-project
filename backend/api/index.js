const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Impor rute
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();
const prisma = new PrismaClient();

// MIDDLEWARE
app.use(cors({
    // Nanti kita akan tambahkan URL Vercel frontend di sini
    origin: ['http://localhost:5173', 'https://NAMA-FRONTEND-ANDA.vercel.app'], 
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
// Kita tambahkan /api di depan rute dasar agar Vercel mudah membacanya
app.get('/api', (req, res) => {
    res.send('Selamat Datang di API Mini E-commerce (Vercel)');
});
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// --- PENTING UNTUK VERCEL ---
// HAPUS 'app.listen()' DAN GANTI DENGAN INI:
module.exports = app;