// ╔══════════════════════════════════════════════════════════════╗
// ║  CODE.GS — ระบบยืม–คืนอุปกรณ์ โรงเรียนโซ่พิสัยพิทยาคม    ║
// ║  v4.0 — Auto-setup Sheets, GitHub-ready, 2026              ║
// ╚══════════════════════════════════════════════════════════════╝

// ════════════════════════════════════════
//  ⚙️  CONFIG — แก้ไขตรงนี้เท่านั้น
// ════════════════════════════════════════
const CONFIG = {
  SPREADSHEET_ID : "1mLFrsrGK-u-Ei3aSbfzhH-I2NFDxxheqb0D5Ncim1v4",
  FOLDER_ID      : "1mJYe08APA3uTzSim-xAzUtx-3EwVFVpv",
  ADMIN_PASSWORD : "12345",
  SCHOOL_NAME    : "โรงเรียนโซ่พิสัยพิทยาคม",
  TIMEZONE       : "Asia/Bangkok"
};

// ════════════════════════════════════════
//  📋  SHEET DEFINITIONS
//  แก้ไขชื่อ/หัวตารางได้ตรงนี้จุดเดียว
// ════════════════════════════════════════
const SHEETS = {
  STOCK: {
    name   : "Stock",
    headers: ["ID","รายการ","หมายเลขครุภัณฑ์","หมวดหมู่",
              "ทั้งหมด","คงเหลือ","หมายเหตุ","รูปภาพURL"]
    // col:    1     2         3                 4
    //         5       6         7          8
  },
  TX: {
    name   : "Transactions",
    headers: ["TransID","ประเภทผู้ยืม","ชื่อผู้ยืม","รหัสประจำตัว/ห้อง/สังกัด",
              "IDอุปกรณ์","หมายเลขครุภัณฑ์","จำนวนที่ยืม","จำนวนที่คืน",
              "วันที่ยืม","วันที่คืน","สถานะ","ImageURL","SignatureURL"]
    // col:   1          2               3          4
    //        5             6                  7               8
    //        9              10           11        12           13
  }
};

// ════════════════════════════════════════
//  🔧  AUTO-SETUP — ตรวจ & สร้าง Sheets
// ════════════════════════════════════════
function setupSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const results = [];

  Object.values(SHEETS).forEach(def => {
    let sheet = ss.getSheetByName(def.name);

    if (!sheet) {
      // ไม่มี Sheet → สร้างใหม่
      sheet = ss.insertSheet(def.name);
      sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
      _styleHeader(sheet, def.headers.length);
      results.push(`✅ สร้าง Sheet "${def.name}" ใหม่พร้อม ${def.headers.length} คอลัมน์`);

    } else {
      // มี Sheet แล้ว → ตรวจ headers
      const existing = sheet.getRange(1, 1, 1, def.headers.length).getValues()[0];
      const missing  = def.headers.filter((h, i) => existing[i] !== h);

      if (missing.length > 0 || sheet.getLastColumn() < def.headers.length) {
        // Headers ไม่ครบ → เขียนใหม่ทั้งแถว
        sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
        _styleHeader(sheet, def.headers.length);
        results.push(`🔧 ซ่อม headers ใน "${def.name}" (เพิ่ม: ${missing.join(", ")||"จัด format"})`);
      } else {
        results.push(`☑️  Sheet "${def.name}" ครบถ้วน (${def.headers.length} คอลัมน์)`);
      }
    }
  });

  Logger.log(results.join("\n"));
  return results;
}

function _styleHeader(sheet, numCols) {
  const hdr = sheet.getRange(1, 1, 1, numCols);
  hdr.setBackground("#1565C0")
     .setFontColor("#FFFFFF")
     .setFontWeight("bold")
     .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

// ════════════════════════════════════════
//  🌐  ENTRY POINT
// ════════════════════════════════════════
function doGet() {
  setupSheets(); // ตรวจทุกครั้งที่เปิดหน้าเว็บ (เร็วมาก ถ้าครบก็ผ่านไป)
  return HtmlService
    .createTemplateFromFile("Index")
    .evaluate()
    .setTitle("ระบบยืม–คืนอุปกรณ์ | " + CONFIG.SCHOOL_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ════════════════════════════════════════
//  📂  HELPERS
// ════════════════════════════════════════
function _ss()           { return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID); }
function _sheet(name)    { return _ss().getSheetByName(name); }
function _now()          { return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "dd/MM/yyyy HH:mm"); }
function _rows(sheet)    { return sheet.getDataRange().getValues(); }

function _toObj(headers, row) {
  const o = {};
  headers.forEach((h, i) => {
    o[h] = row[i] instanceof Date
      ? Utilities.formatDate(row[i], CONFIG.TIMEZONE, "dd/MM/yyyy HH:mm")
      : (row[i] !== undefined ? row[i] : "");
  });
  return o;
}

// ════════════════════════════════════════
//  📦  STOCK — อ่านข้อมูล
// ════════════════════════════════════════
function getStockData() {
  setupSheets();
  const sheet = _sheet(SHEETS.STOCK.name);
  const rows  = _rows(sheet);
  if (rows.length < 2) return [];
  const h = rows[0];
  return rows.slice(1).filter(r => r[0] !== "").map(r => _toObj(h, r));
}

// ════════════════════════════════════════
//  📋  TRANSACTIONS — อ่านข้อมูล
// ════════════════════════════════════════
function getTransactionData() {
  setupSheets();
  const sheet = _sheet(SHEETS.TX.name);
  const rows  = _rows(sheet);
  if (rows.length < 2) return [];
  const h = rows[0];
  return rows.slice(1).filter(r => r[0] !== "").map(r => _toObj(h, r));
}

// ════════════════════════════════════════
//  📦  STOCK — CRUD
// ════════════════════════════════════════
function addStockItem(data) {
  try {
    setupSheets();
    const sheet = _sheet(SHEETS.STOCK.name);
    const newId = "ITM" + String(sheet.getLastRow()).padStart(4, "0");
    const total = Number(data.total) || 0;
    sheet.appendRow([
      newId, data.name || "", data.assetNo || "", data.category || "",
      total, total, data.remark || "", data.imageUrl || ""
    ]);
    return { success: true, id: newId };
  } catch(e) { return { success: false, error: e.message }; }
}

function updateStockItem(data) {
  try {
    const sheet = _sheet(SHEETS.STOCK.name);
    const rows  = _rows(sheet);
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(data.id)) {
        sheet.getRange(i + 1, 2, 1, 7).setValues([[
          data.name || "", data.assetNo || "", data.category || "",
          Number(data.total) || 0, Number(data.remaining) || 0,
          data.remark || "", data.imageUrl || ""
        ]]);
        return { success: true };
      }
    }
    return { success: false, error: "ไม่พบรายการ ID: " + data.id };
  } catch(e) { return { success: false, error: e.message }; }
}

function deleteStockItem(id) {
  try {
    const sheet = _sheet(SHEETS.STOCK.name);
    const rows  = _rows(sheet);
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, error: "ไม่พบ ID: " + id };
  } catch(e) { return { success: false, error: e.message }; }
}

function uploadCatalogImage(id, base64Data) {
  try {
    const url = _uploadDrive(base64Data, "cat_" + id + "_" + Date.now() + ".jpg", "image/jpeg");
    if (!url) return { success: false, error: "อัปโหลดไม่สำเร็จ" };
    // อัปเดต col 8 = รูปภาพURL
    const sheet = _sheet(SHEETS.STOCK.name);
    const rows  = _rows(sheet);
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(id)) {
        sheet.getRange(i + 1, 8).setValue(url);
        return { success: true, url };
      }
    }
    return { success: false, error: "ไม่พบ ID" };
  } catch(e) { return { success: false, error: e.message }; }
}

// ════════════════════════════════════════
//  📤  BORROW
// ════════════════════════════════════════
function submitBorrow(payload) {
  try {
    setupSheets();
    const stockSheet = _sheet(SHEETS.STOCK.name);
    const txSheet    = _sheet(SHEETS.TX.name);
    let   stockRows  = _rows(stockSheet);
    const transId    = "TXN" + Date.now();
    const dateStr    = _now();

    // ── 1. Validate ────────────────────────
    for (const item of payload.items) {
      let found = false;
      for (let i = 1; i < stockRows.length; i++) {
        if (String(stockRows[i][0]) === String(item.itemId)) {
          found = true;
          const rem = Number(stockRows[i][5]);
          if (rem < Number(item.qty))
            return { success: false, error: `"${stockRows[i][1]}" คงเหลือเพียง ${rem} ชิ้น` };
          break;
        }
      }
      if (!found) return { success: false, error: "ไม่พบอุปกรณ์รหัส: " + item.itemId };
    }

    // ── 2. Upload files ────────────────────
    let imgUrl = "";
    if (payload.imageBase64 && payload.imageBase64.length > 200)
      imgUrl = _uploadDrive(payload.imageBase64, "img_" + transId + ".jpg", "image/jpeg");
    let sigUrl = "";
    if (payload.signatureBase64 && payload.signatureBase64.length > 200)
      sigUrl = _uploadDrive(payload.signatureBase64, "sig_" + transId + ".png", "image/png");

    // ── 3. Write ───────────────────────────
    stockRows = _rows(stockSheet); // re-fetch
    for (const item of payload.items) {
      for (let i = 1; i < stockRows.length; i++) {
        if (String(stockRows[i][0]) === String(item.itemId)) {
          const newRem = Number(stockRows[i][5]) - Number(item.qty);
          stockSheet.getRange(i + 1, 6).setValue(newRem);
          stockRows[i][5] = newRem;
          txSheet.appendRow([
            transId,
            payload.borrowerType, payload.borrowerName, payload.borrowerId,
            item.itemId, stockRows[i][2],
            Number(item.qty), 0,
            dateStr, "", "ยืมอยู่", imgUrl, sigUrl
          ]);
          break;
        }
      }
    }
    return { success: true, transId };
  } catch(e) { return { success: false, error: e.message }; }
}

// ════════════════════════════════════════
//  📥  RETURN
// ════════════════════════════════════════
function verifyAdmin(pw) { return pw === CONFIG.ADMIN_PASSWORD; }

function getPendingTransactions() {
  const tx    = getTransactionData();
  const stock = getStockData();
  return tx
    .filter(r => r["สถานะ"] === "ยืมอยู่" || r["สถานะ"] === "คืนบางส่วน")
    .map(r => {
      const s = stock.find(x => String(x["ID"]) === String(r["IDอุปกรณ์"]));
      return {
        transId  : r["TransID"],
        type     : r["ประเภทผู้ยืม"],
        borrower : r["ชื่อผู้ยืม"],
        code     : r["รหัสประจำตัว/ห้อง/สังกัด"],
        itemId   : r["IDอุปกรณ์"],
        itemName : s ? s["รายการ"] : r["IDอุปกรณ์"],
        assetNo  : r["หมายเลขครุภัณฑ์"],
        borrowed : Number(r["จำนวนที่ยืม"]),
        returned : Number(r["จำนวนที่คืน"]),
        canReturn: Number(r["จำนวนที่ยืม"]) - Number(r["จำนวนที่คืน"]),
        borrowDate: r["วันที่ยืม"],
        status   : r["สถานะ"]
      };
    });
}

function submitReturn(payload) {
  try {
    if (!verifyAdmin(payload.adminPass))
      return { success: false, error: "รหัสผ่านไม่ถูกต้อง" };

    const stockSheet = _sheet(SHEETS.STOCK.name);
    const txSheet    = _sheet(SHEETS.TX.name);
    const txRows     = _rows(txSheet);
    const stockRows  = _rows(stockSheet);
    const dateStr    = _now();

    for (let i = 1; i < txRows.length; i++) {
      if (String(txRows[i][0]) === String(payload.transId) &&
          String(txRows[i][4]) === String(payload.itemId)) {

        const orig = Number(txRows[i][6]);
        const done = Number(txRows[i][7]);
        const ret  = Number(payload.returnQty);
        const tot  = done + ret;
        const can  = orig - done;

        if (ret < 1 || ret > can)
          return { success: false, error: `คืนได้ 1–${can} ชิ้น (คืนแล้ว ${done})` };

        const status = tot >= orig ? "คืนแล้ว" : "คืนบางส่วน";
        txSheet.getRange(i + 1, 8).setValue(tot);      // จำนวนที่คืน
        txSheet.getRange(i + 1, 10).setValue(dateStr); // วันที่คืน
        txSheet.getRange(i + 1, 11).setValue(status);  // สถานะ

        // คืนสต็อก
        for (let j = 1; j < stockRows.length; j++) {
          if (String(stockRows[j][0]) === String(payload.itemId)) {
            stockSheet.getRange(j + 1, 6).setValue(Number(stockRows[j][5]) + ret);
            break;
          }
        }
        return { success: true, status };
      }
    }
    return { success: false, error: "ไม่พบรายการ TransID: " + payload.transId };
  } catch(e) { return { success: false, error: e.message }; }
}

// ════════════════════════════════════════
//  📊  DASHBOARD STATS
// ════════════════════════════════════════
function getDashboardStats() {
  const stock = getStockData();
  const tx    = getTransactionData();

  const totalItems      = stock.reduce((s, r) => s + Number(r["ทั้งหมด"]  || 0), 0);
  const totalRemaining  = stock.reduce((s, r) => s + Number(r["คงเหลือ"]  || 0), 0);
  const activeBorrows   = tx.filter(r => r["สถานะ"] === "ยืมอยู่" || r["สถานะ"] === "คืนบางส่วน").length;
  const totalBorrowCount= new Set(tx.map(r => r["TransID"])).size;

  // Top 10
  const cmap = {};
  tx.forEach(r => {
    if (!r["IDอุปกรณ์"]) return;
    cmap[r["IDอุปกรณ์"]] = (cmap[r["IDอุปกรณ์"]] || 0) + Number(r["จำนวนที่ยืม"] || 0);
  });
  const topItems = Object.entries(cmap)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([id, count]) => {
      const s = stock.find(x => String(x["ID"]) === String(id));
      return { name: s ? s["รายการ"] : id, count };
    });

  // Overdue > 7 days
  const overdueList = [];
  tx.forEach(r => {
    if (r["สถานะ"] === "คืนแล้ว") return;
    const parts = String(r["วันที่ยืม"]).split(" ")[0].split("/");
    if (parts.length < 3) return;
    let yr = Number(parts[2]);
    if (yr > 2500) yr -= 543;
    const days = (Date.now() - new Date(yr, Number(parts[1]) - 1, Number(parts[0])).getTime()) / 86400000;
    if (days > 7) {
      const s = stock.find(x => String(x["ID"]) === String(r["IDอุปกรณ์"]));
      overdueList.push({
        transId   : r["TransID"],
        borrower  : r["ชื่อผู้ยืม"],
        type      : r["ประเภทผู้ยืม"],
        itemName  : s ? s["รายการ"] : r["IDอุปกรณ์"],
        qty       : Number(r["จำนวนที่ยืม"]) - Number(r["จำนวนที่คืน"]),
        borrowDate: r["วันที่ยืม"],
        days      : Math.floor(days),
        status    : r["สถานะ"]
      });
    }
  });

  return {
    totalItems, totalRemaining, activeBorrows, totalBorrowCount,
    stockCount: stock.length, topItems, overdueList,
    ts: Date.now()
  };
}

// ════════════════════════════════════════
//  🖨️  PRINT REGISTER
// ════════════════════════════════════════
function getRegisterData(filter) {
  const tx    = getTransactionData();
  const stock = getStockData();
  let rows = tx;
  if (filter === "pending")          rows = tx.filter(r => r["สถานะ"] !== "คืนแล้ว");
  else if (filter && filter !== "all") rows = tx.filter(r => r["TransID"] === filter);
  return rows.map((r, i) => {
    const s = stock.find(x => String(x["ID"]) === String(r["IDอุปกรณ์"]));
    return {
      no         : i + 1,
      itemName   : s ? s["รายการ"] : (r["IDอุปกรณ์"] || "-"),
      assetNo    : r["หมายเลขครุภัณฑ์"] || "-",
      qty        : r["จำนวนที่ยืม"] || 0,
      borrowDate : r["วันที่ยืม"] || "-",
      borrower   : r["ชื่อผู้ยืม"] || "-",
      returnDate : r["วันที่คืน"] || "-",
      returner   : r["วันที่คืน"] ? (r["ชื่อผู้ยืม"] || "-") : "-",
      status     : r["สถานะ"] || "-",
      signatureUrl: r["SignatureURL"] || "",
      transId    : r["TransID"] || ""
    };
  });
}

// ════════════════════════════════════════
//  ☁️  GOOGLE DRIVE UPLOAD
// ════════════════════════════════════════
function _uploadDrive(base64Data, fileName, mimeType) {
  try {
    const folder  = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    const raw     = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
    const blob    = Utilities.newBlob(Utilities.base64Decode(raw), mimeType, fileName);
    const file    = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://drive.google.com/uc?id=" + file.getId();
  } catch(e) {
    Logger.log("Drive upload error: " + e.message);
    return "";
  }
}

// ════════════════════════════════════════
//  🧪  TEST — รันใน GAS Editor ได้เลย
// ════════════════════════════════════════
function testSetup() {
  const results = setupSheets();
  results.forEach(r => Logger.log(r));
  Logger.log("\n✅ Setup เสร็จสมบูรณ์!");
  Logger.log("📦 Stock rows  : " + (getStockData().length));
  Logger.log("📋 TX rows     : " + (getTransactionData().length));
}
