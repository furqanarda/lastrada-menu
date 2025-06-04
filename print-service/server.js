require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');
const nodemailer = require('nodemailer');
const cors = require('cors');

// Import shared translation system
const { getTranslations, t: translateKey } = require('../lib/translations');

// Load translations from the existing files
const translations = getTranslations();

// Translation function
const t = (key, language) => {
  return translateKey(key, language, translations);
};

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

// Email configuration for Google SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'info@theplazahoteledirne.com',
      pass: process.env.EMAIL_PASS || '', // This should be set in environment variables
    },
  });
};

// Hotel email configuration
const HOTEL_EMAIL = 'info@theplazahoteledirne.com';
const HOTEL_NAME = 'La Strada Restaurant - The Plaza Hotel Edirne';

// Function to format price for emails
const formatPrice = (price) => {
  return price.toFixed(2) + ' TL';
};

// Function to format date for emails
const formatDate = (date) => {
  return new Date(date).toLocaleString('tr-TR');
};

// Function to get item name from nameKey for a specific language
const getItemDisplayName = (nameKey, language) => {
  // Try to get translated name from the translation data
  const translatedName = translations[language]?.[nameKey];
  if (translatedName) {
    return translatedName;
  }
  
  // Fallback: format the nameKey to a readable name
  return nameKey.replace(/^item\..*?\./, '').replace(/\.name$/, '').replace(/[-_]/g, ' ');
};

// Generate hotel notification email HTML (Always in Turkish)
const generateHotelEmailHTML = (orderData) => {
  const language = 'tr'; // Always Turkish for hotel
  
  const itemsHTML = orderData.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px 12px; border-bottom: 1px solid #334155; color: #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="background: #3b82f6; color: white; border-radius: 50%; width: 32px; height: 32px; min-width: 32px; max-width: 32px; flex-shrink: 0; display: table-cell; vertical-align: middle; text-align: center; font-weight: bold; font-size: 14px; line-height: 32px;">
              ${item.quantity}
            </div>
            <div>
              <div style="font-weight: 600; color: #f1f5f9; margin-bottom: 2px;">${getItemDisplayName(item.nameKey, language)}</div>
              ${item.notes ? `<div style="font-size: 12px; color: #94a3b8; font-style: italic;">📝 ${item.notes}</div>` : ''}
            </div>
          </div>
        </td>
        <td style="padding: 16px 12px; border-bottom: 1px solid #334155; text-align: right; color: #f1f5f9; font-weight: 600; font-size: 16px;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t('email.newOrderReceived', language)} - ${orderData.orderNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', Arial, sans-serif; }
      </style>
    </head>
    <body style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); margin: 0; padding: 20px; min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); overflow: hidden; border: 1px solid #334155;">
        
        <!-- Header with Logo and Branding -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px; text-align: center; border-bottom: 1px solid #334155;">
          <div style="margin-bottom: 20px;">
            <img src="https://menu.theplazahoteledirne.com/images/logo.png" alt="La Strada Restaurant" style="height: 60px; width: auto; display: block; margin: 0 auto;">
          </div>
          <h1 style="color: #f1f5f9; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🍽️ ${t('email.newOrderReceived', language)}
          </h1>
          <p style="color: #94a3b8; font-size: 16px; margin: 0; font-weight: 500;">
            ${t('email.orderManagementSystem', language)}
          </p>
        </div>

        <!-- Order Info Card -->
        <div style="padding: 32px; background: #1e293b;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1a202c 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155;">
            <h2 style="color: #3b82f6; font-size: 20px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center; gap: 8px;">
              📋 ${t('email.orderDetails', language)}
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
              <div style="background: #334155; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <div style="color: #94a3b8; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">${t('email.orderNumber', language)}</div>
                <div style="color: #f1f5f9; font-size: 18px; font-weight: 600;">${orderData.orderNumber}</div>
              </div>
              <div style="background: #334155; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981;">
                <div style="color: #94a3b8; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">${t('email.orderTime', language)}</div>
                <div style="color: #f1f5f9; font-size: 16px; font-weight: 600;">${formatDate(orderData.orderTime)}</div>
              </div>
              <div style="background: #334155; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <div style="color: #94a3b8; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">${t('email.location', language)}</div>
                <div style="color: #f1f5f9; font-size: 16px; font-weight: 600;">📍 ${orderData.locationInfo}</div>
              </div>
              ${orderData.customerEmail ? `
              <div style="background: #334155; padding: 16px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                <div style="color: #94a3b8; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">${t('email.customerEmail', language)}</div>
                <div style="color: #f1f5f9; font-size: 16px; font-weight: 600;">✉️ ${orderData.customerEmail}</div>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Order Items -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1a202c 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155;">
            <h2 style="color: #3b82f6; font-size: 20px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center; gap: 8px;">
              🛒 ${t('email.orderItems', language)}
            </h2>
            <div style="background: #1e293b; border-radius: 8px; overflow: hidden; border: 1px solid #334155;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #334155 0%, #475569 100%);">
                    <th style="padding: 16px 12px; text-align: left; color: #f1f5f9; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${t('email.item', language)}</th>
                    <th style="padding: 16px 12px; text-align: right; color: #f1f5f9; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${t('email.price', language)}</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
                <tfoot>
                  <tr style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                    <td style="padding: 20px 12px; font-weight: 700; font-size: 18px; color: white; text-transform: uppercase; letter-spacing: 0.5px;">
                      💰 ${t('email.total', language)}
                    </td>
                    <td style="padding: 20px 12px; text-align: right; font-weight: 700; font-size: 20px; color: white;">
                      ${formatPrice(orderData.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Action Required -->
          <div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #10b981;">
            <div style="display: flex; align-items: flex-start; gap: 16px;">
              <div style="background: rgba(255,255,255,0.2); border-radius: 50%; padding: 8px; flex-shrink: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <div style="font-size: 20px; line-height: 1;">⚡</div>
              </div>
              <div>
                <h3 style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">
                  ${t('email.actionRequired', language)}
                </h3>
                <p style="color: #d1fae5; margin: 0; font-size: 16px; line-height: 1.6;">
                  ${t('email.prepareOrderMessage', language).replace('{location}', orderData.locationInfo)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #0f172a; padding: 24px; text-align: center; border-top: 1px solid #334155;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
            ${t('email.autoGeneratedMessage', language)}
          </p>
          <p style="color: #94a3b8; font-size: 16px; font-weight: 600; margin: 0;">
            ${HOTEL_NAME}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate customer confirmation email HTML (In customer's preferred language)
const generateCustomerEmailHTML = (orderData) => {
  const language = orderData.customerLanguage || 'en'; // Default to English if not specified
  
  const itemsHTML = orderData.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px 12px; border-bottom: 1px solid #334155; color: #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="background: #3b82f6; color: white; border-radius: 50%; width: 32px; height: 32px; min-width: 32px; max-width: 32px; flex-shrink: 0; display: table-cell; vertical-align: middle; text-align: center; font-weight: bold; font-size: 14px; line-height: 32px;">
              ${item.quantity}
            </div>
            <div>
              <div style="font-weight: 600; color: #f1f5f9; margin-bottom: 2px;">${getItemDisplayName(item.nameKey, language)}</div>
              ${item.notes ? `<div style="font-size: 12px; color: #94a3b8; font-style: italic;">📝 ${item.notes}</div>` : ''}
            </div>
          </div>
        </td>
        <td style="padding: 16px 12px; border-bottom: 1px solid #334155; text-align: right; color: #f1f5f9; font-weight: 600; font-size: 16px;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t('email.orderConfirmation', language)} - ${orderData.orderNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', Arial, sans-serif; }
      </style>
    </head>
    <body style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); margin: 0; padding: 20px; min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); overflow: hidden; border: 1px solid #334155;">
        
        <!-- Header with Logo and Branding -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px; text-align: center; border-bottom: 1px solid #334155;">
          <div style="margin-bottom: 20px;">
            <img src="https://menu.theplazahoteledirne.com/images/logo.png" alt="La Strada Restaurant" style="height: 60px; width: auto; display: block; margin: 0 auto;">
          </div>
          <h1 style="color: #f1f5f9; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ✅ ${t('email.orderConfirmation', language)}
          </h1>
          <p style="color: #94a3b8; font-size: 16px; margin: 0; font-weight: 500;">
            ${t('email.thankYouMessage', language)}
          </p>
        </div>

        <!-- Order Info Card -->
        <div style="padding: 32px; background: #1e293b;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1a202c 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155;">
            <h2 style="color: #3b82f6; font-size: 20px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center; gap: 8px;">
              📋 ${t('email.yourOrderDetails', language)}
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
              <div style="background: #334155; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <div style="color: #94a3b8; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">${t('email.orderNumber', language)}</div>
                <div style="color: #f1f5f9; font-size: 18px; font-weight: 600;">${orderData.orderNumber}</div>
              </div>
              <div style="background: #334155; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981;">
                <div style="color: #94a3b8; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">${t('email.orderTime', language)}</div>
                <div style="color: #f1f5f9; font-size: 16px; font-weight: 600;">${formatDate(orderData.orderTime)}</div>
              </div>
              <div style="background: #334155; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <div style="color: #94a3b8; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">${t('email.deliveryLocation', language)}</div>
                <div style="color: #f1f5f9; font-size: 16px; font-weight: 600;">📍 ${orderData.locationInfo}</div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1a202c 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155;">
            <h2 style="color: #3b82f6; font-size: 20px; font-weight: 600; margin: 0 0 20px 0; display: flex; align-items: center; gap: 8px;">
              🛒 ${t('email.orderSummary', language)}
            </h2>
            <div style="background: #1e293b; border-radius: 8px; overflow: hidden; border: 1px solid #334155;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #334155 0%, #475569 100%);">
                    <th style="padding: 16px 12px; text-align: left; color: #f1f5f9; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${t('email.item', language)}</th>
                    <th style="padding: 16px 12px; text-align: right; color: #f1f5f9; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${t('email.price', language)}</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
                <tfoot>
                  <tr style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                    <td style="padding: 20px 12px; font-weight: 700; font-size: 18px; color: white; text-transform: uppercase; letter-spacing: 0.5px;">
                      💰 ${t('email.total', language)}
                    </td>
                    <td style="padding: 20px 12px; text-align: right; font-weight: 700; font-size: 20px; color: white;">
                      ${formatPrice(orderData.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Delivery Info -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #60a5fa;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; align-items: center;">
              <div>
                <h3 style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 12px 0; display: flex; align-items: center; gap: 12px;">
                  🕐 ${t('email.estimatedTime', language)}
                </h3>
                <p style="color: #dbeafe; margin: 0; font-size: 16px; font-weight: 500;">
                  ${t('email.estimatedTimeValue', language)}
                </p>
              </div>
              <div>
                <h3 style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 12px 0; display: flex; align-items: center; gap: 12px;">
                  📍 ${t('email.deliveryLocationLabel', language)}
                </h3>
                <p style="color: #dbeafe; margin: 0; font-size: 16px; font-weight: 500;">
                  ${orderData.locationInfo}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #0f172a; padding: 32px; text-align: center; border-top: 1px solid #334155;">
          <div style="margin-bottom: 16px;">
            <h3 style="color: #3b82f6; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">
              ${t('email.thankYouFooter', language)}
            </h3>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              ${t('email.contactMessage', language)}
            </p>
          </div>
          <div style="padding-top: 16px; border-top: 1px solid #334155;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">
              ${t('email.autoGeneratedMessage', language)}
            </p>
            <p style="color: #94a3b8; font-size: 14px; font-weight: 600; margin: 0;">
              ${HOTEL_NAME}
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Function to send order notification emails
const sendOrderNotificationEmails = async (orderData) => {
  try {
    const transporter = createTransporter();

    // Always send email to hotel in Turkish
    const hotelEmailOptions = {
      from: `"${HOTEL_NAME}" <${HOTEL_EMAIL}>`,
      to: HOTEL_EMAIL,
      subject: `${t('email.newOrderReceived', 'tr')}: ${orderData.orderNumber} - ${orderData.locationInfo}`,
      html: generateHotelEmailHTML(orderData),
    };

    // Send hotel notification
    await transporter.sendMail(hotelEmailOptions);
    console.log(`Hotel notification email sent in Turkish for order ${orderData.orderNumber}`);

    // Send customer confirmation if email provided (in their preferred language)
    if (orderData.customerEmail && orderData.customerEmail.trim()) {
      const customerLanguage = orderData.customerLanguage || 'en';
      const customerEmailOptions = {
        from: `"${HOTEL_NAME}" <${HOTEL_EMAIL}>`,
        to: orderData.customerEmail.trim(),
        subject: `${t('email.orderConfirmation', customerLanguage)}: ${orderData.orderNumber} - La Strada Restaurant`,
        html: generateCustomerEmailHTML(orderData),
      };

      await transporter.sendMail(customerEmailOptions);
      console.log(`Customer confirmation email sent in ${customerLanguage} to ${orderData.customerEmail} for order ${orderData.orderNumber}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending order notification emails:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown email error' 
    };
  }
};

async function printReceipt(printerIp, printerPort, orderData, locationInfo) {
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
    printer.println(latinizeText(`Oda/Masa: ${locationInfo}`));
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
    
    // Single long beep (approximately 3 seconds)
    // Method 1: Built-in beep method
    printer.beep();
    
    // Method 2: Single long beep with maximum duration
    // ESC (27) + B (66) + number_of_beeps (1) + beep_duration (9 - maximum for longest single beep)
    const longBeepCommand = Buffer.from([27, 66, 1, 9]);
    const currentBuffer = printer.getBuffer();
    const newBuffer = Buffer.concat([currentBuffer, longBeepCommand]);
    printer.setBuffer(newBuffer);
    
    // Method 3: Additional long beep commands to extend duration to ~3 seconds
    // Some printers have limited single beep duration, so we chain single long beeps
    const extendedBeep1 = Buffer.from([27, 66, 1, 9]);
    const extendedBeep2 = Buffer.from([27, 66, 1, 9]);
    const finalBuffer = Buffer.concat([newBuffer, extendedBeep1, extendedBeep2]);
    printer.setBuffer(finalBuffer);
    
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

  // Support both old and new location field names for compatibility
  const locationInfo = orderData.locationInfo || orderData.roomOrTableNumber;

  if (!orderData.orderNumber || !orderData.items || !locationInfo) {
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
    const success = await printReceipt(ip, PRINTER_PORT, orderData, locationInfo);
    printResults.push({ printer: ip, success });
    if (!success) {
      allPrintsSuccessful = false;
    }
    if (printerIPs.indexOf(ip) < printerIPs.length - 1) { // Don't delay after the last printer
      console.log(`Delaying for 3 seconds before next print attempt...`);
      await delay(3000); // 3-second delay
    }
  }

  // Send email notifications (always send regardless of print success/failure)
  console.log('Sending email notifications for order:', orderData.orderNumber);
  try {
    const emailResult = await sendOrderNotificationEmails(orderData);
    if (emailResult.success) {
      console.log('Email notifications sent successfully');
    } else {
      console.error('Failed to send email notifications:', emailResult.error);
    }
  } catch (emailError) {
    console.error('Error sending email notifications:', emailError);
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