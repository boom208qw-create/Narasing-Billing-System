/**
 * Export Bills - ส่งออกข้อมูลบิลเป็น CSV / Excel
 * ใช้ Pure JavaScript ไม่ต้องติดตั้ง Library เพิ่ม
 */

/**
 * แปลงข้อมูลบิลเป็น Array ของ Row สำหรับ Export
 */
function billsToRows(bills) {
    const headers = [
        'ห้อง', 'ผู้เช่า', 'วันที่',
        'มิเตอร์น้ำ(เดิม)', 'มิเตอร์น้ำ(ปัจจุบัน)', 'น้ำ(หน่วย)', 'ค่าน้ำ/หน่วย', 'รวมค่าน้ำ',
        'มิเตอร์ไฟ(เดิม)', 'มิเตอร์ไฟ(ปัจจุบัน)', 'ไฟ(หน่วย)', 'ค่าไฟ/หน่วย', 'รวมค่าไฟ',
        'ค่าปรับ', 'หมายเหตุค่าปรับ', 'ค่าเช่า', 'ยอดรวม'
    ];

    const rows = bills.map(bill => [
        bill.roomNumber || '',
        bill.tenantName || '',
        bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('th-TH') : '',
        bill.water?.lastMeter ?? '',
        bill.water?.currentMeter ?? '',
        bill.water?.units ?? '',
        bill.water?.rate ?? '',
        bill.water?.amount ?? '',
        bill.electric?.lastMeter ?? '',
        bill.electric?.currentMeter ?? '',
        bill.electric?.units ?? '',
        bill.electric?.rate ?? '',
        bill.electric?.amount ?? '',
        bill.fineAmount || 0,
        bill.fineNote || '',
        bill.roomRent || 0,
        bill.total || 0
    ]);

    return { headers, rows };
}

/**
 * ดาวน์โหลดไฟล์
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Export เป็น CSV พร้อม BOM สำหรับภาษาไทย
 */
export function exportToCSV(bills, filename = 'billing_history.csv') {
    const { headers, rows } = billsToRows(bills);

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => {
            const str = String(cell);
            // ถ้ามี comma, newline หรือ double quote ต้องครอบด้วย double quotes
            if (str.includes(',') || str.includes('\n') || str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(','))
        .join('\n');

    // เพิ่ม BOM เพื่อให้ Excel อ่านภาษาไทยถูกต้อง
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
}

/**
 * Export เป็น Excel (.xlsx) ด้วย Pure JavaScript
 * สร้างไฟล์ xlsx โดยใช้ XML + ZIP (ผ่าน Blob)
 */
export function exportToExcel(bills, filename = 'billing_history.xlsx') {
    const { headers, rows } = billsToRows(bills);

    // สร้าง XML worksheet
    let sheetData = '';

    // Header row
    sheetData += '<row r="1">';
    headers.forEach((h, i) => {
        const col = columnLetter(i);
        sheetData += `<c r="${col}1" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`;
    });
    sheetData += '</row>';

    // Data rows
    rows.forEach((row, ri) => {
        const rowNum = ri + 2;
        sheetData += `<row r="${rowNum}">`;
        row.forEach((cell, ci) => {
            const col = columnLetter(ci);
            const ref = `${col}${rowNum}`;
            if (typeof cell === 'number' && !isNaN(cell)) {
                sheetData += `<c r="${ref}"><v>${cell}</v></c>`;
            } else {
                sheetData += `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(String(cell))}</t></is></c>`;
            }
        });
        sheetData += '</row>';
    });

    const lastCol = columnLetter(headers.length - 1);
    const lastRow = rows.length + 1;
    const dimension = `A1:${lastCol}${lastRow}`;

    // XLSX file components
    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

    const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="ประวัติบิล" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>`;

    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${dimension}"/>
  <sheetData>${sheetData}</sheetData>
</worksheet>`;

    // สร้าง ZIP ไฟล์ (XLSX = ZIP ที่มี XML ข้างใน)
    const zip = createSimpleZip([
        { path: '[Content_Types].xml', content: contentTypes },
        { path: '_rels/.rels', content: rels },
        { path: 'xl/_rels/workbook.xml.rels', content: workbookRels },
        { path: 'xl/workbook.xml', content: workbook },
        { path: 'xl/styles.xml', content: styles },
        { path: 'xl/worksheets/sheet1.xml', content: sheet }
    ]);

    const blob = new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, filename);
}

// ========== HELPER FUNCTIONS ==========

function columnLetter(index) {
    let letter = '';
    let i = index;
    while (i >= 0) {
        letter = String.fromCharCode(65 + (i % 26)) + letter;
        i = Math.floor(i / 26) - 1;
    }
    return letter;
}

function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// ========== SIMPLE ZIP BUILDER ==========

function createSimpleZip(files) {
    const encoder = new TextEncoder();
    const localHeaders = [];
    const centralHeaders = [];
    let offset = 0;

    files.forEach(file => {
        const nameBytes = encoder.encode(file.path);
        const contentBytes = encoder.encode(file.content);
        const crc = crc32(contentBytes);

        // Local file header
        const local = new ArrayBuffer(30 + nameBytes.length + contentBytes.length);
        const localView = new DataView(local);
        const localArr = new Uint8Array(local);

        localView.setUint32(0, 0x04034b50, true); // signature
        localView.setUint16(4, 20, true);          // version needed
        localView.setUint16(6, 0, true);           // flags
        localView.setUint16(8, 0, true);           // compression (store)
        localView.setUint16(10, 0, true);          // mod time
        localView.setUint16(12, 0, true);          // mod date
        localView.setUint32(14, crc, true);        // crc32
        localView.setUint32(18, contentBytes.length, true); // compressed size
        localView.setUint32(22, contentBytes.length, true); // uncompressed size
        localView.setUint16(26, nameBytes.length, true);    // name length
        localView.setUint16(28, 0, true);          // extra length
        localArr.set(nameBytes, 30);
        localArr.set(contentBytes, 30 + nameBytes.length);

        localHeaders.push(localArr);

        // Central directory header
        const central = new ArrayBuffer(46 + nameBytes.length);
        const centralView = new DataView(central);
        const centralArr = new Uint8Array(central);

        centralView.setUint32(0, 0x02014b50, true); // signature
        centralView.setUint16(4, 20, true);          // version made by
        centralView.setUint16(6, 20, true);          // version needed
        centralView.setUint16(8, 0, true);           // flags
        centralView.setUint16(10, 0, true);          // compression
        centralView.setUint16(12, 0, true);          // mod time
        centralView.setUint16(14, 0, true);          // mod date
        centralView.setUint32(16, crc, true);        // crc32
        centralView.setUint32(20, contentBytes.length, true); // compressed size
        centralView.setUint32(24, contentBytes.length, true); // uncompressed size
        centralView.setUint16(28, nameBytes.length, true);    // name length
        centralView.setUint16(30, 0, true);          // extra length
        centralView.setUint16(32, 0, true);          // comment length
        centralView.setUint16(34, 0, true);          // disk number
        centralView.setUint16(36, 0, true);          // internal attrs
        centralView.setUint32(38, 0, true);          // external attrs
        centralView.setUint32(42, offset, true);     // local header offset
        centralArr.set(nameBytes, 46);

        centralHeaders.push(centralArr);

        offset += local.byteLength;
    });

    // End of central directory
    const centralDirOffset = offset;
    let centralDirSize = 0;
    centralHeaders.forEach(h => centralDirSize += h.length);

    const endRecord = new ArrayBuffer(22);
    const endView = new DataView(endRecord);
    endView.setUint32(0, 0x06054b50, true);                    // signature
    endView.setUint16(4, 0, true);                             // disk number
    endView.setUint16(6, 0, true);                             // central dir disk
    endView.setUint16(8, files.length, true);                  // entries on disk
    endView.setUint16(10, files.length, true);                 // total entries
    endView.setUint32(12, centralDirSize, true);               // central dir size
    endView.setUint32(16, centralDirOffset, true);             // central dir offset
    endView.setUint16(20, 0, true);                            // comment length

    // Combine all parts
    const totalSize = offset + centralDirSize + 22;
    const result = new Uint8Array(totalSize);
    let pos = 0;

    localHeaders.forEach(h => { result.set(h, pos); pos += h.length; });
    centralHeaders.forEach(h => { result.set(h, pos); pos += h.length; });
    result.set(new Uint8Array(endRecord), pos);

    return result.buffer;
}

// CRC32 implementation
function crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) {
        crc ^= bytes[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}
