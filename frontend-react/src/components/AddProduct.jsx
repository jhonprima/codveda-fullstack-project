import React, { useState } from 'react';

function AddProduct({ onListChange }) { 
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null); 
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const token = localStorage.getItem('authToken');
        if (!token) {
            setMessage('Anda harus login untuk menambah produk.');
            return;
        }

        if (!name || !price || !image) {
            setMessage('Nama, harga, dan gambar produk wajib diisi.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('image', image);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal menambah produk');
            }

            setMessage(`Produk "${data.name}" berhasil ditambahkan!`);
            setName('');
            setPrice('');
            setImage(null);
            document.getElementById('image-file-input').value = null;
            
            if (onListChange) {
                onListChange();
            }

        } catch (err) {
            setMessage(err.message);
        }
    };

    return (
        <div className="auth-form" style={{ maxWidth: '500px' }}>
            <h2>Tambah Produk Baru</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div>
                    <label htmlFor="name">Nama Produk:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="price">Harga Produk:</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="image-file-input">Gambar Produk:</label>
                    <input
                        type="file"
                        id="image-file-input"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileChange}
                        required
                    />
                </div>
                <button type="submit">Tambah Produk</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default AddProduct;