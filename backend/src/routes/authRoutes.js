const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // 1. Import bcrypt
const jwt = require('jsonwebtoken');

// Endpoint: POST /api/auth/signup
// Ini adalah rute untuk mendaftarkan pengguna baru
router.post('/signup', async (req, res) => {
    try {
        const { prisma } = req;
        const { email, password } = req.body;

        // 2. Validasi input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password wajib diisi' });
        }

        // 3. Cek apakah email sudah terdaftar
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email ini sudah terdaftar' });
        }

        // 4. Hash password menggunakan bcrypt
        // "10" adalah 'salt rounds', yaitu seberapa kuat hash-nya
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Simpan pengguna baru ke database
        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword // Simpan password yang sudah di-hash
            }
        });

        // 6. Kirim respons sukses
        // Kita tidak mengirim kembali password hash-nya demi keamanan
        res.status(201).json({ 
            id: newUser.id,
            email: newUser.email,
            message: 'Pengguna berhasil didaftarkan'
        });

    } catch (error) {
        console.error('Error saat signup:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { prisma } = req;
        const { email, password } = req.body;

        // 2. Validasi input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password wajib diisi' });
        }

        // 3. Cari pengguna di database berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email: email }
            // Prisma otomatis mengambil SEMUA kolom, termasuk 'role'
        });

        // 4. Cek apakah pengguna ada
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // 5. Bandingkan password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // 6. === PERUBAHAN PENTING DI SINI ===
        // Buat Token JWT dan sertakan 'role' pengguna
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                role: user.role  // <-- TAMBAHKAN INI
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 7. Kirim token ke pengguna
        res.status(200).json({
            message: 'Login berhasil',
            token: token
            // Kita tidak perlu kirim role di sini, karena sudah ada DI DALAM token
        });

    } catch (error) {
        console.error('Error saat login:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});
module.exports = router;