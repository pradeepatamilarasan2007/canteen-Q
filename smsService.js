require('dotenv').config();
const twilio = require('twilio');

/**
 * Normalizes and validates a phone number into E.164 format.
 * Defaults to DEFAULT_COUNTRY_CODE (e.g., +91 for India) if no country code is present.
 * 
 * @param {string} rawPhone - The input phone number from customer
 * @param {string} [defaultCountryCode='+91'] - Default country code
 * @returns {{ isValid: boolean, formatted: string, error?: string }}
 */
function normalizePhoneNumber(rawPhone, defaultCountryCode = process.env.DEFAULT_COUNTRY_CODE || '+91') {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      formatted: '',
      error: 'Phone number is missing or empty'
    };
  }

  // Trim whitespace
  let cleaned = rawPhone.trim();

  // If already starts with '+', remove spaces, dashes, parentheses
  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.replace(/[^\d+]/g, '');
    // E.164 pattern: '+' followed by 8 to 15 digits
    if (/^\+[1-9]\d{7,14}$/.test(digitsOnly)) {
      return { isValid: true, formatted: digitsOnly };
    } else {
      return {
        isValid: false,
        formatted: digitsOnly,
        error: `Invalid international E.164 phone number format: "${rawPhone}"`
      };
    }
  }

  // Remove all non-digits
  const digits = cleaned.replace(/\D/g, '');

  // Common case: 10-digit mobile number (e.g. 9876543210 in India or USA)
  if (digits.length === 10) {
    const normalizedPrefix = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    return {
      isValid: true,
      formatted: `${normalizedPrefix}${digits}`
    };
  }

  // 11 digits starting with 0 (e.g. 09876543210)
  if (digits.length === 11 && digits.startsWith('0')) {
    const normalizedPrefix = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    return {
      isValid: true,
      formatted: `${normalizedPrefix}${digits.substring(1)}`
    };
  }

  // 12 digits starting with 91 (e.g. 919876543210)
  if (digits.length === 12 && digits.startsWith('91')) {
    return {
      isValid: true,
      formatted: `+${digits}`
    };
  }

  // If 11-15 digits, could be direct country code + number without '+'
  if (digits.length >= 11 && digits.length <= 15) {
    return {
      isValid: true,
      formatted: `+${digits}`
    };
  }

  return {
    isValid: false,
    formatted: cleaned,
    error: `Phone number "${rawPhone}" must contain at least 10 digits.`
  };
}

/**
 * Checks whether Twilio credentials are fully configured.
 * @returns {{ isConfigured: boolean, missing: string[] }}
 */
function getGatewayConfigStatus() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID;

  const missing = [];
  if (!accountSid || accountSid.trim() === '' || accountSid.includes('your_') || accountSid.includes('ACxxxx')) {
    missing.push('TWILIO_ACCOUNT_SID');
  }
  if (!authToken || authToken.trim() === '' || authToken.includes('your_') || authToken.includes('xxxx')) {
    missing.push('TWILIO_AUTH_TOKEN');
  }
  if (!fromNumber || fromNumber.trim() === '' || fromNumber.includes('your_') || fromNumber.includes('+1xxxx')) {
    missing.push('TWILIO_PHONE_NUMBER / TWILIO_MESSAGING_SERVICE_SID');
  }

  return {
    isConfigured: missing.length === 0,
    missing,
    provider: 'Twilio',
    fromNumber: fromNumber || null
  };
}

/**
 * Sends food ready SMS to the customer via Twilio SMS Gateway.
 * 
 * @param {Object} params
 * @param {string} params.orderId - Unique Order ID (e.g., ord_102)
 * @param {string} [params.tokenNumber] - Pickup token (e.g., CQ025)
 * @param {string} [params.customerName] - Customer name
 * @param {string} params.phone - Customer's registered phone number
 * @returns {Promise<{ success: boolean, messageId?: string, status?: string, recipient?: string, error?: string, notConfigured?: boolean, code?: number|string }>}
 */
async function sendFoodReadySMS({ orderId, tokenNumber, customerName, phone }) {
  const orderRef = tokenNumber || orderId || 'Order';
  const customerGreeting = customerName ? `Hello ${customerName}!` : 'Hello!';
  const messageBody = `Hello! Your CanteenQ order #${orderRef} is ready for collection. Please collect your food from the canteen. Thank you!`;

  console.log('----------------------------------------------------');
  console.log(`[SMS Service] Processing notification for Order #${orderRef}`);
  console.log(`[SMS Service] Target Customer: ${customerName || 'Customer'} (${phone})`);

  // 1. Validate and normalize the phone number
  const phoneValidation = normalizePhoneNumber(phone);
  if (!phoneValidation.isValid) {
    const errorMsg = `Phone validation failed: ${phoneValidation.error}`;
    console.warn(`[SMS Service Warning] ${errorMsg}`);
    console.log('----------------------------------------------------');
    return {
      success: false,
      recipient: phone,
      error: errorMsg,
      code: 'INVALID_PHONE_NUMBER'
    };
  }

  const recipient = phoneValidation.formatted;
  console.log(`[SMS Service] Normalized E.164 Recipient: ${recipient}`);

  // 2. Check Twilio gateway credentials
  const config = getGatewayConfigStatus();
  if (!config.isConfigured) {
    const warnMsg = `Twilio credentials not configured. Missing: ${config.missing.join(', ')}`;
    console.warn(`[SMS Gateway Warning] ${warnMsg}`);
    console.log(`[SMS Service Mock/Dry-Run] Message would be: "${messageBody}"`);
    console.log(`[SMS Service Guide] To send real SMS to ${recipient}, please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your .env file.`);
    console.log('----------------------------------------------------');
    return {
      success: false,
      notConfigured: true,
      recipient,
      messageText: messageBody,
      error: warnMsg,
      code: 'GATEWAY_CREDENTIALS_MISSING'
    };
  }

  // 3. Dispatch SMS using Twilio Client
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const sendOptions = {
      body: messageBody,
      to: recipient
    };

    if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
      sendOptions.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    } else {
      sendOptions.from = process.env.TWILIO_PHONE_NUMBER;
    }

    console.log(`[SMS Dispatch] Sending SMS via Twilio to ${recipient}...`);
    let twilioResponse;
    let deliveredViaTrialTemplate = false;

    try {
      twilioResponse = await client.messages.create(sendOptions);
    } catch (createErr) {
      // Handle Twilio Trial Account restriction (Code 572006: Predefined templates only)
      if (createErr.code === 572006) {
        console.warn(`[SMS Service Notice] Twilio Trial account detected (Code 572006).`);
        console.warn(`[SMS Service Notice] Falling back to pre-approved trial template 'sms_delivery_updates' for live delivery.`);
        
        const trialSendOptions = { ...sendOptions, body: 'sms_delivery_updates' };
        twilioResponse = await client.messages.create(trialSendOptions);
        deliveredViaTrialTemplate = true;
      } else {
        throw createErr;
      }
    }

    console.log(`[SMS Gateway Success] Message queued with Twilio!`);
    console.log(`  - Twilio Message SID: ${twilioResponse.sid}`);
    console.log(`  - Status: ${twilioResponse.status}`);
    console.log(`  - Recipient: ${twilioResponse.to}`);
    console.log(`  - Date Sent / Created: ${twilioResponse.dateCreated}`);
    if (deliveredViaTrialTemplate) {
      console.log(`  - Delivered via Trial Template: sms_delivery_updates (Twilio Trial Account Mode)`);
    }
    console.log('----------------------------------------------------');

    return {
      success: true,
      messageId: twilioResponse.sid,
      status: twilioResponse.status,
      recipient: twilioResponse.to,
      messageText: deliveredViaTrialTemplate ? '[Twilio Trial Template: sms_delivery_updates]' : messageBody,
      isTrialTemplate: deliveredViaTrialTemplate
    };

  } catch (err) {
    console.error(`[SMS Gateway Error] Failed to send SMS via Twilio to ${recipient}:`);
    console.error(`  - Code: ${err.code || 'UNKNOWN'}`);
    console.error(`  - Message: ${err.message}`);
    if (err.moreInfo) console.error(`  - More Info: ${err.moreInfo}`);

    // Actionable debugging advice for common Twilio error codes
    if (err.code === 21608) {
      console.error(`  [DIAGNOSIS]: You are using a Twilio Trial Account. The number ${recipient} is not verified.`);
      console.error(`  [SOLUTION]: Add and verify ${recipient} at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified`);
    } else if (err.code === 21211) {
      console.error(`  [DIAGNOSIS]: Twilio reported this phone number is invalid.`);
      console.error(`  [SOLUTION]: Verify that the country code and mobile number format are correct.`);
    } else if (err.code === 20003) {
      console.error(`  [DIAGNOSIS]: Twilio Authentication Failed.`);
      console.error(`  [SOLUTION]: Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your .env file.`);
    } else if (err.code === 21606) {
      console.error(`  [DIAGNOSIS]: The TWILIO_PHONE_NUMBER is not owned by this Twilio account.`);
      console.error(`  [SOLUTION]: Copy the active Twilio number from your Twilio Console.`);
    }

    console.log('----------------------------------------------------');

    return {
      success: false,
      error: err.message,
      code: err.code || 'GATEWAY_ERROR',
      recipient
    };
  }
}

/**
 * Sends a generic or test SMS message.
 */
async function sendTestSMS({ phone, message }) {
  const phoneValidation = normalizePhoneNumber(phone);
  if (!phoneValidation.isValid) {
    return {
      success: false,
      error: phoneValidation.error,
      recipient: phone
    };
  }

  const recipient = phoneValidation.formatted;
  const config = getGatewayConfigStatus();
  if (!config.isConfigured) {
    return {
      success: false,
      notConfigured: true,
      recipient,
      error: `Twilio credentials not configured. Missing: ${config.missing.join(', ')}`
    };
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    let twilioResponse;
    let deliveredViaTrialTemplate = false;

    try {
      twilioResponse = await client.messages.create({
        body: message || "Hello! This is a test notification from CanteenQ SMS Gateway.",
        from: process.env.TWILIO_PHONE_NUMBER,
        to: recipient
      });
    } catch (createErr) {
      if (createErr.code === 572006) {
        console.warn(`[SMS Service Notice] Twilio Trial account detected (Code 572006) in test SMS. Using template 'sms_delivery_updates'.`);
        twilioResponse = await client.messages.create({
          body: 'sms_delivery_updates',
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient
        });
        deliveredViaTrialTemplate = true;
      } else {
        throw createErr;
      }
    }

    return {
      success: true,
      messageId: twilioResponse.sid,
      status: twilioResponse.status,
      recipient,
      isTrialTemplate: deliveredViaTrialTemplate
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      code: err.code,
      recipient
    };
  }
}

module.exports = {
  normalizePhoneNumber,
  getGatewayConfigStatus,
  sendFoodReadySMS,
  sendTestSMS
};
