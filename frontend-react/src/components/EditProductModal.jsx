import React, { useState } from 'react';

// Style untuk tombol close (X) yang elegan
const modalCloseButtonStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '28px',
    textAlign: 'center',
    cursor: 'pointer',
    padding: 0,
    zIndex: 1010,
};

// Komponen Modal Edit
function EditProductModal({ product, onClose, onListChange }) {
    const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(product.price);
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Sedang menyimpan...');

        const token = localStorage.getItem('authToken');
        
        if (!image && name === product.name && parseInt(price) === product.price) {
            setMessage('Tidak ada perubahan yang terdeteksi.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${product.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal menyimpan perubahan');
            }

            setMessage(`Produk "${data.name}" berhasil diubah!`);
            
            if (onListChange) {
                onListChange();
            }

            setTimeout(onClose, 1000); 

        } catch (err) {
            setMessage(err.message);
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <div className="auth-form" style={modalContentStyle}>
                
                <button onClick={onClose} style={modalCloseButtonStyle}>
                    &times; 
                </button>

                <h2>Edit Produk: {product.name}</h2>
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100px', objectFit: 'cover', marginBottom: '15px', borderRadius: '4px' }}
                />
                
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div>
                        <label htmlFor="edit-name">Nama Produk:</label>
                        <input
                            type="text"
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-price">Harga Produk:</label>
                        <input
                            type="number"
                            id="edit-price"
                            value={price}
                            onChange={(e) => setPrice(parseInt(e.target.value))}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-image-file">Ganti Gambar (Opsional):</label>
                        <input
                            type="file"
                            id="edit-image-file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                        />
                    </div>
                    
                    <button type="submit">Simpan Perubahan</button>
                </form>
                {message && <p style={{ marginTop: '10px' }}>{message}</p>}
            </div>
        </div>
    );
}

// Inline Style untuk Modal
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentStyle = {
    position: 'relative',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
};

export default EditProductModal;