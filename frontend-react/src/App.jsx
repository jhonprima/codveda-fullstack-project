import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';

// Impor komponen
import ProductList from './components/ProductList';
import Signup from './components/Signup';
import Login from './components/Login';
import AddProduct from './components/AddProduct';
import CartView from './components/CartView';
import WishlistView from './components/WishlistView';
import Footer from './components/Footer';

// Inisialisasi koneksi socket
const socket = io('http://localhost:5000');

// Komponen link
function AuthLink({ onClick, children }) {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      style={{ display: 'block', textAlign: 'center', marginTop: '10px' }}
    >
      {children}
    </a>
  );
}

function App() {
  // --- STATE ---
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authView, setAuthView] = useState('signup');
  const [consumenView, setConsumenView] = useState('products');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- EFEK (Token & Login) ---
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        setToken(storedToken);
        setUser(decodedUser);
      } catch (error) {
        console.error("Token rusak, menghapus token:", error);
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  // --- EFEK (WebSocket) ---
  useEffect(() => {
    
    // === PERBAIKAN STALE CLOSURE DI SINI ===
    const onProductAdded = (message) => {
        // Tampilkan pesan teks sederhana yang dikirim dari server
        alert(`🔔 NOTIFIKASI BARU:\n${message}`);
        
        // Panggil 'setRefreshKey' LANGSUNG, bukan 'handleListChange'
        // Ini adalah cara yang aman untuk memicu refresh dari dalam useEffect
        setRefreshKey(prevKey => prevKey + 1);
    };
    // ======================================

    function setupSocketListeners() {
      // Mendengar event 'product_added'
      socket.on('product_added', onProductAdded);
    }

    // Hanya jalankan listener jika user adalah Consumen
    if (user && user.role === 'CONSUMEN') {
      setupSocketListeners();
    }

    // Cleanup
    return () => {
      socket.off('product_added', onProductAdded);
    };
  // 'user' adalah satu-satunya dependensi yang benar
  }, [user]); 

  // --- FUNGSI HANDLER ---
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setAuthView('signup');
    setIsMenuOpen(false);
  };

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('authToken', newToken);
    const decodedUser = jwtDecode(newToken);
    setToken(newToken);
    setUser(decodedUser);
    setConsumenView('products');
    setIsMenuOpen(false);
  };

  // handleListChange sekarang HANYA digunakan oleh Admin
  const handleListChange = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  const handleConsumenNav = (view) => {
    setConsumenView(view);
    setIsMenuOpen(false);
  };

  const isAdmin = user && user.role === 'ADMIN';
  const isConsumen = user && user.role === 'CONSUMEN';

  // --- RENDER JSX ---
  return (
    <div>
      <header>
        <div className="header-container">
          <h1>Selamat Datang di Toko React Saya</h1>
          {user && (
            <div className="user-info">
              <span>Halo, {user.email} ({user.role})</span>
              <button onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
          {user && (
            <button className="burger-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ☰
            </button>
          )}
          {isMenuOpen && user && (
            <div className="mobile-nav-menu">
              <div className="mobile-user-info">
                <strong>Halo, {user.email}</strong>
                <span>Role: {user.role}</span>
              </div>
              {isConsumen && (
                <>
                  <button onClick={() => handleConsumenNav('products')}>Lihat Produk</button>
                  <button onClick={() => handleConsumenNav('cart')}>Lihat Keranjang</button>
                  <button onClick={() => handleConsumenNav('wishlist')}>Lihat Favorit ❤️</button>
                </>
              )}
              {isAdmin && (
                  <button onClick={() => setIsMenuOpen(false)}>Kelola Produk</button>
              )}
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>
      
      <main>
        {!user ? (
          // Tampilan jika BELUM login
          <div>
            {authView === 'signup' ? (
              <>
                <Signup />
                <AuthLink onClick={() => setAuthView('login')}>
                  Sudah punya akun? Login di sini
                </AuthLink>
              </>
            ) : (
              <>
                <Login onLoginSuccess={handleLoginSuccess} />
                <AuthLink onClick={() => setAuthView('signup')}>
                  Belum punya akun? Daftar di sini
                </AuthLink>
              </>
            )}
          </div>
        ) : (
          // Tampilan jika SUDAH login
          <div>
            {isAdmin && (
              <>
                <AddProduct onListChange={handleListChange} />
                <hr />
                <ProductList refreshKey={refreshKey} user={user} onListChange={handleListChange} />
              </>
            )}

            {isConsumen && (
              <>
                <nav className="consumen-nav">
                  <button 
                    className={consumenView === 'products' ? 'active' : ''}
                    onClick={() => setConsumenView('products')}
                  >
                    Lihat Produk
                  </button>
                  <button 
                    className={consumenView === 'cart' ? 'active' : ''}
                    onClick={() => setConsumenView('cart')}
                  >
                    Lihat Keranjang
                  </button>
                  <button 
                    className={consumenView === 'wishlist' ? 'active' : ''}
                    onClick={() => setConsumenView('wishlist')}
                  >
                    Lihat Favorit 
                  </button>
                </nav>
                
                {consumenView === 'products' ? (
                  <ProductList refreshKey={refreshKey} user={user} onListChange={handleListChange} />
                ) : consumenView === 'cart' ? (
                  <CartView />
                ) : (
                  <WishlistView /> 
                )}
              </>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;