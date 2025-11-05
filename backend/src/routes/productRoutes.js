const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const ImageKit = require('imagekit');

// --- Konfigurasi (Tidak Berubah) ---
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});
const upload = multer({ storage: multer.memoryStorage() });
// ---------------------------------


// C = CREATE (Menambahkan produk baru)
// === PERBAIKAN WEBSOCKET DI SINI ===
router.post(
    '/',
    protect,
    upload.single('image'),
    async (req, res) => {
        try {
            // 1. Ambil 'prisma' DAN 'io' dari request
            const { prisma, io } = req; 
            
            const { name, price } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ message: 'File gambar wajib di-upload' });
            }
            if (!name || !price) {
                return res.status(400).json({ message: 'Nama dan harga wajib diisi' });
            }

            const uploadResponse = await imagekit.upload({
                file: file.buffer,
                fileName: file.originalname,
                folder: 'mini-ecommerce'
            });

            const newProduct = await prisma.product.create({
                data: {
                    name: name,
                    price: parseInt(price),
                    imageUrl: uploadResponse.url
                }
            });
            
            // 2. Kirim notifikasi 'product_added' ke SEMUA socket
            io.emit('product_added', `Produk baru telah ditambahkan: ${newProduct.name}`);

            res.status(201).json(newProduct);

        } catch (error) {
            console.error('Error creating product with image:', error);
            res.status(500).json({ message: 'Terjadi kesalahan saat upload produk' });
        }
    }
);

// R = READ (Semua)
// (Kode lengkap dikembalikan)
router.get('/', async (req, res) => {
    try {
        const { prisma } = req;
        const products = await prisma.product.findMany({
            orderBy: {
                id: 'desc', // tampilkan produk terbaru dulu
            },
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Gagal mengambil data produk' });
    }
});


// R = READ (Satu per ID)
// (Kode lengkap dikembalikan)
router.get('/:id', async (req, res) => {
    try {
        const { prisma } = req;
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });
        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Gagal mengambil produk' });
    }
});


// U = UPDATE (Mengubah data produk berdasarkan ID)
// (Kode lengkap dikembalikan)
router.put(
    '/:id',
    protect,
    upload.single('image'),
    async (req, res) => {
        try {
            const { prisma } = req;
            const { id } = req.params;
            const { name, price } = req.body;
            const file = req.file;

            let imageUrl;

            if (file) {
                const uploadResponse = await imagekit.upload({
                    file: file.buffer,
                    fileName: file.originalname,
                    folder: 'mini-ecommerce'
                });
                imageUrl = uploadResponse.url;
            }

            const updateData = {};
            if (name) {
                updateData.name = name;
            }
            if (price) {
                updateData.price = parseInt(price);
            }
            if (imageUrl) {
                updateData.imageUrl = imageUrl;
            }

            const updatedProduct = await prisma.product.update({
                where: {
                    id: parseInt(id)
                },
                data: updateData
            });

            res.json(updatedProduct);

        } catch (error) {
            console.error('Error updating product:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Produk tidak ditemukan untuk di-update' });
            }
            res.status(500).json({ message: 'Terjadi kesalahan saat meng-update produk' });
        }
    }
);

// D = DELETE (Menghapus produk berdasarkan ID)
// (Kode lengkap dikembalikan)
router.delete('/:id', protect, async (req, res) => {
    try {
        const { prisma } = req;
        const { id } = req.params;

        await prisma.product.delete({
            where: {
                id: parseInt(id)
            }
        });

        res.status(200).json({ message: 'Produk berhasil dihapus' });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Produk tidak ditemukan untuk dihapus' });
        }
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus produk' });
    }
});


module.exports = router;