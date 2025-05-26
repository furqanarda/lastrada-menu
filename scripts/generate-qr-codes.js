const fs = require('fs');
const path = require('path');

// Read tokens from the JSON file
const tokensPath = path.join(__dirname, '../data/tokens.json');
const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

// Base URL for production
const BASE_URL = 'https://menu.theplazahoteledirne.com';

/**
 * Generate QR code URL for a token
 */
function generateQRCodeURL(token) {
  return `${BASE_URL}?token=${encodeURIComponent(token)}`;
}

/**
 * Get all room tokens
 */
function getAllRooms() {
  return Object.entries(tokens)
    .filter(([key, data]) => data.type === 'room')
    .map(([key, data]) => ({
      roomNumber: key,
      roomName: data.name,
      token: data.token,
      qrCodeURL: generateQRCodeURL(data.token)
    }))
    .sort((a, b) => {
      // Sort by room number (handle both numeric and alphanumeric)
      const aNum = parseInt(a.roomNumber) || 0;
      const bNum = parseInt(b.roomNumber) || 0;
      if (aNum && bNum) return aNum - bNum;
      return a.roomNumber.localeCompare(b.roomNumber);
    });
}

/**
 * Generate CSV format for easy import into other tools
 */
function generateCSV(rooms) {
  const header = 'Room Number,Room Name,Token,QR Code URL\n';
  const rows = rooms.map(room => 
    `"${room.roomNumber}","${room.roomName}","${room.token}","${room.qrCodeURL}"`
  ).join('\n');
  return header + rows;
}

/**
 * Generate HTML format for easy viewing and printing
 */
function generateHTML(rooms) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La Strada Hotel - Room QR Codes</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .room-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .room-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
        .room-number { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .qr-url { font-size: 12px; word-break: break-all; color: #666; margin-top: 10px; }
        .instructions { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
        @media print {
            .room-card { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>La Strada Hotel - Room QR Codes</h1>
        <p>Total Rooms: ${rooms.length}</p>
    </div>
    
    <div class="instructions">
        <h3>How to Generate QR Code Images:</h3>
        <ol>
            <li>Copy the URL from each room card below</li>
            <li>Go to a QR code generator like <a href="https://qr-code-generator.com" target="_blank">qr-code-generator.com</a></li>
            <li>Paste the URL and generate the QR code</li>
            <li>Download as PNG/SVG and print</li>
            <li>Alternative: Use the bulk generation script (see README)</li>
        </ol>
    </div>
    
    <div class="room-grid">
        ${rooms.map(room => `
            <div class="room-card">
                <div class="room-number">${room.roomName}</div>
                <div>Token: <code>${room.token}</code></div>
                <div class="qr-url">
                    <strong>QR Code URL:</strong><br>
                    <a href="${room.qrCodeURL}" target="_blank">${room.qrCodeURL}</a>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
}

/**
 * Generate a simple text list
 */
function generateTextList(rooms) {
  let output = 'LA STRADA HOTEL - ROOM QR CODES\n';
  output += '=====================================\n\n';
  
  rooms.forEach(room => {
    output += `${room.roomName}\n`;
    output += `Token: ${room.token}\n`;
    output += `QR URL: ${room.qrCodeURL}\n`;
    output += '---\n';
  });
  
  return output;
}

/**
 * Generate JSON format for programmatic use
 */
function generateJSON(rooms) {
  return JSON.stringify({
    generated: new Date().toISOString(),
    baseURL: BASE_URL,
    totalRooms: rooms.length,
    rooms: rooms
  }, null, 2);
}

// Main execution
console.log('🏨 Generating QR codes for La Strada Hotel rooms...\n');

const rooms = getAllRooms();
console.log(`Found ${rooms.length} rooms:`);
rooms.forEach(room => console.log(`  - ${room.roomName} (${room.roomNumber})`));

// Create output directory
const outputDir = path.join(__dirname, '../qr-codes-output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all formats
const formats = [
  { name: 'CSV', extension: 'csv', generator: generateCSV },
  { name: 'HTML', extension: 'html', generator: generateHTML },
  { name: 'Text', extension: 'txt', generator: generateTextList },
  { name: 'JSON', extension: 'json', generator: generateJSON }
];

console.log('\n📁 Generating files...');
formats.forEach(format => {
  const filename = `room-qr-codes.${format.extension}`;
  const filepath = path.join(outputDir, filename);
  const content = format.generator(rooms);
  
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`  ✅ ${format.name}: ${filename}`);
});

// Generate individual room files for easy access
const individualDir = path.join(outputDir, 'individual-rooms');
if (!fs.existsSync(individualDir)) {
  fs.mkdirSync(individualDir, { recursive: true });
}

console.log('\n📄 Generating individual room files...');
rooms.forEach(room => {
  const content = `Room: ${room.roomName}
Token: ${room.token}
QR Code URL: ${room.qrCodeURL}

Instructions:
1. Copy the URL above
2. Go to https://qr-code-generator.com
3. Paste the URL and generate QR code
4. Download and print the QR code
5. Place it in ${room.roomName}
`;
  
  const filename = `room-${room.roomNumber}.txt`;
  const filepath = path.join(individualDir, filename);
  fs.writeFileSync(filepath, content, 'utf8');
});

console.log(`  ✅ Created ${rooms.length} individual room files`);

console.log('\n🎉 QR code generation complete!');
console.log(`📂 Output directory: ${outputDir}`);
console.log('\n📋 Next steps:');
console.log('1. Open room-qr-codes.html in your browser to view all QR codes');
console.log('2. Use the CSV file to import into spreadsheet applications');
console.log('3. Check individual-rooms/ folder for per-room instructions');
console.log('4. Use a QR code generator to create actual QR code images');
console.log('\n🔗 Recommended QR code generators:');
console.log('- https://qr-code-generator.com (free, high quality)');
console.log('- https://www.qr-code-generator.org (bulk generation)');
console.log('- https://qr.io (API for automation)'); 