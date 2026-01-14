const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // === PERBAIKAN DI BAWAH INI ===
            req.user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { 
                    id: true, 
                    email: true, 
                    role: true // <-- TAMBAHKAN BARIS INI
                }
            });
            // === AKHIR PERBAIKAN ===

            if (!req.user) {
                 return res.status(401).json({ message: 'User tidak ditemukan' });
            }

            next(); 

        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Tidak terotorisasi, token gagal' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Tidak terotorisasi, tidak ada token' });
    }
};

module.exports = { protect };   