const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Middleware Cek Role (Khusus Consumen)
const isConsumen = (req, res, next) => {
    if (req.user && req.user.role === 'CONSUMEN') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak. Hanya untuk consumen.' });
    }
};

// GET /api/wishlist (Mendapatkan semua item wishlist user)
router.get('/', [protect, isConsumen], async (req, res) => {
    try {
        const { prisma } = req;
        const userId = req.user.id; 

        const wishlistItems = await prisma.wishlistItem.findMany({
            where: { userId: userId },
            include: { 
                product: true // Sertakan data produknya
            } 
        });

        res.json(wishlistItems);

    } catch (error) {
        console.error('Error GET /wishlist:', error);
        res.status(500).json({ message: 'Error mengambil wishlist' });
    }
});

// POST /api/wishlist (Menambah/menghapus item dari wishlist)
router.post('/', [protect, isConsumen], async (req, res) => {
    try {
        const { prisma } = req;
        const userId = req.user.id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Perlu productId' });
        }

        const intProductId = parseInt(productId);

        // Cek apakah item sudah ada di wishlist
        const existingItem = await prisma.wishlistItem.findUnique({
            where: {
                userId_productId: { userId: userId, productId: intProductId }
            }
        });

        if (existingItem) {
            // Jika sudah ada, hapus (Toggle OFF)
            await prisma.wishlistItem.delete({
                where: { id: existingItem.id }
            });
            return res.status(200).json({ message: 'Dihapus dari wishlist', added: false });
        } else {
            // Jika belum ada, buat (Toggle ON)
            const newItem = await prisma.wishlistItem.create({
                data: { userId: userId, productId: intProductId }
            });
            return res.status(201).json({ message: 'Ditambahkan ke wishlist', added: true });
        }

    } catch (error) {
        console.error('Error POST /wishlist:', error);
        res.status(500).json({ message: 'Error toggle wishlist' });
    }
});

module.exports = router;