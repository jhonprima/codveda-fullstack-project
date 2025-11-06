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

// === MIDDLEWARE (INI BAGIAN YANG DIPERBAIKI) ===
app.use(cors({
    origin: [
        'http://localhost:5173', // Untuk lokal
        'https://codveda-fullstack-project-2g5r.vercel.app', // Deploy lama Anda
        'https://codveda-fullstack-project-uwd7.vercel.app'  // Deploy baru Anda
    ], 
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
app.get('/api', (req, res) => {
    res.send('Selamat Datang di API Mini E-commerce (Vercel)');
});
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// --- PENTING UNTUK VERCEL ---
module.exports = app;