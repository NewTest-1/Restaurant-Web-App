import React, { useState, useEffect } from 'react';
import { Camera, ShoppingCart, Clock, MapPin, Star, Plus, Minus, X, Menu as MenuIcon } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { getMenuItems, db } from "./firebase";
import ImportButton from "./ImportButton";
import './AppStyle.css';

// Cart Context
const CartContext = React.createContext();

function RestaurantApp() {
  const [menuItems, setMenuItems] = useState([]);
  // const [cart, setCart] = useState(() => {
  //   const savedCart = localStorage.getItem("cart");
  //   return savedCart ? JSON.parse(savedCart) : [];
  // });
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const table = new URLSearchParams(window.location.search).get("table");
  useEffect(() => {
    if (!table) {
      alert("ไม่พบหมายเลขโต๊ะ (table) กรุณาสแกน QR Code ใหม่");
    }
  }, [table]);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(`cart_${table}`);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem(`cart_${table}`, JSON.stringify(cart));
  }, [cart, table]);


  const loadMenuItems = async () => {
    try {
      // const items = await FirebaseService.getMenuItems();
      const items = await getMenuItems();
      setMenuItems(items);
      setLoading(false);
    } catch (error) {
      console.error('Error loading menu:', error);
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i =>
        i.id === item.id ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  // ฟังก์ชันสั่งอาหาร (บันทึกลง Firebase)
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  // const table = new URLSearchParams(window.location.search).get("table");

  const sendOrder = async () => {
    if (!table) {
      alert("ไม่พบหมายเลขโต๊ะ")
      return
    }
    if (cart.length === 0) {
      alert("ไม่มีรายการอาหาร")
      return
    }
    try {
      await addDoc(collection(db, "orders"), {
        table_no: table,
        items: cart,
        total,
        status: "pending",
        status_paid: "not_paid",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        note: ""
      })

      alert("ส่งออเดอร์เข้าครัวแล้ว")
      setCart([])
      localStorage.removeItem("cart");

    } catch (err) {
      console.error(err)
      alert("เกิดข้อผิดพลาด")
    }

    await updateDoc(doc(db, "tables", table),
      {
        status: "occupied"
      }
    );

  }

  const updateQuantity = (itemId, delta) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.qty + delta;
        return newQuantity > 0 ? { ...item, qty: newQuantity } : item;
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const categories = ['ทั้งหมด', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = selectedCategory === 'ทั้งหมด'
    ? [...menuItems].sort((a, b) => {
      if (b.popular !== a.popular) {
        return b.popular - a.popular;
      }
      return a.sequence - b.sequence;
    })
    : menuItems.sort((a, b) => {
      if (b.popular !== a.popular) {
        return b.popular - a.popular;
      }
    }).filter(item => item.category === selectedCategory);



  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart }}>

      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">🍜</span>
              <h1>ร้านอาหารไทย</h1>
            </div>
            <div className="header-actions">
              <div className="info-item">
                {/* <h2>Menu Import</h2> */}
                {/* <ImportButton /> */}
                {/* <POS /> */}
              </div>
              <div className="info-item">
                <Clock size={20} />
                <span>10:00 - 22:00 น.</span>
              </div>
              <div className="info-item">
                <MapPin size={20} />
                <span>กรุงเทพฯ</span>
              </div>
              <button className="cart-button" onClick={() => setShowCart(true)}>
                <ShoppingCart size={20} />
                <span>ตะกร้า</span>
                {cart.length > 0 && (
                  <span className="cart-badge">{cart.length}</span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h2>อาหารไทยรสชาติต้นตำรับ</h2>
            <p>เมนูหลากหลาย สดใหม่ทุกวัน จากเชฟมืออาชีพ</p>
          </div>
        </section>

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="menu-container">
          {loading ? (
            <div className="loading">กำลังโหลดเมนู...</div>
          ) : (
            <div className="menu-grid">
              {filteredItems.map(item => {
                const ItemQty = cart.find(i => i.id === item.id)?.qty || 0;
                return (
                  <div key={item.id} className={`menu-card ${item.popular ? 'popular' : ''}`} >
                    <div className="card-image">
                      <img src={item.image} alt={item.name}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "12px"
                        }}
                      />
                    </div>
                    <div className="card-content">
                      <div className="card-header">
                        <h3 className="card-title">{item.name}</h3>
                        {item.spicy > 0 && (
                          <div className="spicy-indicator">
                            {[...Array(item.spicy)].map((_, i) => (
                              <span key={i} className="spicy-icon">🌶️</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="card-category">
                        {item.category}
                      </div>
                      <p className="card-description">
                        {item.description}
                      </p>
                      <div className="card-footer">
                        <span className="price">
                          ฿{item.price}
                        </span>
                        <button className="add-btn" onClick={() => addToCart(item)} >
                          <Plus size={18} />
                          <span>เพิ่ม</span>
                          {ItemQty > 0 && (
                            <span className="cart-badge">
                              {ItemQty}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className={`cart-sidebar ${showCart ? 'open' : ''}`}>
          <div className="cart-header">
            <h3>🛒 ตะกร้าสินค้า</h3>
            <button className="close-btn" onClick={() => setShowCart(false)}>
              <X size={28} />
            </button>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🍽️</div>
                <p>ตะกร้าว่างเปล่า</p>
                <p>เพิ่มเมนูที่คุณชื่นชอบได้เลย!</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-header">
                    <div className="cart-item-name">{item.name}</div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus size={18} />
                      </button>
                      <span className="quantity">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus size={18} />
                      </button>
                    </div>
                    <span className="cart-item-price">฿{item.price * item.qty}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <span className="total-label">ยอดรวมทั้งหมด:</span>
                <span className="total-amount">฿{getTotalPrice()}</span>
              </div>
              <button className="checkout-btn" onClick={sendOrder}>
                สั่งอาหาร
              </button>
            </div>
          )}
        </div>
      </div>
    </CartContext.Provider>
  );
}

export default RestaurantApp;
