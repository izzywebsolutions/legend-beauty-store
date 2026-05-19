/**
 * WhatsApp Utility for Legend Beauty Store
 * Handles formatting and encoding of order messages
 */

export interface WhatsAppOrderDetails {
  customerName: string;
  location: string;
  notes?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    variantName?: string;
  }[];
  total: number;
}

/**
 * Generates a formatted WhatsApp message for an order
 */
export function generateWhatsAppMessage(details: WhatsAppOrderDetails): string {
  const timestamp = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });
  
  let message = `*NEW ORDER - LEGEND BEAUTY STORE*\n`;
  message += `_Date: ${timestamp}_\n\n`;
  
  message += `*Customer Details:*\n`;
  message += `• Name: ${details.customerName}\n`;
  message += `• Location: ${details.location}\n`;
  if (details.notes) {
    message += `• Notes: ${details.notes}\n`;
  }
  
  message += `\n*Order Summary:*\n`;
  details.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}${item.variantName ? ` (${item.variantName})` : ''}\n`;
    message += `   ${item.quantity}x @ ₦${item.price.toLocaleString()} = ₦${(item.price * item.quantity).toLocaleString()}\n`;
  });
  
  message += `\n*TOTAL: ₦${details.total.toLocaleString()}*\n\n`;
  message += `Is this order confirmed? Please reply YES to proceed.`;
  
  return message;
}

/**
 * Generates a simple message for a single product "Buy Now"
 */
export function generateQuickBuyMessage(productName: string, price: number, variantName?: string): string {
  let message = `*QUICK BUY - LEGEND BEAUTY STORE*\n\n`;
  message += `I'm interested in ordering:\n`;
  message += `• *${productName}*\n`;
  if (variantName) {
    message += `• Option: ${variantName}\n`;
  }
  message += `• Price: ₦${price.toLocaleString()}\n\n`;
  message += `Please let me know if this is available for delivery.`;
  
  return message;
}

/**
 * Opens WhatsApp with the given message
 */
export function openWhatsApp(phoneNumber: string, message: string) {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  window.open(url, '_blank');
}
