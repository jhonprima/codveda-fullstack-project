// Tunggu hingga seluruh konten HTML selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Tentukan URL API backend kita
    const API_URL = 'http://localhost:5000/api/products';

    // 2. Pilih elemen 'div' tempat kita akan menampilkan produk
    const productListContainer = document.getElementById('product-list-container');

    // 3. Buat fungsi untuk mengambil dan menampilkan data
    async function fetchProducts() {
        try {
            // Panggil API menggunakan Fetch
            const response = await fetch(API_URL);

            // Cek jika response tidak sukses (misal: server error 500)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Ubah response dari API menjadi format JSON
            const products = await response.json();

            // 4. Tampilkan data ke halaman (sesuai tujuan 3)
            displayProducts(products);

        } catch (error) {
            // Tangani error jika API gagal dihubungi
            console.error('Error fetching products:', error);
            productListContainer.innerHTML = '<p>Gagal memuat produk. Pastikan server backend berjalan.</p>';
        }
    }

    // Fungsi untuk mengubah data JSON menjadi HTML
    function displayProducts(products) {
        // Kosongkan dulu isi container (menghapus "Memuat produk...")
        productListContainer.innerHTML = '';

        // Cek jika tidak ada produk
        if (products.length === 0) {
            productListContainer.innerHTML = '<p>Belum ada produk.</p>';
            return;
        }

        // Loop setiap produk dan buat elemen HTML untuknya
        products.forEach(product => {
            // Buat div untuk 'kartu' produk
            const productCard = document.createElement('div');
             productCard.className = 'product-card'; 

            // Buat elemen nama produk (h3)
            const productName = document.createElement('h3');
            productName.textContent = product.name;

            // Buat elemen harga produk (p)
            const productPrice = document.createElement('p');
            productPrice.textContent = `Rp ${product.price.toLocaleString('id-ID')}`;

            // Masukkan nama dan harga ke dalam kartu
            productCard.appendChild(productName);
            productCard.appendChild(productPrice);

            // Masukkan kartu ke dalam container utama
            productListContainer.appendChild(productCard);
        });
    }

    // Panggil fungsi utama untuk memulai proses
    fetchProducts();
});