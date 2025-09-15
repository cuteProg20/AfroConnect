import AfricasTalking from 'africastalking';


// Initialize Africa's Talking
const credentials = {
  apiKey: "atsk_000fdef23a19589d6d3b8678c9b267aa8064adc5b28d8e9b6f8ffc6925ec5137d9212048",
  username: "sandbox"
};

if (!credentials.apiKey || !credentials.username) {
  console.error('Africa\'s Talking credentials are missing. Please check your .env file.');
  console.error('Required variables: AFRICASTALKING_API_KEY, AFRICASTALKING_USERNAME');
}

const africastalking = AfricasTalking(credentials);
const sms = africastalking.SMS;

// Send SMS to a single recipient
const sendSMS = async (phoneNumber, message) => {
  try {
    const options = {
      to: phoneNumber,
      message: message,
      from: null // Use default sender ID
    };

    const result = await sms.send(options);
    console.log('SMS sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

// Send SMS to multiple recipients
const sendBulkSMS = async (phoneNumbers, message) => {
  try {
    const options = {
      to: phoneNumbers,
      message: message,
      from: null // Use default sender ID
    };

    const result = await sms.send(options);
    console.log('Bulk SMS sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    throw error;
  }
};

// Send welcome SMS to new farmer
const sendWelcomeSMS = async (phoneNumber, farmerName) => {
  const message = `Welcome to our farming platform, ${farmerName}! We're excited to help you with your farming journey. You'll receive updates about weather, market prices, and farming tips.`;
  
  return await sendSMS(phoneNumber, message);
};

// Send welcome SMS to new buyer
const sendBuyerWelcomeSMS = async (phoneNumber, buyerName) => {
  const message = `Welcome to our agricultural marketplace, ${buyerName}! We're excited to connect you with quality farmers and fresh produce. You'll receive updates about available crops and market opportunities.`;
  
  return await sendSMS(phoneNumber, message);
};

// Send weather alert
const sendWeatherAlert = async (phoneNumbers, weatherInfo) => {
  const message = `Weather Alert: ${weatherInfo}. Please take necessary precautions for your crops.`;
  
  return await sendBulkSMS(phoneNumbers, message);
};

// Send market price update
const sendMarketPriceUpdate = async (phoneNumbers, priceInfo) => {
  const message = `Market Update: ${priceInfo}. Plan your sales accordingly.`;
  
  return await sendBulkSMS(phoneNumbers, message);
};

// Send crop availability alert to buyers
const sendCropAvailabilityAlert = async (phoneNumbers, cropInfo) => {
  const message = `New Crop Available: ${cropInfo}. Contact us to place your order.`;
  
  return await sendBulkSMS(phoneNumbers, message);
};

export default {
  sendSMS,
  sendBulkSMS,
  sendWelcomeSMS,
  sendBuyerWelcomeSMS,
  sendWeatherAlert,
  sendMarketPriceUpdate,
  sendCropAvailabilityAlert
};