import React, { useState, useEffect } from 'react';

function CartView() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCart = async () => {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        if (!token) {
            setError('Anda harus login untuk melihat keranjang.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data keranjang');
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
        fetchCart();
    }, []);

    const totalPrice = items.reduce((total, item) => {
        if (item.product && item.product.price) {
            return total + (item.product.price * item.quantity);
        }
        return total;
    }, 0);

    if (loading) {
        return <p>Memuat keranjang...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    return (
        <div className="cart-view"> 
            <h2>Keranjang Belanja Anda</h2>
            {items.length === 0 ? (
                <p>Keranjang Anda kosong.</p>
            ) : (
                <>
                    <div className="cart-item-list">
                        {items.map(item => (
                            <div key={item.id} className="cart-item">
                                <img 
                                    src={item.product ? item.product.imageUrl : 'https://via.placeholder.com/80'} 
                                    alt={item.product ? item.product.name : 'Produk'}
                                    className="cart-item-image"
                                />
                                <div className="cart-item-details">
                                    <h4>{item.product ? item.product.name : 'Produk tidak tersedia'}</h4>
                                    <p>Jumlah: {item.quantity}</p>
                                </div>
                                <div className="cart-item-price">
                                    <p>
                                        Rp {(item.product ? item.product.price * item.quantity : 0).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-total">
                        <h3>Total: Rp {totalPrice.toLocaleString('id-ID')}</h3>
                    </div>
                </>
            )}
        </div>
    );
}

export default CartView;