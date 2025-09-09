import smsService from '../services/smsService.js';

// In-memory session storage for demo purposes
// In production, you'd use Redis or a proper database
let ussdSessions = {};

// USSD menu structure
const USSD_MENUS = {
  MAIN: {
    text: "Karibu AgriConnect Tanzania\n1. Jisajili kama Mkulima\n2. Jisajili kama Mnunuzi\n3. Bei za Soko\n4. Hali ya Hewa\n5. Akaunti Yangu",
    options: ['1', '2', '3', '4', '5']
  },
  FARMER_REGISTER: {
    text: "Usajili wa Mkulima\n1. Ingiza Jina\n2. Ingiza Simu\n3. Ingiza Eneo\n4. Ingiza Aina ya Zao\n0. Rudi Kwenye Menu Kuu",
    options: ['1', '2', '3', '4', '0']
  },
  BUYER_REGISTER: {
    text: "Usajili wa Mnunuzi\n1. Ingiza Jina la Biashara\n2. Ingiza Simu\n3. Ingiza Eneo\n4. Ingiza Aina ya Biashara\n0. Rudi Kwenye Menu Kuu",
    options: ['1', '2', '3', '4', '0']
  },
  MARKET_PRICES: {
    text: "Bei za Soko (TSh kwa Kilo)\nMahindi: 1,200\nMchele: 2,500\nMaharage: 3,800\nNyanya: 1,800\nVitunguu: 2,200\n\n0. Rudi Kwenye Menu Kuu",
    options: ['0']
  },
  WEATHER: {
    text: "Hali ya Hewa\nLeo: Jua kali, 28°C\nKesho: Mawingu kidogo, 26°C\nWikendi: Mvua kidogo inatarajiwa\n\n0. Rudi Kwenye Menu Kuu",
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
      return 'END Usimamizi wa akaunti utakuja hivi karibuni. Asante kwa kutumia AgriConnect Tanzania!';
      
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
        return 'CON Ingiza jina lako kamili:';
      }
      return USSD_MENUS.FARMER_REGISTER.text;
      
    case 1:
      session.userData.name = userInput;
      session.step = 2;
      return 'CON Ingiza eneo lako (mfano: Arusha, Mwanza):';
      
    case 2:
      session.userData.location = userInput;
      session.step = 3;
      return 'CON Ingiza aina ya zao lako kuu (mfano: Mahindi, Mchele):';
      
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
        
        return `END Asante ${session.userData.name}! Umesajiliwa kama mkulima. Utapokea SMS za bei za soko na hali ya hewa.`;
      } catch (error) {
        console.error('Error registering farmer:', error);
        return 'END Usajili umeshindikana. Tafadhali jaribu tena baadaye.';
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
        return 'CON Ingiza jina la biashara yako:';
      }
      return USSD_MENUS.BUYER_REGISTER.text;
      
    case 1:
      session.userData.businessName = userInput;
      session.step = 2;
      return 'CON Ingiza eneo lako (mfano: Dar es Salaam, Dodoma):';
      
    case 2:
      session.userData.location = userInput;
      session.step = 3;
      return 'CON Ingiza aina ya biashara (Jumla/Rejareja):';
      
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
        
        return `END Asante! ${session.userData.businessName} imesajiliwa kama mnunuzi. Utapokea SMS za mazao yaliyopo.`;
      } catch (error) {
        console.error('Error registering buyer:', error);
        return 'END Usajili umeshindikana. Tafadhali jaribu tena baadaye.';
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