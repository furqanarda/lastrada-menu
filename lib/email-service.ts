import nodemailer from 'nodemailer';
import { formatPrice, formatDate } from './utils';

// Import shared translation system
const { getTranslations, t: translateKey } = require('./translations');

// Language type and translation data
type Language = "en" | "tr" | "el" | "bg";

// Load translations from the existing files
const translations = getTranslations();

// Translation function
const t = (key: string, language: Language): string => {
  return translateKey(key, language, translations);
};

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

interface OrderItem {
  id: string;
  nameKey: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface OrderData {
  orderNumber: string;
  orderTime: string;
  locationInfo: string;
  customerEmail?: string;
  customerLanguage?: Language; // Add customer language preference
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
}

// Function to get item name from nameKey for a specific language
const getItemDisplayName = (nameKey: string, language: Language): string => {
  // Try to get translated name from the translation data
  const translatedName = translations[language]?.[nameKey];
  if (translatedName) {
    return translatedName;
  }
  
  // Fallback: format the nameKey to a readable name
  return nameKey.replace(/^item\..*?\./, '').replace(/\.name$/, '').replace(/[-_]/g, ' ');
};

// Generate hotel notification email HTML (Always in Turkish)
const generateHotelEmailHTML = (orderData: OrderData): string => {
  const language = 'tr'; // Always Turkish for hotel
  
  const itemsHTML = orderData.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}x</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${getItemDisplayName(item.nameKey, language)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
      ${item.notes ? `<tr><td colspan="3" style="padding: 4px 8px; font-style: italic; color: #666; border-bottom: 1px solid #eee;">${t('email.note', language)}: ${item.notes}</td></tr>` : ''}
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t('email.newOrderReceived', language)} - ${orderData.orderNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin: 0 0 10px 0;">${t('email.newOrderReceived', language)}</h1>
        <p style="margin: 0; color: #666;">${t('email.orderManagementSystem', language)}</p>
      </div>
      
      <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #34495e; margin-top: 0;">${t('email.orderDetails', language)}</h2>
        <table style="width: 100%; margin-bottom: 15px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">${t('email.orderNumber', language)}:</td>
            <td style="padding: 8px 0;">${orderData.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">${t('email.orderTime', language)}:</td>
            <td style="padding: 8px 0;">${formatDate(new Date(orderData.orderTime))}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">${t('email.location', language)}:</td>
            <td style="padding: 8px 0;">${orderData.locationInfo}</td>
          </tr>
          ${orderData.customerEmail ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">${t('email.customerEmail', language)}:</td>
            <td style="padding: 8px 0;">${orderData.customerEmail}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #34495e; margin-top: 0;">${t('email.orderItems', language)}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">${t('email.qty', language)}</th>
              <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">${t('email.item', language)}</th>
              <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">${t('email.price', language)}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr style="background: #f8f9fa; font-weight: bold;">
              <td colspan="2" style="padding: 12px 8px; border-top: 2px solid #ddd;">${t('email.total', language)}</td>
              <td style="padding: 12px 8px; text-align: right; border-top: 2px solid #ddd;">${formatPrice(orderData.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="background: #e8f5e8; border: 1px solid #d4edda; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; color: #155724;">
          <strong>${t('email.actionRequired', language)}</strong> ${t('email.prepareOrderMessage', language).replace('{location}', orderData.locationInfo)}
        </p>
      </div>

      <div style="text-align: center; color: #666; font-size: 14px;">
        <p>${t('email.autoGeneratedMessage', language)}</p>
        <p>${HOTEL_NAME}</p>
      </div>
    </body>
    </html>
  `;
};

// Generate customer confirmation email HTML (In customer's preferred language)
const generateCustomerEmailHTML = (orderData: OrderData): string => {
  const language = orderData.customerLanguage || 'en'; // Default to English if not specified
  
  const itemsHTML = orderData.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}x</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${getItemDisplayName(item.nameKey, language)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
      ${item.notes ? `<tr><td colspan="3" style="padding: 4px 8px; font-style: italic; color: #666; border-bottom: 1px solid #eee;">${t('email.note', language)}: ${item.notes}</td></tr>` : ''}
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t('email.orderConfirmation', language)} - ${orderData.orderNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin: 0 0 10px 0;">${t('email.orderConfirmation', language)}</h1>
        <p style="margin: 0; color: #666;">${t('email.thankYouMessage', language)}</p>
      </div>
      
      <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #34495e; margin-top: 0;">${t('email.yourOrderDetails', language)}</h2>
        <table style="width: 100%; margin-bottom: 15px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">${t('email.orderNumber', language)}:</td>
            <td style="padding: 8px 0;">${orderData.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">${t('email.orderTime', language)}:</td>
            <td style="padding: 8px 0;">${formatDate(new Date(orderData.orderTime))}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">${t('email.deliveryLocation', language)}:</td>
            <td style="padding: 8px 0;">${orderData.locationInfo}</td>
          </tr>
        </table>
      </div>

      <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #34495e; margin-top: 0;">${t('email.orderSummary', language)}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">${t('email.qty', language)}</th>
              <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">${t('email.item', language)}</th>
              <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">${t('email.price', language)}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr style="background: #f8f9fa; font-weight: bold;">
              <td colspan="2" style="padding: 12px 8px; border-top: 2px solid #ddd;">${t('email.total', language)}</td>
              <td style="padding: 12px 8px; text-align: right; border-top: 2px solid #ddd;">${formatPrice(orderData.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; color: #1565c0;">
          <strong>${t('email.estimatedTime', language)}</strong> ${t('email.estimatedTimeValue', language)}<br>
          <strong>${t('email.deliveryLocationLabel', language)}</strong> ${orderData.locationInfo}
        </p>
      </div>

      <div style="text-align: center; color: #666; font-size: 14px;">
        <p>${t('email.thankYouFooter', language)}</p>
        <p>${t('email.contactMessage', language)}</p>
        <p>${HOTEL_NAME}</p>
      </div>
    </body>
    </html>
  `;
};

// Main function to send order notification emails
export const sendOrderNotificationEmails = async (orderData: OrderData): Promise<{success: boolean, error?: string}> => {
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
      error: error instanceof Error ? error.message : 'Unknown email error' 
    };
  }
}; 