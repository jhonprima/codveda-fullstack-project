import React, { useState, useEffect } from 'react';

function WishlistView() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWishlist = async () => {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Anda harus login untuk melihat favorit.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlist`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.status === 401) {
                throw new Error('Token Anda tidak valid. Silakan login kembali.');
            }
            if (!response.ok) {
                throw new Error('Gagal mengambil data favorit');
            }
            
            const data = await response.json();
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    if (loading) return <p>Memuat favorit...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div className="cart-view"> 
            <h2>Produk Favorit Anda</h2>
            {items.length === 0 ? (
                <p>Anda belum memfavoritkan produk apapun.</p>
            ) : (
                <div className="cart-item-list">
                    {items.map(item => (
                        item.product ? ( 
                            <div key={item.id} className="cart-item">
                                <img 
                                    src={item.product.imageUrl || 'https://via.placeholder.com/80'} 
                                    alt={item.product.name}
                                    className="cart-item-image"
                                />
                                <div className="cart-item-details">
                                    <h4>{item.product.name}</h4>
                                    <p>Rp {item.product.price.toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        ) : null
                    ))}
                </div>
            )}
        </div>
    );
}

export default WishlistView;