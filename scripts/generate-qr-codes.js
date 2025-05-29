const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

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
      qrCodeURL: generateQRCodeURL(data.token),
      displayNumber: key // Use the key as display number
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
 * Get all restaurant tables
 */
function getRestaurantTables() {
  return Object.entries(tokens)
    .filter(([key, data]) => data.type === 'restaurant')
    .map(([key, data]) => ({
      tableNumber: key,
      tableName: data.name,
      token: data.token,
      qrCodeURL: generateQRCodeURL(data.token),
      displayNumber: key // Keep full identifier like "S1", "S2", etc.
    }))
    .sort((a, b) => {
      const aNum = parseInt(a.displayNumber.replace('S', '')) || 0;
      const bNum = parseInt(b.displayNumber.replace('S', '')) || 0;
      return aNum - bNum;
    });
}

/**
 * Get all garden tables
 */
function getGardenTables() {
  return Object.entries(tokens)
    .filter(([key, data]) => data.type === 'garden')
    .map(([key, data]) => ({
      tableNumber: key,
      tableName: data.name,
      token: data.token,
      qrCodeURL: generateQRCodeURL(data.token),
      displayNumber: key // Keep full identifier like "B1", "B2", etc.
    }))
    .sort((a, b) => {
      const aNum = parseInt(a.displayNumber.replace('B', '')) || 0;
      const bNum = parseInt(b.displayNumber.replace('B', '')) || 0;
      return aNum - bNum;
    });
}

/**
 * Generate QR code as SVG with number overlay
 */
async function generateQRCodeWithNumber(url, displayNumber) {
  try {
    // Generate QR code as SVG
    const qrSVG = await QRCode.toString(url, {
      type: 'svg',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    // Extract viewBox dimensions to calculate center
    const viewBoxMatch = qrSVG.match(/viewBox="([^"]+)"/);
    let centerX = 200, centerY = 200; // default fallback
    let qrWidth = 400;
    
    if (viewBoxMatch) {
      const viewBoxValues = viewBoxMatch[1].split(' ').map(Number);
      const [minX, minY, width, height] = viewBoxValues;
      centerX = minX + width / 2;
      centerY = minY + height / 2;
      qrWidth = width;
    }

    // Calculate circle radius based on QR code size (make it visible)
    const circleRadius = Math.max(2.5, qrWidth * 0.12);
    
    // Adjust font size based on circle size and number length
    const baseFontSize = circleRadius * 0.65;
    const fontSize = displayNumber.length <= 2 ? baseFontSize : 
                     displayNumber.length <= 3 ? baseFontSize * 0.75 : 
                     baseFontSize * 0.55;

    // Add number overlay to SVG
    const svgWithNumber = qrSVG.replace(
      '</svg>',
      `
      <!-- White circle background -->
      <circle cx="${centerX}" cy="${centerY}" r="${circleRadius}" fill="white" stroke="black" stroke-width="0.3"/>
      <!-- Number text -->
      <text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="central" 
            font-family="Arial, sans-serif" font-weight="bold" font-size="${fontSize}" 
            fill="black">${displayNumber}</text>
      </svg>`
    );

    return svgWithNumber;
  } catch (error) {
    console.error(`Error generating QR code for ${displayNumber}:`, error);
    return null;
  }
}

/**
 * Generate QR code as PNG file (plain, no numbers)
 */
async function generateQRCodePNG(url, displayNumber, outputPath) {
  try {
    // Generate QR code as PNG buffer
    const qrBuffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    // Save the PNG file
    fs.writeFileSync(outputPath, qrBuffer);
    return true;
  } catch (error) {
    console.error(`Error generating QR code PNG for ${displayNumber}:`, error);
    return false;
  }
}

/**
 * Generate individual QR code instruction HTML file
 */
function generateInstructionHTML(item, type, svgFileName, pngFileName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${item.displayName || item.roomName || item.tableName} - QR Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 20px;
            background: white;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            text-align: center;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #1f2937;
        }
        .subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
        }
        .qr-preview {
            margin: 20px 0;
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            background: white;
            display: inline-block;
        }
        .download-section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .download-btn {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px;
        }
        .download-btn:hover {
            background: #1d4ed8;
        }
        .download-btn.primary {
            background: #059669;
        }
        .download-btn.primary:hover {
            background: #047857;
        }
        .instructions {
            margin: 30px 0;
            padding: 20px;
            background: #f1f5f9;
            border-radius: 8px;
            text-align: left;
        }
        .url {
            word-break: break-all;
            font-family: monospace;
            background: #f1f3f4;
            padding: 8px;
            border-radius: 4px;
            margin: 10px 0;
            font-size: 12px;
        }
        .recommendation {
            background: #ecfdf5;
            border: 1px solid #10b981;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .recommendation h4 {
            color: #047857;
            margin-top: 0;
        }
        .folder-structure {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
        }
        .folder-structure h4 {
            color: #1e293b;
            margin-top: 0;
        }
        .folder-tree {
            font-family: monospace;
            font-size: 14px;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title">${item.displayName || item.roomName || item.tableName}</div>
        <div class="subtitle">La Strada ${type}</div>
        
        <div class="qr-preview">
            <div style="width: 400px; height: 400px; margin: 0 auto;">
                <object data="${svgFileName}" type="image/svg+xml" width="400" height="400">
                    <p>QR Code Preview - Please download the SVG file</p>
                </object>
            </div>
        </div>
        
        <div class="recommendation">
            <h4>🎯 Recommended: SVG with Number</h4>
            <p>The SVG version includes the <strong>"${item.displayNumber}"</strong> number in the center and is perfect for printing!</p>
        </div>

        <div class="folder-structure">
            <h4>📁 File Organization</h4>
            <div class="folder-tree">
├── svg/    📊 SVG files (with numbers in center)
├── png/    🖼️ PNG files (plain QR codes)
└── HTML files (this page)
            </div>
        </div>
        
        <div class="download-section">
            <h3>📥 Download Options</h3>
            <a href="${svgFileName}" download="${svgFileName.split('/')[1]}" class="download-btn primary">
                📊 Download SVG (with number ${item.displayNumber})
            </a>
            <a href="${pngFileName}" download="${pngFileName.split('/')[1]}" class="download-btn">
                🖼️ Download PNG (plain)
            </a>
            <p><strong>Recommended:</strong> Use the SVG file for best printing quality with the number in center.</p>
        </div>
        
        <div class="instructions">
            <h3>📋 Instructions:</h3>
            <ol>
                <li><strong>Download SVG</strong> (recommended) - includes "${item.displayNumber}" in center</li>
                <li><strong>Print the SVG file</strong> directly from your browser</li>
                <li><strong>Alternative:</strong> Download PNG and manually add "${item.displayNumber}" when printing</li>
                <li><strong>Cut out</strong> the QR code</li>
                <li><strong>Place</strong> in ${item.displayName || item.roomName || item.tableName}</li>
            </ol>
            <p><strong>Note:</strong> SVG files print at higher quality and include the room/table number automatically!</p>
        </div>
        
        <div class="url">
            <strong>URL:</strong> ${item.qrCodeURL}
        </div>
    </div>
</body>
</html>`;
}

/**
 * Generate all QR code files
 */
async function generateAllQRCodes() {
  const rooms = getAllRooms();
  const restaurantTables = getRestaurantTables();
  const gardenTables = getGardenTables();

  // Create output directories with separate folders for SVG and PNG
  const outputDir = path.join(__dirname, '../qr-codes-output');
  const roomsDir = path.join(outputDir, 'rooms');
  const roomsSvgDir = path.join(roomsDir, 'svg');
  const roomsPngDir = path.join(roomsDir, 'png');
  const restaurantDir = path.join(outputDir, 'restaurant');
  const restaurantSvgDir = path.join(restaurantDir, 'svg');
  const restaurantPngDir = path.join(restaurantDir, 'png');
  const gardenDir = path.join(outputDir, 'garden');
  const gardenSvgDir = path.join(gardenDir, 'svg');
  const gardenPngDir = path.join(gardenDir, 'png');

  [outputDir, roomsDir, roomsSvgDir, roomsPngDir, restaurantDir, restaurantSvgDir, restaurantPngDir, gardenDir, gardenSvgDir, gardenPngDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('🏨 Generating QR codes as SVG and PNG files...\n');

  // Generate room QR codes
  console.log(`📱 Generating ${rooms.length} room QR codes...`);
  for (const room of rooms) {
    const svgFileName = `room-${room.roomNumber}.svg`;
    const pngFileName = `room-${room.roomNumber}.png`;
    const htmlFileName = `room-${room.roomNumber}.html`;
    const svgFilePath = path.join(roomsSvgDir, svgFileName);
    const pngFilePath = path.join(roomsPngDir, pngFileName);
    const htmlFilePath = path.join(roomsDir, htmlFileName);
    
    const svgWithNumber = await generateQRCodeWithNumber(room.qrCodeURL, room.displayNumber);
    if (svgWithNumber) {
      fs.writeFileSync(svgFilePath, svgWithNumber, 'utf8');
      const success = await generateQRCodePNG(room.qrCodeURL, room.displayNumber, pngFilePath);
      if (success) {
        const html = generateInstructionHTML(room, 'Hotel Room', `svg/${svgFileName}`, `png/${pngFileName}`);
        fs.writeFileSync(htmlFilePath, html, 'utf8');
        console.log(`  ✅ ${room.roomName} (${room.displayNumber}) - SVG + PNG + HTML`);
      } else {
        console.log(`  ❌ Failed: ${room.roomName}`);
      }
    } else {
      console.log(`  ❌ Failed: ${room.roomName}`);
    }
  }

  // Generate restaurant table QR codes
  console.log(`\n🍽️ Generating ${restaurantTables.length} restaurant table QR codes...`);
  for (const table of restaurantTables) {
    const svgFileName = `restaurant-table-${table.displayNumber}.svg`;
    const pngFileName = `restaurant-table-${table.displayNumber}.png`;
    const htmlFileName = `restaurant-table-${table.displayNumber}.html`;
    const svgFilePath = path.join(restaurantSvgDir, svgFileName);
    const pngFilePath = path.join(restaurantPngDir, pngFileName);
    const htmlFilePath = path.join(restaurantDir, htmlFileName);
    
    const svgWithNumber = await generateQRCodeWithNumber(table.qrCodeURL, table.displayNumber);
    if (svgWithNumber) {
      fs.writeFileSync(svgFilePath, svgWithNumber, 'utf8');
      const success = await generateQRCodePNG(table.qrCodeURL, table.displayNumber, pngFilePath);
      if (success) {
        const html = generateInstructionHTML(table, 'Restaurant Table', `svg/${svgFileName}`, `png/${pngFileName}`);
        fs.writeFileSync(htmlFilePath, html, 'utf8');
        console.log(`  ✅ ${table.tableName} (${table.displayNumber}) - SVG + PNG + HTML`);
      } else {
        console.log(`  ❌ Failed: ${table.tableName}`);
      }
    } else {
      console.log(`  ❌ Failed: ${table.tableName}`);
    }
  }

  // Generate garden table QR codes
  console.log(`\n🌿 Generating ${gardenTables.length} garden table QR codes...`);
  for (const table of gardenTables) {
    const svgFileName = `garden-table-${table.displayNumber}.svg`;
    const pngFileName = `garden-table-${table.displayNumber}.png`;
    const htmlFileName = `garden-table-${table.displayNumber}.html`;
    const svgFilePath = path.join(gardenSvgDir, svgFileName);
    const pngFilePath = path.join(gardenPngDir, pngFileName);
    const htmlFilePath = path.join(gardenDir, htmlFileName);
    
    const svgWithNumber = await generateQRCodeWithNumber(table.qrCodeURL, table.displayNumber);
    if (svgWithNumber) {
      fs.writeFileSync(svgFilePath, svgWithNumber, 'utf8');
      const success = await generateQRCodePNG(table.qrCodeURL, table.displayNumber, pngFilePath);
      if (success) {
        const html = generateInstructionHTML(table, 'Garden Table', `svg/${svgFileName}`, `png/${pngFileName}`);
        fs.writeFileSync(htmlFilePath, html, 'utf8');
        console.log(`  ✅ ${table.tableName} (${table.displayNumber}) - SVG + PNG + HTML`);
      } else {
        console.log(`  ❌ Failed: ${table.tableName}`);
      }
    } else {
      console.log(`  ❌ Failed: ${table.tableName}`);
    }
  }

  return { rooms, restaurantTables, gardenTables };
}

// Main execution
async function main() {
  console.log('🏨 Generating QR codes as SVG and PNG files for La Strada...\n');

  try {
    // Generate all QR code files
    const { rooms, restaurantTables, gardenTables } = await generateAllQRCodes();

    // Generate summary files
    const outputDir = path.join(__dirname, '../qr-codes-output');
    
    console.log('\n📁 Generating summary files...');
    
    // Generate combined summary
    const allItems = [
      ...rooms.map(r => ({ ...r, type: 'Room', displayName: r.roomName })),
      ...restaurantTables.map(t => ({ ...t, type: 'Restaurant Table', displayName: t.tableName })),
      ...gardenTables.map(t => ({ ...t, type: 'Garden Table', displayName: t.tableName }))
    ];

    // Generate summary HTML
    const summaryHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La Strada - QR Code Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #2563eb; }
        .stat-label { font-size: 1.1em; color: #666; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
        .item { background: white; border: 1px solid #ddd; padding: 10px; border-radius: 6px; text-align: center; }
        .item-number { font-weight: bold; font-size: 1.2em; color: #1f2937; }
        .item-type { font-size: 0.9em; color: #666; }
        .item a { text-decoration: none; color: inherit; }
        .item:hover { background: #f8f9fa; }
        .folder-info { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .folder-tree { font-family: monospace; font-size: 14px; line-height: 1.6; background: white; padding: 15px; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏨 La Strada - QR Code Generation Complete</h1>
        <p>All QR codes have been generated as SVG and PNG files</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${rooms.length}</div>
            <div class="stat-label">Hotel Rooms</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${restaurantTables.length}</div>
            <div class="stat-label">Restaurant Tables</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${gardenTables.length}</div>
            <div class="stat-label">Garden Tables</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${allItems.length}</div>
            <div class="stat-label">Total QR Codes</div>
        </div>
    </div>

    <div class="folder-info">
        <h3>📁 Organized File Structure</h3>
        <div class="folder-tree">qr-codes-output/
├── rooms/
│   ├── svg/           📊 SVG files with numbers (recommended for printing)
│   ├── png/           🖼️ PNG files (plain QR codes)
│   └── *.html         📄 Individual QR code pages
├── restaurant/
│   ├── svg/           📊 SVG files with numbers (S1, S2, etc.)
│   ├── png/           🖼️ PNG files (plain QR codes)
│   └── *.html         📄 Individual QR code pages
├── garden/
│   ├── svg/           📊 SVG files with numbers (B1, B2, etc.)
│   ├── png/           🖼️ PNG files (plain QR codes)
│   └── *.html         📄 Individual QR code pages
└── summary.html       📋 This overview page</div>
    </div>

    <div class="section">
        <h2>📁 Generated Files</h2>
        <ul>
            <li><strong>rooms/svg/</strong> - ${rooms.length} room SVG files with numbers (recommended)</li>
            <li><strong>rooms/png/</strong> - ${rooms.length} room PNG files (plain)</li>
            <li><strong>restaurant/svg/</strong> - ${restaurantTables.length} restaurant table SVG files with numbers</li>
            <li><strong>restaurant/png/</strong> - ${restaurantTables.length} restaurant table PNG files</li>
            <li><strong>garden/svg/</strong> - ${gardenTables.length} garden table SVG files with numbers</li>
            <li><strong>garden/png/</strong> - ${gardenTables.length} garden table PNG files</li>
        </ul>
        <p><strong>📊 Recommended:</strong> Use the SVG files for printing - they include the room/table numbers in the center!</p>
        <p><strong>🖼️ Alternative:</strong> Use PNG files if needed, but you'll need to manually add the numbers when printing.</p>
    </div>

    <div class="section">
        <h2>🏨 Hotel Rooms</h2>
        <div class="grid">
            ${rooms.map(room => `
                <div class="item">
                    <a href="rooms/room-${room.roomNumber}.html" target="_blank">
                        <div class="item-number">${room.displayNumber}</div>
                        <div class="item-type">${room.roomName}</div>
                    </a>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>🍽️ Restaurant Tables</h2>
        <div class="grid">
            ${restaurantTables.map(table => `
                <div class="item">
                    <a href="restaurant/restaurant-table-${table.displayNumber}.html" target="_blank">
                        <div class="item-number">${table.displayNumber}</div>
                        <div class="item-type">${table.tableName}</div>
                    </a>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>🌿 Garden Tables</h2>
        <div class="grid">
            ${gardenTables.map(table => `
                <div class="item">
                    <a href="garden/garden-table-${table.displayNumber}.html" target="_blank">
                        <div class="item-number">${table.displayNumber}</div>
                        <div class="item-type">${table.tableName}</div>
                    </a>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>📋 Instructions</h2>
        <ol>
            <li>Click on any room/table number above to open its QR code page</li>
            <li>Each page shows both SVG (with numbers) and PNG (plain) download options</li>
            <li><strong>Recommended:</strong> Download the SVG files for best printing quality</li>
            <li>Use your browser's print function (Ctrl+P or Cmd+P) to print</li>
            <li>Cut out the QR codes and place them in the corresponding locations</li>
            <li>QR codes link to: <code>https://menu.theplazahoteledirne.com</code></li>
            <li>Each QR code contains a unique token for access control</li>
        </ol>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(outputDir, 'summary.html'), summaryHTML, 'utf8');
    console.log('  ✅ Summary: summary.html');

    console.log('\n🎉 QR code generation complete!');
    console.log(`📂 Output directory: ${outputDir}`);
    console.log(`📊 Generated ${allItems.length} QR codes total:`);
    console.log(`   - ${rooms.length} hotel rooms`);
    console.log(`   - ${restaurantTables.length} restaurant tables`);
    console.log(`   - ${gardenTables.length} garden tables`);
    console.log('\n📋 Next steps:');
    console.log('1. Open summary.html to see all generated QR codes');
    console.log('2. Click on each room/table to open its QR code');
    console.log('3. Print each QR code page from your browser');
    console.log('4. Place QR codes in their respective locations');

  } catch (error) {
    console.error('❌ Error generating QR codes:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 