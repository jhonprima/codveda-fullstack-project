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

// === MIDDLEWARE (PERBAIKAN CORS ADA DI SINI) ===
app.use(cors({
    origin: [
        'http://localhost:5173', // Untuk lokal
        'https://codveda-fullstack-project-2g5r-poesxoosi-jhonprimas-projects.vercel.app', // URL Frontend Anda yang baru
        'https://codveda-fullstack-project-uwd7.vercel.app', // URL lama (jaga-jaga)
        'https://codveda-fullstack-project-2g5r-l63299pig-jhonprimas-projects.vercel.app' // URL lama (jaga-jaga)
    ], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());

// Middleware Prisma
app.use((req, res, next) => {
    req.prisma = prisma;
    next();
});

// === RUTES (SUDAH DIPERBAIKI TANPA /api GANDA) ===
app.get('/', (req, res) => {
    res.send('Selamat Datang di API Mini E-commerce (Vercel)');
});
app.use('/products', productRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/wishlist', wishlistRoutes);

// --- PENTING UNTUK VERCEL ---
module.exports = app;