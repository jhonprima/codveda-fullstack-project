import React, { useState, useEffect } from 'react';
import EditProductModal from './EditProductModal';

function ProductList({ refreshKey, user, onListChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState({});
  const [wishlist, setWishlist] = useState(new Set()); 
  const [productToEdit, setProductToEdit] = useState(null); 

  // --- FUNGSI: Mengambil status wishlist saat load ---
  const fetchWishlist = async (token) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return;
        const data = await response.json();
        const favoriteIds = new Set(data.map(item => item.productId));
        setWishlist(favoriteIds);
    } catch (error) {
        console.error("Failed to fetch wishlist:", error);
    }
  };

  useEffect(() => {
    async function fetchProducts() {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
            if (!response.ok) throw new Error('Gagal mengambil data dari server');
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    fetchProducts();
    
    if (user && user.role === 'CONSUMEN') {
        fetchWishlist(localStorage.getItem('authToken'));
    }
  }, [refreshKey, user]);

  // --- FUNGSI: Toggle WISHLIST (CONSUMEN) ---
  const handleToggleWishlist = async (productId) => {
      const token = localStorage.getItem('authToken');
      if (!token) return alert('Anda harus login untuk memfavoritkan.');
      try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlist`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ productId: productId })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Gagal toggle wishlist');
          setWishlist(prevWishlist => {
              const newWishlist = new Set(prevWishlist);
              if (data.added) {
                  newWishlist.add(productId);
              } else {
                  newWishlist.delete(productId);
              }
              return newWishlist;
          });
      } catch (err) {
          alert(`Error: ${err.message}`);
      }
  };

  // --- FUNGSI: Tambah ke KERANJANG (CONSUMEN) ---
  const handleAddToCart = async (productId) => {
    setCartMessage({ ...cartMessage, [productId]: null });
    const token = localStorage.getItem('authToken');
    if (!token) {
      setCartMessage({ ...cartMessage, [productId]: 'Anda harus login.' });
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal menambah ke keranjang');
      }
      setCartMessage({ ...cartMessage, [productId]: 'Berhasil ditambah!' });
      setTimeout(() => {
        setCartMessage({ ...cartMessage, [productId]: null });
      }, 3000);
    } catch (err) {
      setCartMessage({ ...cartMessage, [productId]: err.message });
    }
  };

  // --- FUNGSI: HAPUS Produk (ADMIN) ---
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Anda yakin ingin menghapus produk ini?')) {
      return;
    }
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json(); 
        throw new Error(errorData.message || `Error ${response.status}: Gagal menghapus`);
      }
      if (onListChange) {
        onListChange();
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  
  // --- FUNGSI: Buka/Tutup Modal EDIT (ADMIN) ---
  const handleOpenEditModal = (product) => { setProductToEdit(product); };
  const handleCloseEditModal = () => { setProductToEdit(null); };

  if (loading) return <p>Sedang memuat produk...</p>;
  if (error) return <p>Error: {error}</p>;

  const isConsumen = user && user.role === 'CONSUMEN';
  const isAdmin = user && user.role === 'ADMIN';

  return (
    <div className="product-list">
      {productToEdit && (
        <EditProductModal 
          product={productToEdit} 
          onClose={handleCloseEditModal} 
          onListChange={onListChange} 
        />
      )}
      
      <h2>Daftar Produk</h2>
      {products.length === 0 ? (
        <p>Belum ada produk.</p>
      ) : (
        <ul>
          {products.map(product => (
            <li key={product.id} style={{ position: 'relative' }}> 
              {isConsumen && (
                <button
                    onClick={() => handleToggleWishlist(product.id)}
                    style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px', 
                        zIndex: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        color: wishlist.has(product.id) ? '#e74c3c' : '#bdc3c7',
                        padding: '8px',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        lineHeight: '1',
                        fontSize: '1.2em'
                    }}
                >
                    {wishlist.has(product.id) ? '❤️' : '🤍'}
                </button>
              )}
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  style={{ 
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                  }} 
                />
              )}
              <div style={{ padding: '16px' }}>
                <h3 style={{ marginTop: '0' }}>{product.name}</h3>
                <p>Rp {product.price.toLocaleString('id-ID')}</p>
                {isConsumen && (
                  <div className="product-actions-consumen"> 
                    <button onClick={() => handleAddToCart(product.id)}>
                      Tambah ke Keranjang
                    </button>
                    {cartMessage[product.id] && (
                      <p style={{ fontSize: '0.9em', color: 'green' }}>
                        {cartMessage[product.id]}
                      </p>
                    )}
                    <button 
                      className={`btn-wishlist ${wishlist.has(product.id) ? 'active' : ''}`}
                      onClick={() => handleToggleWishlist(product.id)}
                    >
                      {wishlist.has(product.id) ? 'Hapus dari Favorit ❤️' : 'Tambah ke Favorit 🤍'}
                    </button>
                  </div>
                )}
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-edit" onClick={() => handleOpenEditModal(product)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteProduct(product.id)}>
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductList;