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
                <div style="color: #f1f5f9; font-size: 16px; font-weight: 600;">${formatDate(new Date(orderData.orderTime))}</div>
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
const generateCustomerEmailHTML = (orderData: OrderData): string => {
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
                <div style="color: #f1f5f9; font-size: 16px; font-weight: 600;">${formatDate(new Date(orderData.orderTime))}</div>
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