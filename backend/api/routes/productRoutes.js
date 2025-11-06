const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const ImageKit = require('imagekit');

// --- Konfigurasi ImageKit ---
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// --- Setup Multer ---
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Hanya file gambar (JPG, PNG, WEBP) yang diizinkan'));
    }
    cb(null, true);
  }
});

// --- CREATE Produk ---
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { prisma } = req;
    const { name, price } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'File gambar wajib di-upload' });
    if (!name || !price) return res.status(400).json({ message: 'Nama dan harga wajib diisi' });

    const uploadResponse = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: 'mini-ecommerce'
    });

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: parseInt(price),
        imageUrl: uploadResponse.url
      }
    });

    res.status(201).json({
      message: 'Produk berhasil ditambahkan',
      product: newProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat upload produk' });
  }
});

// --- READ Semua Produk ---
router.get('/', async (req, res) => {
  try {
    const { prisma } = req;
    const products = await prisma.product.findMany({ orderBy: { id: 'desc' } });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Gagal mengambil data produk' });
  }
});

// --- READ Produk by ID ---
router.get('/:id', async (req, res) => {
  try {
    const { prisma } = req;
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json(product);

  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Gagal mengambil produk' });
  }
});

// --- UPDATE Produk ---
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const { prisma } = req;
    const { id } = req.params;
    const { name, price } = req.body;
    const file = req.file;

    const updateData = {};
    if (name) updateData.name = name;
    if (price) updateData.price = parseInt(price);

    if (file) {
      const uploadResponse = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: 'mini-ecommerce'
      });
      updateData.imageUrl = uploadResponse.url;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      message: 'Produk berhasil diperbarui',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Produk tidak ditemukan untuk di-update' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan saat meng-update produk' });
  }
});

// --- DELETE Produk ---
router.delete('/:id', protect, async (req, res) => {
  try {
    const { prisma } = req;
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Produk berhasil dihapus' });

  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Produk tidak ditemukan untuk dihapus' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus produk' });
  }
});

module.exports = router;
