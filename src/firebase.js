// firebase.js - Firebase Configuration & Services
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// const firebaseConfig = {
//   apiKey: "...",
//   authDomain: "...",
//   projectId: "restaurant-liff"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ========================
// Menu Items Services
// ========================

/**
 * ดึงรายการเมนูทั้งหมด
 */
export const getMenuItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'menus'));
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  } catch (error) {
    console.error('Error getting menu items:', error);
    throw error;
  }
};

/**
 * ดึงเมนูตามหมวดหมู่
 */
export const getMenuItemsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'menus'),
      where('category', '==', category)
    );
    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  } catch (error) {
    console.error('Error getting menu items by category:', error);
    throw error;
  }
};

/**
 * ดึงเมนูยอดนิยม
 */
export const getPopularMenuItems = async () => {
  try {
    const q = query(
      collection(db, 'menus'),
      where('popular', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  } catch (error) {
    console.error('Error getting popular menu items:', error);
    throw error;
  }
};

/**
 * เพิ่มเมนูใหม่ (สำหรับ Admin)
 */
export const addMenuItem = async (itemData) => {
  try {
    const docRef = await addDoc(collection(db, 'menus'), {
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
};

/**
 * อัพเดทเมนู (สำหรับ Admin)
 */
export const updateMenuItem = async (itemId, updates) => {
  try {
    const itemRef = doc(db, 'menus', itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

/**
 * ลบเมนู (สำหรับ Admin)
 */
export const deleteMenuItem = async (itemId) => {
  try {
    await deleteDoc(doc(db, 'menus', itemId));
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

// ========================
// Orders Services
// ========================

/**
 * สร้างออเดอร์ใหม่
 */
export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { orderId: docRef.id, ...orderData };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * ดึงออเดอร์ทั้งหมด
 */
export const getOrders = async () => {
  try {
    const q = query(
      collection(db, 'orders'),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

/**
 * อัพเดทสถานะออเดอร์
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// ========================
// Authentication Services
// ========================

/**
 * สมัครสมาชิก
 */
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * เข้าสู่ระบบ
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * ออกจากระบบ
 */
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// ========================
// Utility Functions
// ========================

/**
 * ฟังก์ชันสำหรับเพิ่มข้อมูลตัวอย่าง (ใช้ครั้งแรกเท่านั้น)
 */
// export const seedMenuData = async () => {
//   const sampleMenuItems = [
//     {
//       name: 'ต้มยำกุ้ง',
//       price: 180,
//       category: 'อาหารจานหลัก',
//       description: 'ต้มยำกุ้งแม่น้ำรสจัดจ้าน เครื่องเต็ม',
//       image: '🍲',
//       popular: true,
//       spicy: 3
//     },
//     {
//       name: 'ส้มตำไทย',
//       price: 60,
//       category: 'อาหารจานหลัก',
//       description: 'ส้มตำแบบไทยดั้งเดิม รสชาติกลมกล่อม',
//       image: '🥗',
//       popular: true,
//       spicy: 2
//     },
//     {
//       name: 'ผัดไทยกุ้งสด',
//       price: 120,
//       category: 'อาหารจานหลัก',
//       description: 'ผัดไทยใส่กุ้งสดๆ หอมกลิ่นใบกะเพรา',
//       image: '🍜',
//       popular: true,
//       spicy: 1
//     },
//     {
//       name: 'ข้าวผัดปู',
//       price: 150,
//       category: 'อาหารจานหลัก',
//       description: 'ข้าวผัดปูเนื้อแน่น หอมกลิ่นปลาหมึก',
//       image: '🍚',
//       popular: false,
//       spicy: 1
//     },
//     {
//       name: 'แกงเขียวหวานไก่',
//       price: 100,
//       category: 'อาหารจานหลัก',
//       description: 'แกงเขียวหวานไก่เนื้ออ่อน กะทิหอมหวาน',
//       image: '🍛',
//       popular: false,
//       spicy: 2
//     },
//     {
//       name: 'น้ำมะนาวปั่น',
//       price: 40,
//       category: 'เครื่องดื่ม',
//       description: 'น้ำมะนาวปั่นสดชื่น เย็นฉ่ำ',
//       image: '🍹',
//       popular: false,
//       spicy: 0
//     },
//     {
//       name: 'ชาเย็น',
//       price: 35,
//       category: 'เครื่องดื่ม',
//       description: 'ชาเย็นหอมกลิ่นชาไทย หวานกำลังดี',
//       image: '🥤',
//       popular: true,
//       spicy: 0
//     },
//     {
//       name: 'ข้าวเหนียวมะม่วง',
//       price: 80,
//       category: 'ของหวาน',
//       description: 'ข้าวเหนียวมะม่วงหวานฉ่ำ กะทิหอมมัน',
//       image: '🥭',
//       popular: true,
//       spicy: 0
//     }
//   ];

//   try {
//     for (const item of sampleMenuItems) {
//       await addMenuItem(item);
//     }
//     console.log('Sample menu data added successfully!');
//   } catch (error) {
//     console.error('Error seeding data:', error);
//   }
// };

export default {
  // Menu
  getMenuItems,
  getMenuItemsByCategory,
  getPopularMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  
  // Orders
  createOrder,
  getOrders,
  updateOrderStatus,
  
  // Auth
  signUp,
  signIn,
  logOut,
  
  // Utility
  // seedMenuData
};
