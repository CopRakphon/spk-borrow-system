# 🛠️ คู่มือติดตั้ง — ระบบยืม–คืนอุปกรณ์ v4.0

## ⚡ วิธีที่ 1 — Copy-Paste ตรง (เร็วที่สุด ไม่ต้องติดตั้งอะไร)

### ขั้นตอน 1 — สร้าง GAS Project
1. ไปที่ https://script.google.com
2. คลิก **"โปรเจกต์ใหม่"**
3. ตั้งชื่อ: `SPK-Borrow-System`

### ขั้นตอน 2 — วางโค้ด
| ไฟล์ใน GAS | คัดลอกจาก |
|-----------|----------|
| `Code.gs` (มีอยู่แล้ว) | `src/Code.gs` |
| สร้างใหม่ → HTML → ชื่อ `Index` | `src/Index.html` |
| สร้างใหม่ → HTML → ชื่อ `CSS` | `src/CSS.html` |
| สร้างใหม่ → HTML → ชื่อ `JS` | `src/JS.html` |

### ขั้นตอน 3 — แก้ไข CONFIG ใน Code.gs
```javascript
const CONFIG = {
  SPREADSHEET_ID : "YOUR_SPREADSHEET_ID",  // ← Sheets ID ของคุณ
  FOLDER_ID      : "YOUR_DRIVE_FOLDER_ID", // ← Drive Folder ID
  ADMIN_PASSWORD : "12345",                // ← เปลี่ยนได้
};
```

**วิธีหา Spreadsheet ID:**
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
```

**วิธีหา Folder ID:**
```
https://drive.google.com/drive/folders/[FOLDER_ID]
```

### ขั้นตอน 4 — ทดสอบ Auto-Setup
ใน GAS Editor กด Run → เลือกฟังก์ชัน `testSetup`  
จะสร้าง Sheet อัตโนมัติและแสดงผลใน Logs

### ขั้นตอน 5 — Deploy
1. GAS Editor → **Deploy** → **New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. กด **Deploy** → Copy URL

---

## ⚡ วิธีที่ 2 — GitHub + clasp (Auto-deploy)

### ขั้นตอน 1 — ติดตั้ง clasp
```bash
npm install -g @google/clasp
clasp login   # จะเปิดเบราว์เซอร์ให้ login Google
```

### ขั้นตอน 2 — Fork/Clone repo
```bash
git clone https://github.com/CopRakphon/spkborrowsystem.git
cd spkborrowsystem
```

### ขั้นตอน 3 — ใส่ Script ID
แก้ `.clasp.json`:
```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "./src"
}
```
**หา Script ID จาก GAS URL:**
```
https://script.google.com/home/projects/[SCRIPT_ID]/edit
```

### ขั้นตอน 4 — Push & Deploy
```bash
clasp push
clasp deploy --description "v4.0 Initial"
```

### ขั้นตอน 5 — ตั้ง GitHub Actions Secrets
```
GitHub Repo → Settings → Secrets → Actions → New secret
```
| Secret | วิธีได้มา |
|--------|----------|
| `CLASPRC_JSON` | `cat ~/.clasprc.json` แล้ว copy ทั้งหมด |
| `DEPLOYMENT_ID` | `clasp deployments` แล้ว copy AKfycb... |

**หลังจากนี้ทุกครั้งที่ `git push` ระบบ deploy อัตโนมัติ!**

---

## 🖼️ วิธีเพิ่มรูปภาพพัสดุ (แคตตาล็อก)

**วิธีที่ 1 — Hover การ์ด → กด 📷**
- เปิดหน้า **แคตตาล็อก**
- Hover บนการ์ดพัสดุ → กด **📷**
- เลือกรูป → อัปโหลดขึ้น Google Drive อัตโนมัติ

**วิธีที่ 2 — ใส่ URL ตรง**
- หน้า **คลัง** → ✏️ แก้ไข
- ใส่ URL ในช่อง "URL รูปภาพ"
- รองรับ: Google Drive, imgbb.com, URL ทั่วไป

---

## 🧪 ทดสอบ Auto-Setup Sheets

รันใน GAS Editor:
```javascript
// เปิด GAS Editor → Run → testSetup
function testSetup() { ... }
```

ผลที่ควรได้:
```
✅ สร้าง Sheet "Stock" ใหม่พร้อม 8 คอลัมน์
✅ สร้าง Sheet "Transactions" ใหม่พร้อม 13 คอลัมน์
✅ Setup เสร็จสมบูรณ์!
📦 Stock rows  : 0
📋 TX rows     : 0
```

---

## 🆘 แก้ปัญหาที่พบบ่อย

| ปัญหา | วิธีแก้ |
|------|---------|
| หน้าขาว / ไม่โหลด | ตรวจ GAS Executions log |
| `PERMISSION_DENIED` | ตรวจ SPREADSHEET_ID และ Share สิทธิ์ |
| รูปไม่แสดงในแคตตาล็อก | ตรวจว่า Drive Folder เป็น Public |
| `clasp push` error | รัน `clasp login` ใหม่ |
| GitHub 404 | ตรวจ Settings → Pages → Branch: main, Folder: / (root) |
