import { ussdSessionsDB } from '../services/databaseService.js';

// In-memory session storage (in production, use Redis or database)
const sessions = new Map();

// USSD menu structure
const menus = {
  main: {
    text: "Karibu AgriConnect Tanzania\n1. Jisajili kama Mkulima\n2. Jisajili kama Mnunuzi\n3. Bei za Soko\n4. Oda za Biashara\n5. Akaunti Yangu\n6. Msaada\n0. Ondoka",
    options: ['1', '2', '3', '4', '5', '6', '0']
  },
  register_farmer: {
    text: "Usajili wa Mkulima\n1. Jina lako\n2. Eneo lako\n3. Aina ya mazao\n0. Rudi nyuma",
    options: ['1', '2', '3', '0']
  },
  register_buyer: {
    text: "Usajili wa Mnunuzi\n1. Jina la biashara\n2. Eneo la biashara\n3. Aina ya biashara\n0. Rudi nyuma",
    options: ['1', '2', '3', '0']
  },
  market_prices: {
    text: "Bei za Soko (TSh kwa Kilo)\n1. Mahindi - 1,200\n2. Mchele - 2,500\n3. Maharage - 3,800\n4. Nyanya - 1,800\n5. Vitunguu - 2,200\n6. Karanga - 4,500\n0. Rudi nyuma",
    options: ['1', '2', '3', '4', '5', '6', '0']
  },
  orders: {
    text: "Oda za Biashara\n1. Tengeneza oda mpya\n2. Angalia oda zangu\n3. Oda zinazopatikana\n4. Historia ya oda\n0. Rudi nyuma",
    options: ['1', '2', '3', '4', '0']
  },
  account: {
    text: "Akaunti Yangu\n1. Salio la akaunti\n2. Historia ya miamala\n3. Taarifa za kibinafsi\n4. Badilisha nambari\n0. Rudi nyuma",
    options: ['1', '2', '3', '4', '0']
  },
  help: {
    text: "Msaada na Usaidizi\n1. Maelekezo ya matumizi\n2. Bei za huduma\n3. Mawasiliano\n4. Maswali yanayoulizwa sana\n0. Rudi nyuma",
    options: ['1', '2', '3', '4', '0']
  }
};

// Handle USSD requests
const handleUSSD = async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    
    // Get or create session
    let session = sessions.get(sessionId) || {
      phoneNumber,
      currentMenu: 'main',
      userData: {},
      step: 0
    };
    
    let response = '';
    let continueSession = true;
    
    // Parse user input
    const inputs = text ? text.split('*') : [];
    const lastInput = inputs[inputs.length - 1] || '';
    
    // Handle menu navigation
    switch (session.currentMenu) {
      case 'main':
        response = handleMainMenu(lastInput, session);
        break;
      case 'register_farmer':
        response = handleFarmerRegistration(lastInput, session);
        break;
      case 'register_buyer':
        response = handleBuyerRegistration(lastInput, session);
        break;
      case 'market_prices':
        response = handleMarketPrices(lastInput, session);
        break;
      case 'orders':
        response = handleOrders(lastInput, session);
        break;
      case 'account':
        response = handleAccount(lastInput, session);
        break;
      case 'help':
        response = handleHelp(lastInput, session);
        break;
      default:
        response = menus.main.text;
        session.currentMenu = 'main';
    }
    
    // Check if session should end
    if (lastInput === '0' && session.currentMenu === 'main') {
      response = 'END Asante kwa kutumia AgriConnect Tanzania!';
      continueSession = false;
      sessions.delete(sessionId);
    } else if (typeof response === 'string' && response.startsWith('END')) {
      continueSession = false;
      sessions.delete(sessionId);
    } else {
      // Update session
      sessions.set(sessionId, session);
      response = 'CON ' + response;
    }
    
    res.set('Content-Type', 'text/plain');
    res.send(response);
    
  } catch (error) {
    console.error('USSD Error:', error);
    res.set('Content-Type', 'text/plain');
    res.send('END Kuna hitilafu. Jaribu tena baadaye.');
  }
};

// Handle main menu
function handleMainMenu(input, session) {
  switch (input) {
    case '1':
      session.currentMenu = 'register_farmer';
      return menus.register_farmer.text;
  }
}
// Handle market prices
function handleMarketPrices(input, session) {
  const prices = {
    '1': 'Mahindi: TSh 1,200/kg (+5% kutoka wiki iliyopita)\nSoko: Kariakoo, Dar es Salaam',
    '2': 'Mchele: TSh 2,500/kg (bei imara)\nSoko: Tandale, Dar es Salaam',
    '3': 'Maharage: TSh 3,800/kg (+8% kutoka wiki iliyopita)\nSoko: Mwenge, Dar es Salaam',
    '4': 'Nyanya: TSh 1,800/kg (-2% kutoka wiki iliyopita)\nSoko: Buguruni, Dar es Salaam',
    '5': 'Vitunguu: TSh 2,200/kg (+3% kutoka wiki iliyopita)\nSoko: Ilala, Dar es Salaam',
    '6': 'Karanga: TSh 4,500/kg (+12% kutoka wiki iliyopita)\nSoko: Temeke, Dar es Salaam'
  };
  
  if (prices[input]) {
    return 'END ' + prices[input] + '\n\nAsante kwa kutumia AgriConnect!';
  } else if (input === '0') {
    session.currentMenu = 'main';
    return menus.main.text;
  } else {
    return menus.market_prices.text;
  }
}

// Handle orders
function handleOrders(input, session) {
  switch (input) {
    case '1':
      return 'END Utaratibu wa kutengeneza oda unaendelezwa.\nTumia *150*00*4*1# kwa maelezo zaidi.';
    case '2':
      return 'END Oda zako:\n1. Mahindi 50kg - Inasubiri\n2. Mchele 30kg - Imekamilika\n\nAsante!';
    case '3':
      return 'END Oda zinazopatikana:\n1. Nyanya 100kg - TSh 180,000\n2. Maharage 25kg - TSh 95,000\n\nPiga *150*00*4*3# kuona zaidi.';
    case '4':
      return 'END Historia ya oda zako:\nJumla ya miamala: 15\nKiasi cha jumla: TSh 2,450,000\n\nAsante!';
    case '0':
      session.currentMenu = 'main';
      return menus.main.text;
    default:
      return menus.orders.text;
  }
}

// Handle account
function handleAccount(input, session) {
  switch (input) {
    case '1':
      return 'END Salio la Akaunti:\nSalio la sasa: TSh 275,000\nAkiba: TSh 150,000\nMikopo: TSh 0\n\nAsante!';
    case '2':
      return 'END Historia ya Miamala:\n1. Uuzaji wa mahindi - +TSh 120,000\n2. Ununuzi wa mbegu - -TSh 45,000\n3. Ada ya huduma - -TSh 5,000\n\nAsante!';
    case '3':
      return 'END Taarifa za Kibinafsi:\nJina: Mkulima Mzuri\nSimu: ' + session.phoneNumber + '\nEneo: Arusha\nMazao: Mahindi, Maharage\n\nAsante!';
    case '4':
      return 'CON Ingiza nambari mpya ya simu:';
    case '0':
      session.currentMenu = 'main';
      return menus.main.text;
    default:
      return menus.account.text;
  }
}

// Handle help
function handleHelp(input, session) {
  switch (input) {
    case '1':
      return 'END Maelekezo ya Matumizi:\n1. Piga *150*00#\n2. Chagua chaguo kutoka menyu\n3. Fuata maelekezo\n4. Maliza kwa kubonyeza 0\n\nAsante!';
    case '2':
      return 'END Bei za Huduma:\nUsajili: Bure\nUzalishaji wa oda: TSh 500\nMiamala: 2% ya kiasi\nSMS: TSh 50 kwa ujumbe\n\nAsante!';
    case '3':
      return 'END Mawasiliano:\nSimu: +255 123 456 789\nSMS: 15000\nBarua pepe: msaada@agriconnect.co.tz\nOfisi: Dar es Salaam, Tanzania\n\nAsante!';
    case '4':
      return 'END Maswali Yanayoulizwa Sana:\n1. Je, huduma ni bure? - Usajili ni bure\n2. Ninawezaje kuuza mazao? - Tumia menyu ya oda\n3. Bei zinabadilika lini? - Kila siku\n\nAsante!';
    case '0':
      session.currentMenu = 'main';
      return menus.main.text;
    default:
      return menus.help.text;
  }
}

// Get all USSD sessions
const getUSSDSessions = async (req, res) => {
  try {
    const sessionData = Array.from(sessions.entries()).map(([id, data]) => ({
      sessionId: id,
      ...data
    }));
    
    res.json({
      success: true,
      sessions: sessionData,
      count: sessionData.length
    });
  } catch (error) {
    console.error('Error getting USSD sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving USSD sessions'
    });
  }
};

// Clear all USSD sessions
const clearUSSDSessions = async (req, res) => {
  try {
    sessions.clear();
    
    res.json({
      success: true,
      message: 'All USSD sessions cleared'
    });
  } catch (error) {
    console.error('Error clearing USSD sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing USSD sessions'
    });
  }
};

export default {
  handleUSSD,
  getUSSDSessions,
  clearUSSDSessions
};