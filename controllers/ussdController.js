import smsService from '../services/smsService.js';

// In-memory session storage for demo purposes
// In production, you'd use Redis or a proper database
let ussdSessions = {};

// Sample data for demo
const sampleOrders = [
  { id: 1, farmerId: 1, buyerId: 1, crop: 'Mahindi', quantity: 100, status: 'pending', amount: 120000 },
  { id: 2, farmerId: 2, buyerId: 2, crop: 'Mchele', quantity: 50, status: 'completed', amount: 125000 }
];

const sampleTransactions = [
  { id: 1, type: 'sale', amount: 125000, date: '2024-01-15', description: 'Mchele sale' },
  { id: 2, type: 'purchase', amount: -50000, date: '2024-01-10', description: 'Fertilizer purchase' }
];

// Enhanced USSD menu structure
const USSD_MENUS = {
  MAIN: {
    text: "Karibu AgriConnect Tanzania\n1. Jisajili kama Mkulima\n2. Jisajili kama Mnunuzi\n3. Bei za Soko\n4. Oda za Biashara\n5. Akaunti Yangu\n6. Msaada",
    options: ['1', '2', '3', '4', '5', '6']
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
    text: "Bei za Soko (TSh kwa Kilo)\n1. Mahindi: 1,200\n2. Mchele: 2,500\n3. Maharage: 3,800\n4. Nyanya: 1,800\n5. Vitunguu: 2,200\n6. Karanga: 4,500\n\n0. Rudi Kwenye Menu Kuu",
    options: ['0', '1', '2', '3', '4', '5', '6']
  },
  ORDERS: {
    text: "Oda za Biashara\n1. Tengeneza Oda Mpya\n2. Angalia Oda Zangu\n3. Oda za Wakulima (Wanunuzi)\n4. Historia ya Oda\n0. Rudi Kwenye Menu Kuu",
    options: ['1', '2', '3', '4', '0']
  },
  ACCOUNT: {
    text: "Akaunti Yangu\n1. Salio la Akaunti\n2. Historia ya Miamala\n3. Taarifa za Kibinafsi\n4. Badilisha Nambari\n0. Rudi Kwenye Menu Kuu",
    options: ['1', '2', '3', '4', '0']
  },
  HELP: {
    text: "Msaada na Usaidizi\n1. Jinsi ya Kutumia Mfumo\n2. Bei za Huduma\n3. Wasiliana Nasi\n4. Matatizo ya Kawaida\n0. Rudi Kwenye Menu Kuu",
    options: ['1', '2', '3', '4', '0']
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
        step: 0,
        userType: null // 'farmer' or 'buyer'
      };
    }
    
    const session = ussdSessions[sessionId];
    const userInput = text.split('*').pop() || ''; // Get the last input
    
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
        response = await handleMarketPrices(userInput, session);
        break;
        
      case 'ORDERS':
        response = await handleOrders(userInput, session);
        break;
        
      case 'ACCOUNT':
        response = await handleAccount(userInput, session);
        break;
        
      case 'HELP':
        response = await handleHelp(userInput, session);
        break;
        
      case 'CREATE_ORDER':
        response = await handleCreateOrder(userInput, session);
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
    res.send('END Samahani, kumekuwa na hitilafu. Tafadhali jaribu tena.');
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
      session.currentMenu = 'ORDERS';
      return USSD_MENUS.ORDERS.text;
      
    case '5':
      session.currentMenu = 'ACCOUNT';
      return USSD_MENUS.ACCOUNT.text;
      
    case '6':
      session.currentMenu = 'HELP';
      return USSD_MENUS.HELP.text;
      
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
        return 'Ingiza jina lako kamili:';
      }
      return USSD_MENUS.FARMER_REGISTER.text;
      
    case 1:
      session.userData.name = userInput;
      session.step = 2;
      return 'Ingiza eneo lako (mfano: Arusha, Mwanza):';
      
    case 2:
      session.userData.location = userInput;
      session.step = 3;
      return 'Ingiza aina ya zao lako kuu:';
      
    case 3:
      session.userData.cropType = userInput;
      session.userType = 'farmer';
      
      try {
        await smsService.sendWelcomeSMS(session.phoneNumber, session.userData.name);
        return `END Asante ${session.userData.name}! Umesajiliwa kama mkulima. Utapokea SMS za bei za soko na fursa za biashara.`;
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
        return 'Ingiza jina la biashara yako:';
      }
      return USSD_MENUS.BUYER_REGISTER.text;
      
    case 1:
      session.userData.businessName = userInput;
      session.step = 2;
      return 'Ingiza eneo lako:';
      
    case 2:
      session.userData.location = userInput;
      session.step = 3;
      return 'Ingiza aina ya biashara (Jumla/Rejareja):';
      
    case 3:
      session.userData.businessType = userInput;
      session.userType = 'buyer';
      
      try {
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

// Handle market prices
const handleMarketPrices = async (userInput, session) => {
  if (userInput === '0') {
    session.currentMenu = 'MAIN';
    return USSD_MENUS.MAIN.text;
  }
  
  const priceDetails = {
    '1': 'Mahindi: TSh 1,200/kg\nUkuaji: +5% wiki hii\nMahali: Soko la Kariakoo\nUbora: Wa juu',
    '2': 'Mchele: TSh 2,500/kg\nUkuaji: Imara\nMahali: Soko la Tandale\nUbora: Wa wastani',
    '3': 'Maharage: TSh 3,800/kg\nUkuaji: +8% wiki hii\nMahali: Soko la Buguruni\nUbora: Wa juu',
    '4': 'Nyanya: TSh 1,800/kg\nUkuaji: -3% wiki hii\nMahali: Soko la Ilala\nUbora: Safi',
    '5': 'Vitunguu: TSh 2,200/kg\nUkuaji: +2% wiki hii\nMahali: Soko la Mwenge\nUbora: Wa juu',
    '6': 'Karanga: TSh 4,500/kg\nUkuaji: +10% wiki hii\nMahali: Soko la Temeke\nUbora: Wa juu'
  };
  
  if (priceDetails[userInput]) {
    return `${priceDetails[userInput]}\n\n0. Rudi Kwenye Menu Kuu`;
  }
  
  return USSD_MENUS.MARKET_PRICES.text;
};

// Handle orders management
const handleOrders = async (userInput, session) => {
  if (userInput === '0') {
    session.currentMenu = 'MAIN';
    return USSD_MENUS.MAIN.text;
  }
  
  switch (userInput) {
    case '1':
      session.currentMenu = 'CREATE_ORDER';
      session.step = 0;
      return 'Tengeneza Oda Mpya\n1. Oda ya Kununua\n2. Oda ya Kuuza\n0. Rudi';
      
    case '2':
      const userOrders = sampleOrders.filter(order => 
        (session.userType === 'farmer' && order.farmerId === 1) ||
        (session.userType === 'buyer' && order.buyerId === 1)
      );
      
      if (userOrders.length === 0) {
        return 'Huna oda zoyote kwa sasa.\n\n0. Rudi Kwenye Menu Kuu';
      }
      
      let ordersList = 'Oda Zangu:\n';
      userOrders.forEach((order, index) => {
        ordersList += `${index + 1}. ${order.crop} - ${order.quantity}kg\nHali: ${order.status}\nKiasi: TSh ${order.amount.toLocaleString()}\n\n`;
      });
      ordersList += '0. Rudi Kwenye Menu Kuu';
      
      return ordersList;
      
    case '3':
      return 'Oda za Wakulima:\n1. Mahindi - 500kg (Arusha)\n2. Mchele - 200kg (Mwanza)\n3. Maharage - 100kg (Dodoma)\n\n0. Rudi Kwenye Menu Kuu';
      
    case '4':
      return 'Historia ya Oda:\nJan 2024: 5 oda zilizokamilika\nDec 2023: 3 oda zilizokamilika\nNov 2023: 7 oda zilizokamilika\n\n0. Rudi Kwenye Menu Kuu';
      
    default:
      return USSD_MENUS.ORDERS.text;
  }
};

// Handle create order flow
const handleCreateOrder = async (userInput, session) => {
  if (userInput === '0') {
    session.currentMenu = 'ORDERS';
    return USSD_MENUS.ORDERS.text;
  }
  
  switch (session.step) {
    case 0:
      if (userInput === '1' || userInput === '2') {
        session.orderType = userInput === '1' ? 'buy' : 'sell';
        session.step = 1;
        return 'Chagua aina ya zao:\n1. Mahindi\n2. Mchele\n3. Maharage\n4. Nyanya\n0. Rudi';
      }
      return 'Tengeneza Oda Mpya\n1. Oda ya Kununua\n2. Oda ya Kuuza\n0. Rudi';
      
    case 1:
      const crops = ['', 'Mahindi', 'Mchele', 'Maharage', 'Nyanya'];
      if (userInput >= '1' && userInput <= '4') {
        session.selectedCrop = crops[parseInt(userInput)];
        session.step = 2;
        return `Ingiza kiasi cha ${session.selectedCrop} (kwa kg):`;
      }
      return 'Chagua aina ya zao:\n1. Mahindi\n2. Mchele\n3. Maharage\n4. Nyanya\n0. Rudi';
      
    case 2:
      if (isNaN(userInput) || parseInt(userInput) <= 0) {
        return 'Ingiza nambari sahihi ya kiasi (kwa kg):';
      }
      session.quantity = parseInt(userInput);
      session.step = 3;
      return 'Ingiza bei unayotaka kwa kilo (TSh):';
      
    case 3:
      if (isNaN(userInput) || parseInt(userInput) <= 0) {
        return 'Ingiza bei sahihi (TSh):';
      }
      session.price = parseInt(userInput);
      const totalAmount = session.quantity * session.price;
      
      return `END Oda imesajiliwa!\nZao: ${session.selectedCrop}\nKiasi: ${session.quantity}kg\nBei: TSh ${session.price}/kg\nJumla: TSh ${totalAmount.toLocaleString()}\n\nUtapokea SMS ya uthibitisho.`;
      
    default:
      session.currentMenu = 'ORDERS';
      return USSD_MENUS.ORDERS.text;
  }
};

// Handle account management
const handleAccount = async (userInput, session) => {
  if (userInput === '0') {
    session.currentMenu = 'MAIN';
    return USSD_MENUS.MAIN.text;
  }
  
  switch (userInput) {
    case '1':
      // Sample account balance
      const balance = 275000;
      return `Salio la Akaunti:\nTSh ${balance.toLocaleString()}\n\nSalio la Kuhifadhiwa: TSh 50,000\nSalio la Kutumika: TSh 225,000\n\n0. Rudi Kwenye Menu Kuu`;
      
    case '2':
      let transactionHistory = 'Historia ya Miamala:\n';
      sampleTransactions.forEach((trans, index) => {
        const sign = trans.type === 'sale' ? '+' : '';
        transactionHistory += `${trans.date}: ${sign}TSh ${Math.abs(trans.amount).toLocaleString()}\n${trans.description}\n\n`;
      });
      transactionHistory += '0. Rudi Kwenye Menu Kuu';
      return transactionHistory;
      
    case '3':
      return `Taarifa za Kibinafsi:\nJina: ${session.userData.name || 'Mtumiaji'}\nSimu: ${session.phoneNumber}\nEneo: ${session.userData.location || 'Halijulikani'}\nAina: ${session.userType || 'Haijulikani'}\n\n0. Rudi Kwenye Menu Kuu`;
      
    case '4':
      return 'Badilisha Nambari:\nTuma SMS kwa 15000 na ujumbe "CHANGE [nambari mpya]"\nMfano: CHANGE +255712345678\n\n0. Rudi Kwenye Menu Kuu';
      
    default:
      return USSD_MENUS.ACCOUNT.text;
  }
};

// Handle help and support
const handleHelp = async (userInput, session) => {
  if (userInput === '0') {
    session.currentMenu = 'MAIN';
    return USSD_MENUS.MAIN.text;
  }
  
  switch (userInput) {
    case '1':
      return 'Jinsi ya Kutumia:\n1. Piga *150*00# kuanza\n2. Fuata maagizo kwenye skrini\n3. Chagua nambari kwa kila hatua\n4. Bonyeza OK au Send\n\nHakuna mahitaji ya mtandao!\n\n0. Rudi Kwenye Menu Kuu';
      
    case '2':
      return 'Bei za Huduma:\nUsajili: Bure\nSMS za taarifa: TSh 50\nMiamala: 2% ya kiasi\nUongozaji: TSh 500/mwezi\n\n0. Rudi Kwenye Menu Kuu';
      
    case '3':
      return 'Wasiliana Nasi:\nSimu: +255 123 456 789\nSMS: 15000\nBarua pepe: info@agriconnect.co.tz\nOfisi: Dar es Salaam\n\nSaa za kazi: 8:00 - 17:00\n\n0. Rudi Kwenye Menu Kuu';
      
    case '4':
      return 'Matatizo ya Kawaida:\nQ: Nimesahau nambari yangu?\nA: Piga *150*00*5*4\n\nQ: Oda yangu haionekani?\nA: Subiri dakika 5 kisha jaribu tena\n\nQ: Bei zimebadilika?\nA: Bei zinabadilika kila siku\n\n0. Rudi Kwenye Menu Kuu';
      
    default:
      return USSD_MENUS.HELP.text;
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