const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

// Base URL for the view-only menu
const VIEW_ONLY_URL = 'https://menu.theplazahoteledirne.com';

/**
 * Generate QR code for view-only menu
 */
async function generateViewOnlyQR() {
  try {
    const outputDir = path.join(__dirname, '../qr-codes-output');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate QR code as PNG
    const filename = 'view-only-menu-qr.png';
    const filepath = path.join(outputDir, filename);
    
    await QRCode.toFile(filepath, VIEW_ONLY_URL, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log(`✅ View-only menu QR code generated: ${filename}`);
    console.log(`📱 URL: ${VIEW_ONLY_URL}`);
    console.log(`📁 File: ${filepath}`);

    // Also generate SVG version
    const svgFilename = 'view-only-menu-qr.svg';
    const svgFilepath = path.join(outputDir, svgFilename);
    
    const svgString = await QRCode.toString(VIEW_ONLY_URL, {
      type: 'svg',
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    fs.writeFileSync(svgFilepath, svgString);
    console.log(`✅ View-only menu QR code (SVG) generated: ${svgFilename}`);

    // Generate HTML file for easy printing
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View-Only Menu QR Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
            background: white;
        }
        .qr-container {
            border: 2px solid #333;
            padding: 20px;
            margin: 20px auto;
            max-width: 400px;
            background: white;
        }
        .qr-code {
            width: 300px;
            height: 300px;
            margin: 0 auto 20px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 20px;
        }
        .url {
            font-size: 12px;
            color: #888;
            font-family: monospace;
            word-break: break-all;
        }
        @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="qr-container">
        <div class="title">La Strada Restaurant</div>
        <div class="subtitle">View-Only Menu</div>
        <div class="qr-code">
            ${svgString}
        </div>
        <div class="url">${VIEW_ONLY_URL}</div>
    </div>
    
    <div class="no-print">
        <p><strong>Usage:</strong> This QR code allows guests to view the menu and prices without being able to place orders.</p>
        <p><strong>Perfect for:</strong> Reception desk, lobby areas, or anywhere you want to display menu information.</p>
        <button onclick="window.print()">🖨️ Print QR Code</button>
    </div>
</body>
</html>
    `;

    const htmlFilepath = path.join(outputDir, 'view-only-menu-qr.html');
    fs.writeFileSync(htmlFilepath, htmlContent);
    console.log(`✅ Printable HTML generated: view-only-menu-qr.html`);

    return {
      url: VIEW_ONLY_URL,
      pngFile: filepath,
      svgFile: svgFilepath,
      htmlFile: htmlFilepath
    };

  } catch (error) {
    console.error('❌ Error generating view-only QR code:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateViewOnlyQR()
    .then(() => {
      console.log('\n🎉 View-only menu QR code generation completed!');
      console.log('\n📋 Instructions:');
      console.log('1. Print the HTML file for reception desk');
      console.log('2. Use the PNG file for digital displays');
      console.log('3. Use the SVG file for high-quality printing');
    })
    .catch((error) => {
      console.error('Failed to generate view-only QR code:', error);
      process.exit(1);
    });
}

module.exports = { generateViewOnlyQR }; 