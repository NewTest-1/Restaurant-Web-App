# 🔥 คู่มือการตั้งค่า Firebase

## ขั้นตอนที่ 1: สร้างโปรเจกต์ Firebase

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Add project" หรือ "เพิ่มโปรเจกต์"
3. ตั้งชื่อโปรเจกต์ เช่น "thai-restaurant"
4. เลือกว่าจะใช้ Google Analytics หรือไม่ (แนะนำให้เปิด)
5. คลิก "Create project"

## ขั้นตอนที่ 2: เพิ่ม Web App

1. ใน Firebase Console เลือกโปรเจกต์ที่สร้าง
2. คลิกที่ไอคอน Web `</>`
3. ตั้งชื่อแอพ เช่น "Thai Restaurant Web"
4. เลือก "Also set up Firebase Hosting" (ถ้าต้องการ deploy)
5. คลิก "Register app"

## ขั้นตอนที่ 3: คัดลอก Configuration

คัดลอกโค้ด Firebase Config ที่ได้ มันจะมีหน้าตาประมาณนี้:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "thai-restaurant.firebaseapp.com",
  projectId: "thai-restaurant",
  storageBucket: "thai-restaurant.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

นำไปใส่ใน `firebase.js` หรือในไฟล์ `.env`

## ขั้นตอนที่ 4: เปิดใช้งาน Firestore Database

1. ใน Firebase Console ไปที่ "Build" > "Firestore Database"
2. คลิก "Create database"
3. เลือก "Start in test mode" (สำหรับการพัฒนา)
4. เลือก location ที่ใกล้ที่สุด (แนะนำ: asia-southeast1)
5. คลิก "Enable"

### ⚠️ สำคัญ: ตั้งค่า Security Rules

**Test Mode (สำหรับการพัฒนาเท่านั้น):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Production Mode (สำหรับเว็บจริง):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // เมนูอาหาร - อ่านได้ทุกคน แต่เขียนได้เฉพาะ admin
    match /menuItems/{item} {
      allow read: if true;
      allow write: if request.auth != null && 
                     request.auth.token.admin == true;
    }
    
    // ออเดอร์ - สร้างได้ทุกคน แต่อ่านได้เฉพาะเจ้าของ
    match /orders/{order} {
      allow create: if true;
      allow read, update: if request.auth != null;
      allow delete: if request.auth != null && 
                      request.auth.token.admin == true;
    }
  }
}
```

## ขั้นตอนที่ 5: เปิดใช้งาน Authentication (ถ้าต้องการ)

1. ไปที่ "Build" > "Authentication"
2. คลิก "Get started"
3. เลือก Sign-in method ที่ต้องการ:
   - Email/Password (แนะนำเป็นอันดับแรก)
   - Google
   - Facebook
   - Line
4. เปิดใช้งานและตั้งค่า

## ขั้นตอนที่ 6: สร้าง Collection และเพิ่มข้อมูลตัวอย่าง

### วิธีที่ 1: ใช้ Firebase Console (ง่ายที่สุด)

1. ไปที่ Firestore Database
2. คลิก "Start collection"
3. ตั้งชื่อ Collection: `menuItems`
4. เพิ่ม Document แรก:
   - Document ID: (auto-generate)
   - Fields:
     ```
     name: "ต้มยำกุ้ง" (string)
     price: 180 (number)
     category: "อาหารจานหลัก" (string)
     description: "ต้มยำกุ้งแม่น้ำรสจัดจ้าน เครื่องเต็ม" (string)
     image: "🍲" (string)
     popular: true (boolean)
     spicy: 3 (number)
     createdAt: (timestamp - now)
     ```

5. ทำซ้ำกับเมนูอื่นๆ

### วิธีที่ 2: ใช้โค้ด (สำหรับนักพัฒนา)

ใช้ฟังก์ชัน `seedMenuData()` ใน `firebase.js`:

```javascript
// ใน Console ของเบราว์เซอร์
import { seedMenuData } from './firebase';
seedMenuData();
```

หรือสร้างปุ่มใน UI:
```jsx
<button onClick={() => seedMenuData()}>
  เพิ่มข้อมูลตัวอย่าง
</button>
```

## ขั้นตอนที่ 7: ทดสอบการเชื่อมต่อ

1. เปิด Developer Console (F12)
2. ดูว่ามี Error หรือไม่
3. ลองเพิ่มเมนูลงตะกร้า
4. กดสั่งอาหาร
5. ตรวจสอบใน Firebase Console > Firestore ว่ามีข้อมูลเพิ่มขึ้นหรือไม่

## โครงสร้างฐานข้อมูล Firestore

```
thai-restaurant (Project)
│
├── menuItems (Collection)
│   ├── item1 (Document)
│   │   ├── name: string
│   │   ├── price: number
│   │   ├── category: string
│   │   ├── description: string
│   │   ├── image: string (emoji)
│   │   ├── popular: boolean
│   │   ├── spicy: number (0-3)
│   │   └── createdAt: timestamp
│   │
│   └── item2 (Document)
│       └── ...
│
└── orders (Collection)
    ├── order1 (Document)
    │   ├── items: array
    │   ├── totalPrice: number
    │   ├── status: string
    │   ├── createdAt: timestamp
    │   └── customerInfo: object (optional)
    │
    └── order2 (Document)
        └── ...
```

## ขั้นตอนที่ 8: Deploy ขึ้น Firebase Hosting (Optional)

### ติดตั้ง Firebase CLI

```bash
npm install -g firebase-tools
```

### Login และ Initialize

```bash
# Login
firebase login

# Initialize
firebase init

# เลือก:
# - Hosting
# - เลือกโปรเจกต์ที่สร้างไว้
# - Public directory: dist
# - Single-page app: Yes
# - GitHub Actions: No (หรือ Yes ถ้าต้องการ)
```

### Build และ Deploy

```bash
# Build
npm run build

# Deploy
firebase deploy
```

เว็บจะถูก deploy ที่: `https://your-project-id.web.app`

## การอัพเดทข้อมูล

### เพิ่มเมนูใหม่

```javascript
import { addMenuItem } from './firebase';

const newItem = {
  name: "กะเพราหมูสับ",
  price: 50,
  category: "อาหารจานหลัก",
  description: "กะเพราหมูสับรสจัดจ้าน เสิร์ฟพร้อมไข่ดาว",
  image: "🍛",
  popular: false,
  spicy: 2
};

addMenuItem(newItem);
```

### อัพเดทเมนู

```javascript
import { updateMenuItem } from './firebase';

updateMenuItem("item-id", {
  price: 200,
  popular: true
});
```

### ลบเมนู

```javascript
import { deleteMenuItem } from './firebase';

deleteMenuItem("item-id");
```

## Troubleshooting

### ❌ Error: Permission denied

**สาเหตุ:** Security Rules ไม่ถูกต้อง

**แก้ไข:** ไปที่ Firestore > Rules และตั้งค่าตาม Production Mode ด้านบน

### ❌ Error: Firebase not initialized

**สาเหตุ:** ยังไม่ได้ import firebase config

**แก้ไข:** ตรวจสอบว่าได้ import `firebase.js` แล้ว

### ❌ ข้อมูลไม่แสดง

**สาเหตุ:** ยังไม่มีข้อมูลใน Firestore

**แก้ไข:** เพิ่มข้อมูลด้วย `seedMenuData()` หรือเพิ่มใน Console

### ❌ CORS Error

**สาเหตุ:** Domain ไม่ได้รับอนุญาต

**แก้ไข:** ไปที่ Firebase Console > Authentication > Settings > Authorized domains และเพิ่ม domain ของคุณ

## ทรัพยากรเพิ่มเติม

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Firebase Tutorial](https://firebase.google.com/docs/web/setup)
- [Firebase Pricing](https://firebase.google.com/pricing)

## Firestore Limits (Free Tier)

- **Stored data:** 1 GiB
- **Document reads:** 50,000 per day
- **Document writes:** 20,000 per day
- **Document deletes:** 20,000 per day

สำหรับร้านอาหารขนาดเล็ก-กลาง ควรเพียงพอสำหรับการใช้งานฟรี

---

**เสร็จสิ้น! 🎉** ตอนนี้คุณพร้อมใช้งาน Firebase กับร้านอาหารแล้ว
