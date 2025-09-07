import smsService from '../services/smsService.js';

// In-memory session storage for demo purposes
// In production, you'd use Redis or a proper database
let ussdSessions = {};

// USSD menu structure
const USSD_MENUS = {
  MAIN: {
    text: "Welcome to AgriConnect\n1. Register as Farmer\n2. Register as Buyer\n3. Check Market Prices\n4. Weather Updates\n5. My Account",
    options: ['1', '2', '3', '4', '5']
  },
  FARMER_REGISTER: {
    text: "Farmer Registration\n1. Enter Name\n2. Enter Phone\n3. Enter Location\n4. Enter Crop Type\n0. Back to Main Menu",
    options: ['1', '2', '3', '4', '0']
  },
  BUYER_REGISTER: {
    text: "Buyer Registration\n1. Enter Business Name\n2. Enter Phone\n3. Enter Location\n4. Enter Business Type\n0. Back to Main Menu",
    options: ['1', '2', '3', '4', '0']
  },
  MARKET_PRICES: {
    text: "Market Prices (KES per KG)\nMaize: 50\nRice: 80\nBeans: 120\nTomatoes: 60\n\n0. Back to Main Menu",
    options: ['0']
  },
  WEATHER: {
    text: "Weather Update\nToday: Sunny, 25°C\nTomorrow: Partly cloudy, 23°C\nWeekend: Light rain expected\n\n0. Back to Main Menu",
    options: ['0']
  }
};

// Handle USSD requests
const handleUSSD = async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    
    console.log('USSD Request:', { sessionId, serviceCode, phoneNumber, text });
    
    // Initialize session if it doesn't exist
    if (!ussdSessions[sessionId]) {
      ussdSessions[sessionId] = {
        phoneNumber,
        currentMenu: 'MAIN',
        userData: {},
        step: 0
      };
    }
    
    const session = ussdSessions[sessionId];
    const userInput = text.split('*').pop(); // Get the last input
    
    let response = '';
    let continueSession = true;
    
    // Handle different menu states
    switch (session.currentMenu) {
      case 'MAIN':
        response = await handleMainMenu(userInput, session);
        break;
        
      case 'FARMER_REGISTER':
        response = await handleFarmerRegistration(userInput, session);
        break;
        
      case 'BUYER_REGISTER':
        response = await handleBuyerRegistration(userInput, session);
        break;
        
      case 'MARKET_PRICES':
        if (userInput === '0') {
          session.currentMenu = 'MAIN';
          response = USSD_MENUS.MAIN.text;
        } else {
          response = USSD_MENUS.MARKET_PRICES.text;
        }
        break;
        
      case 'WEATHER':
        if (userInput === '0') {
          session.currentMenu = 'MAIN';
          response = USSD_MENUS.MAIN.text;
        } else {
          response = USSD_MENUS.WEATHER.text;
        }
        break;
        
      default:
        response = USSD_MENUS.MAIN.text;
        session.currentMenu = 'MAIN';
    }
    
    // Check if session should end
    if (response.startsWith('END')) {
      delete ussdSessions[sessionId];
      continueSession = false;
    }
    
    // Format response for Africa's Talking
    const responseText = continueSession ? `CON ${response}` : response;
    
    res.set('Content-Type', 'text/plain');
    res.send(responseText);
    
  } catch (error) {
    console.error('USSD Error:', error);
    res.set('Content-Type', 'text/plain');
    res.send('END Sorry, there was an error processing your request. Please try again.');
  }
};

// Handle main menu navigation
const handleMainMenu = async (userInput, session) => {
  switch (userInput) {
    case '1':
      session.currentMenu = 'FARMER_REGISTER';
      session.step = 0;
      return USSD_MENUS.FARMER_REGISTER.text;
      
    case '2':
      session.currentMenu = 'BUYER_REGISTER';
      session.step = 0;
      return USSD_MENUS.BUYER_REGISTER.text;
      
    case '3':
      session.currentMenu = 'MARKET_PRICES';
      return USSD_MENUS.MARKET_PRICES.text;
      
    case '4':
      session.currentMenu = 'WEATHER';
      return USSD_MENUS.WEATHER.text;
      
    case '5':
      return 'END Account management coming soon. Thank you for using AgriConnect!';
      
    default:
      return USSD_MENUS.MAIN.text;
  }
};

// Handle farmer registration flow
const handleFarmerRegistration = async (userInput, session) => {
  if (userInput === '0') {
    session.currentMenu = 'MAIN';
    return USSD_MENUS.MAIN.text;
  }
  
  switch (session.step) {
    case 0:
      if (userInput === '1') {
        session.step = 1;
        return 'CON Enter your full name:';
      }
      return USSD_MENUS.FARMER_REGISTER.text;
      
    case 1:
      session.userData.name = userInput;
      session.step = 2;
      return 'CON Enter your location:';
      
    case 2:
      session.userData.location = userInput;
      session.step = 3;
      return 'CON Enter your main crop type:';
      
    case 3:
      session.userData.cropType = userInput;
      
      // Create farmer record (simplified)
      const farmerData = {
        name: session.userData.name,
        phone: session.phoneNumber,
        location: session.userData.location,
        cropType: session.userData.cropType
      };
      
      try {
        // In a real implementation, you'd save to database here
        console.log('New farmer registered:', farmerData);
        
        // Send welcome SMS
        await smsService.sendWelcomeSMS(session.phoneNumber, session.userData.name);
        
        return `END Thank you ${session.userData.name}! You have been registered as a farmer. You will receive SMS updates about market prices and weather.`;
      } catch (error) {
        console.error('Error registering farmer:', error);
        return 'END Registration failed. Please try again later.';
      }
      
    default:
      return USSD_MENUS.FARMER_REGISTER.text;
  }
};

// Handle buyer registration flow
const handleBuyerRegistration = async (userInput, session) => {
  if (userInput === '0') {
    session.currentMenu = 'MAIN';
    return USSD_MENUS.MAIN.text;
  }
  
  switch (session.step) {
    case 0:
      if (userInput === '1') {
        session.step = 1;
        return 'CON Enter your business name:';
      }
      return USSD_MENUS.BUYER_REGISTER.text;
      
    case 1:
      session.userData.businessName = userInput;
      session.step = 2;
      return 'CON Enter your location:';
      
    case 2:
      session.userData.location = userInput;
      session.step = 3;
      return 'CON Enter business type (Wholesale/Retail):';
      
    case 3:
      session.userData.businessType = userInput;
      
      // Create buyer record (simplified)
      const buyerData = {
        name: session.userData.businessName,
        phone: session.phoneNumber,
        location: session.userData.location,
        businessType: session.userData.businessType
      };
      
      try {
        // In a real implementation, you'd save to database here
        console.log('New buyer registered:', buyerData);
        
        // Send welcome SMS
        await smsService.sendBuyerWelcomeSMS(session.phoneNumber, session.userData.businessName);
        
        return `END Thank you! ${session.userData.businessName} has been registered as a buyer. You will receive SMS updates about crop availability.`;
      } catch (error) {
        console.error('Error registering buyer:', error);
        return 'END Registration failed. Please try again later.';
      }
      
    default:
      return USSD_MENUS.BUYER_REGISTER.text;
  }
};

// Get USSD session info (for debugging)
const getUSSDSessions = async (req, res) => {
  try {
    res.json({
      success: true,
      data: ussdSessions,
      count: Object.keys(ussdSessions).length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch USSD sessions',
      message: error.message
    });
  }
};

// Clear USSD sessions (for debugging)
const clearUSSDSessions = async (req, res) => {
  try {
    ussdSessions = {};
    res.json({
      success: true,
      message: 'All USSD sessions cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear USSD sessions',
      message: error.message
    });
  }
};

export default {
  handleUSSD,
  getUSSDSessions,
  clearUSSDSessions
};