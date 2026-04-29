# 📦 ระบบยืม–คืนอุปกรณ์ | โรงเรียนโซ่พิสัยพิทยาคม
### v4.0 — Auto-Setup Sheets · GitHub-Ready · 2026

> ระบบ Web Application ยืม–คืนพัสดุออนไลน์ พัฒนาด้วย **Google Apps Script**  
> ฐานข้อมูล **Google Sheets** · สร้าง Sheet อัตโนมัติถ้าไม่มี

---

## 🗂️ โครงสร้าง Repository

```
spkborrowsystem/
│
├── index.html                ← GitHub Pages Landing (redirect → GAS)
├── package.json
├── .clasp.json               ← ใส่ Script ID ของคุณตรงนี้
├── .gitignore
├── .claspignore
│
├── src/                      ← โค้ดที่ push ขึ้น Google Apps Script
│   ├── Code.gs               ← Backend ทั้งหมด + Auto-Setup Sheets
│   ├── Index.html            ← UI หลัก (6 หน้า)
│   ├── CSS.html              ← Styles Glassmorphism 2026
│   ├── JS.html               ← Client Logic
│   └── appsscript.json       ← GAS Manifest
│
└── .github/
    └── workflows/
        └── deploy.yml        ← Auto-deploy ทุกครั้งที่ push main
```

---

## 🗄️ Google Sheets — สร้างอัตโนมัติ

ระบบจะตรวจสอบและสร้าง Sheet ให้อัตโนมัติทุกครั้งที่เปิดเว็บ

### Sheet: Stock (8 คอลัมน์)
| ID | รายการ | หมายเลขครุภัณฑ์ | หมวดหมู่ | ทั้งหมด | คงเหลือ | หมายเหตุ | รูปภาพURL |
|---|---|---|---|---|---|---|---|

### Sheet: Transactions (13 คอลัมน์)
| TransID | ประเภทผู้ยืม | ชื่อผู้ยืม | รหัสประจำตัว/ห้อง/สังกัด | IDอุปกรณ์ | หมายเลขครุภัณฑ์ | จำนวนที่ยืม | จำนวนที่คืน | วันที่ยืม | วันที่คืน | สถานะ | ImageURL | SignatureURL |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

---

## ✨ ฟีเจอร์

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| 🔧 Auto-Setup | สร้าง Sheet + Headers อัตโนมัติถ้าไม่มี |
| 📊 Dashboard | Stats 5 การ์ด + Chart Top10 + ค้างส่ง Real-time |
| 🖼️ แคตตาล็อก | การ์ดพัสดุพร้อมรูปภาพ + อัปโหลด Drive |
| 📤 ยืม | Multi-item · Toggle นักเรียน/ครู · ลายเซ็นดิจิทัล |
| 📥 คืน | ทุกคนเห็น · Admin password ก่อนกดคืน |
| 📦 คลัง | CRUD พัสดุ + รูปภาพ URL |
| 📋 ประวัติ | Real-time auto-refresh 25 วิ |
| 🖨️ พิมพ์ | ทะเบียนคุมการยืม ตามแบบโรงเรียน + ลายเซ็น |

---

## 🔐 รหัสผ่าน Admin
รหัสเริ่มต้น: **`12345`**  
เปลี่ยนใน `src/Code.gs` → `CONFIG.ADMIN_PASSWORD`

---

## 🔧 GitHub Secrets ที่ต้องตั้ง

ไปที่ GitHub Repo → **Settings → Secrets → Actions → New secret**

| Secret | วิธีได้มา |
|--------|----------|
| `CLASPRC_JSON` | รัน `clasp login` แล้ว `cat ~/.clasprc.json` |
| `DEPLOYMENT_ID` | รัน `clasp deployments` |
