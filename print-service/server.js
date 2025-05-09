const express = require('express');
const fs = require('fs');
const path = require('path');
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');

const app = express();
const port = 3001;
const PRINTER_PORT = 9100;

// THIS SHOULD BE IN AN ENVIRONMENT VARIABLE IN PRODUCTION!
const EXPECTED_AUTH_TOKEN = "LA_STRADA_PRINT_SUPER_SECRET_TOKEN_123!";

// Function to convert Turkish characters to Latin equivalents
const latinizeText = (text) => {
  if (typeof text !== 'string') return text;
  return text
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/Ö/g, 'O')
    .replace(/Ü/g, 'U')
    .replace(/Ç/g, 'C')
    .replace(/Ğ/g, 'G')
    .replace(/Ş/g, 'S')
    .replace(/İ/g, 'I'); // Note: Turkish 'İ' (dotted capital I) becomes Latin 'I'
};

// Load Turkish translations
let translationsTR = {};
try {
  const trPath = path.join(__dirname, '..', 'locales', 'tr.json');
  const trFileContent = fs.readFileSync(trPath, 'utf-8');
  translationsTR = JSON.parse(trFileContent);
  console.log('Turkish translations loaded successfully.');
} catch (error) {
  console.error('Error loading Turkish translations:', error);
  // Service can still run, but printing will use nameKeys directly
}

const getTurkishTranslation = (nameKey) => {
  const translatedText = translationsTR[nameKey] || nameKey.split('.').pop().replace(/-/g, ' '); // Fallback
  return latinizeText(translatedText);
};

// Middleware to parse JSON bodies
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    console.warn('Auth Error: No token provided');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  if (token !== EXPECTED_AUTH_TOKEN) {
    console.warn('Auth Error: Invalid token');
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
  next(); // Token is valid
};

// TODO: Implement a more robust CORS policy for production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins for now
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

async function printReceipt(printerIp, printerPort, orderData) {
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON, // Assuming Palmx POS-80-IV is Epson compatible
    interface: `tcp://${printerIp}:${printerPort}`,
    characterSet: CharacterSet.PC850_MULTILINGUAL_LATIN1, // Changed character set
    removeSpecialCharacters: false,
    lineCharacter: '-',
    options:{
      timeout: 5000 // Keep a timeout for the execute attempt itself
    }
  });

  try {
    console.log(`Attempting to print to ${printerIp}:${printerPort} (connection via execute)`);

    printer.alignCenter();
    printer.bold(true);
    printer.println(latinizeText("LA STRADA RESTAURANT"));
    printer.bold(false);
    printer.newLine();
    printer.println(latinizeText(`Siparis No: ${orderData.orderNumber}`));
    printer.println(latinizeText(`Oda/Masa: ${orderData.roomOrTableNumber}`));
    printer.println(latinizeText(`Tarih: ${new Date(orderData.orderTime).toLocaleString('tr-TR')}`)); // Date formatting might still have Turkish month names if not handled by latinize
    printer.drawLine();

    orderData.items.forEach(item => {
      const itemNameInLatin = getTurkishTranslation(item.nameKey); // Already latinized by getTurkishTranslation
      printer.leftRight(`${item.quantity}x ${itemNameInLatin}`, item.price.toFixed(2));
      if (item.notes) {
        printer.println(latinizeText(`  Not: ${item.notes}`));
      }
    });
    printer.drawLine();

    printer.alignRight();
    // Ara Toplam and Vergi are not displayed as per previous user request, but if they were, they'd need latinizeText()
    // printer.println(latinizeText(`Ara Toplam: ${orderData.subtotal.toFixed(2)}`));
    // printer.println(latinizeText(`Vergi (%8): ${orderData.tax.toFixed(2)}`));
    printer.bold(true);
    printer.println(latinizeText(`TOPLAM: ${orderData.total.toFixed(2)} TL`));
    printer.bold(false);
    printer.newLine();
    printer.alignCenter();
    printer.println(latinizeText("Tesekkur Ederiz!"));
    printer.newLine();
    printer.cut();

    await printer.execute();
    console.log(`Print job for order ${orderData.orderNumber} sent to ${printerIp}:${printerPort}`);
    return true; // Indicate success for this printer
  } catch (error) {
    console.error(`Failed to print to ${printerIp}:${printerPort}:`, error);
    return false; // Indicate failure for this printer
  }
}

app.post('/print', authenticateToken, async (req, res) => {
  console.log('Received authenticated print request:', JSON.stringify(req.body, null, 2));
  const orderData = req.body;

  if (!orderData.orderNumber || !orderData.items || !orderData.roomOrTableNumber) {
    console.error('Missing order data in print request');
    return res.status(400).json({ message: 'Bad Request: Missing order data.' });
  }

  // TODO: Token validation logic

  const printerIPs = [
    '192.168.1.50', // Bar
    '192.168.1.51', // Kitchen
    '192.168.1.52'  // Reception
  ];

  let allPrintsSuccessful = true;
  let printResults = [];

  // Helper function for a delay
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  for (const ip of printerIPs) {
    console.log(`Attempting to print to ${ip}:${PRINTER_PORT}`);
    const success = await printReceipt(ip, PRINTER_PORT, orderData);
    printResults.push({ printer: ip, success });
    if (!success) {
      allPrintsSuccessful = false;
    }
    if (printerIPs.indexOf(ip) < printerIPs.length - 1) { // Don't delay after the last printer
      console.log(`Delaying for 3 seconds before next print attempt...`);
      await delay(3000); // 3-second delay
    }
  }

  if (allPrintsSuccessful) {
    res.status(200).json({ message: 'Print requests processed.', orderNumber: orderData.orderNumber, results: printResults });
  } else {
    // Even if some prints fail, we might still return 200 to the client, 
    // as the order itself is processed. The error is logged on the server.
    // Alternatively, return a 500 or a more specific error if critical.
    res.status(207).json({ 
        message: 'Some print requests failed. Check server logs.', 
        orderNumber: orderData.orderNumber, 
        results: printResults 
    });
  }
});

app.get('/', (req, res) => {
  res.send('Print Service is running. Use POST /print to send an order.');
});

app.listen(port, () => {
  console.log(`Print service listening at http://localhost:${port}`);
}); 