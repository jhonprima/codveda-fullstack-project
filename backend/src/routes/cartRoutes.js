const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Middleware Cek Role (Khusus Consumen)
// Kita buat penjaga baru khusus untuk consumen
const isConsumen = (req, res, next) => {
    // req.user didapat dari middleware 'protect'
    if (req.user && req.user.role === 'CONSUMEN') {
        next(); // Lanjutkan jika dia consumen
    } else {
        res.status(403).json({ message: 'Akses ditolak. Hanya untuk consumen.' });
    }
};

// --- RUTE KERANJANG ---

// GET /api/cart (Mendapatkan isi keranjang user)
// Dilindungi: user harus login DAN harus consumen
router.get('/', [protect, isConsumen], async (req, res) => {
    try {
        const { prisma } = req;
        const userId = req.user.id; // Didapat dari token

        const cartItems = await prisma.cartItem.findMany({
            where: { userId: userId },
            include: { 
                product: true // Langsung sertakan data produknya (nama, harga)
            } 
        });

        res.json(cartItems);

    } catch (error) {
        console.error('Error GET /cart:', error);
        res.status(500).json({ message: 'Error mengambil keranjang' });
    }
});

// POST /api/cart (Menambah/update barang ke keranjang)
// Dilindungi: user harus login DAN harus consumen
router.post('/', [protect, isConsumen], async (req, res) => {
    try {
        const { prisma } = req;
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({ message: 'Perlu productId dan quantity' });
        }
        
        const intProductId = parseInt(productId);
        const intQuantity = parseInt(quantity);

        if (intQuantity <= 0) {
            return res.status(400).json({ message: 'Quantity harus lebih dari 0' });
        }

        // 'upsert' adalah perintah "pintar":
        // Dia akan mencari item berdasarkan 'where'.
        // Jika ADA, dia akan 'update'.
        // Jika TIDAK ADA, dia akan 'create'.
        const cartItem = await prisma.cartItem.upsert({
            where: {
                // Ini mencari berdasarkan index unik yg kita buat
                userId_productId: { 
                    userId: userId,
                    productId: intProductId
                }
            },
            update: {
                // Jika sudah ada, tambahkan quantity-nya
                quantity: {
                    increment: intQuantity
                }
            },
            create: {
                // Jika belum ada, buat baru
                userId: userId,
                productId: intProductId,
                quantity: intQuantity
            }
        });

        res.status(201).json(cartItem);

    } catch (error) {
        console.error('Error POST /cart:', error);
        res.status(500).json({ message: 'Error menambah ke keranjang' });
    }
});

module.exports = router;