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
    origin: [
        'http://localhost:5173', 
        'https://codveda-fullstack-project-2g5r-poesxoosi-jhonprimas-projects.vercel.app', // URL Frontend Anda
        'https://codveda-fullstack-project-uwd7-knskehwhh-jhonprimas-projects.vercel.app' // URL Frontend Anda yang lain
    ], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());

// Middleware Prisma
app.use((req, res, next) => {
    req.prisma = prisma;
    next();
});

// === RUTES (PERBAIKAN DI SINI) ===
// Kita HAPUS '/api' dari semua rute
// Vercel sudah menangani '/api' berdasarkan struktur folder

app.get('/', (req, res) => { // Rute dasar (root) untuk /api
    res.send('Selamat Datang di API Mini E-commerce (Vercel)');
});
app.use('/products', productRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/wishlist', wishlistRoutes);

// --- PENTING UNTUK VERCEL ---
module.exports = app;