<<<<<<< HEAD
import { useState } from 'react';
import { Sprout, Phone, MessageSquare, Users, TrendingUp, MapPin, Smartphone, Send } from 'lucide-react';
=======
// import React from 'react';
>>>>>>> development

function App() {
  const [ussdInput, setUssdInput] = useState('');
  const [ussdResponse, setUssdResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUSSDDemo = async () => {
    if (!ussdInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/ussd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: 'demo_session_' + Date.now(),
          serviceCode: '*150*00#',
          phoneNumber: '+255700000000',
          text: ussdInput
        })
      });
      
      const result = await response.text();
      setUssdResponse(result);
    } catch (error) {
      setUssdResponse('Error: Could not connect to USSD service');
    }
    setIsLoading(false);
  };

  const resetDemo = () => {
    setUssdInput('');
    setUssdResponse('');
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AgriConnect Tanzania</h1>
                <p className="text-sm text-gray-600">Kuunganisha Wakulima na Wanunuzi</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Tanzania</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Mfumo wa Kisasa wa Biashara ya Kilimo
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Tunawaunganisha wakulima na wanunuzi kupitia teknolojia ya kisasa. 
            Pata bei za soko, ushauri wa kilimo, na uongozi wa miamala kwa kutumia simu yako.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium">
              Piga *150*00# kuanza
            </div>
            <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
              SMS: 15000
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Huduma Zetu Kuu
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Usajili wa Wakulima</h4>
              <p className="text-gray-600">
                Jisajili kama mkulima na upate ufikiaji wa soko la mazao yako
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Bei za Soko</h4>
              <p className="text-gray-600">
                Pata bei za sasa za mazao mbalimbali katika masoko ya Tanzania
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Oda za Biashara</h4>
              <p className="text-gray-600">
                Tengeneza na simamia oda za kununua na kuuza mazao
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Akaunti na Miamala</h4>
              <p className="text-gray-600">
                Angalia salio, historia ya miamala, na taarifa za kibinafsi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* USSD Demo Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Jaribu USSD Demo
            </h3>
            <p className="text-lg text-gray-600">
              Ona jinsi mfumo wetu wa USSD unavyofanya kazi. Piga *150*00# au jaribu hapa chini.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* USSD Simulator */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Smartphone className="w-6 h-6 mr-2 text-green-600" />
                  USSD Simulator
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingiza nambari (au acha tupu kwa menu kuu):
                    </label>
                    <input
                      type="text"
                      value={ussdInput}
                      onChange={(e) => setUssdInput(e.target.value)}
                      placeholder="Mfano: 1 au 1*1*Jina Lako"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUSSDDemo}
                      disabled={isLoading}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Tuma
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetDemo}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Anza Upya
                    </button>
                  </div>
                </div>

                {ussdResponse && (
                  <div className="mt-6">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Jibu la USSD:</h5>
                    <div className="bg-gray-100 p-4 rounded-md">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                        {ussdResponse}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  Jinsi ya Kutumia
                </h4>
                
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-2">Menu Kuu:</h5>
                    <p>Acha sehemu tupu na ubofye "Tuma" kuona menu kuu</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">Usajili wa Mkulima:</h5>
                    <p>Ingiza: <code className="bg-white px-1 rounded">1</code> kisha fuata maagizo</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-yellow-800 mb-2">Oda za Biashara:</h5>
                    <p>Ingiza: <code className="bg-white px-1 rounded">4</code> kutengeneza na kusimamia oda</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-purple-800 mb-2">Akaunti Yangu:</h5>
                    <p>Ingiza: <code className="bg-white px-1 rounded">5</code> kuona salio na miamala</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-indigo-800 mb-2">Msaada:</h5>
                    <p>Ingiza: <code className="bg-white px-1 rounded">6</code> kupata msaada na usaidizi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Prices Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Bei za Soko - Tanzania (TSh kwa Kilo)
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h4 className="text-lg font-semibold text-green-800 mb-2">Mahindi</h4>
              <p className="text-2xl font-bold text-green-600">TSh 1,200</p>
              <p className="text-sm text-green-600 mt-1">↗ +5% wiki hii</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-800 mb-2">Mchele</h4>
              <p className="text-2xl font-bold text-blue-600">TSh 2,500</p>
              <p className="text-sm text-blue-600 mt-1">→ Imara</p>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h4 className="text-lg font-semibold text-yellow-800 mb-2">Maharage</h4>
              <p className="text-2xl font-bold text-yellow-600">TSh 3,800</p>
              <p className="text-sm text-yellow-600 mt-1">↗ +8% wiki hii</p>
            </div>
            
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h4 className="text-lg font-semibold text-red-800 mb-2">Nyanya</h4>
              <p className="text-2xl font-bold text-red-600">TSh 1,800</p>
              <p className="text-sm text-red-600 mt-1">↘ -3% wiki hii</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-8">Wasiliana Nasi</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Phone className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">USSD</h4>
              <p className="text-green-100">Piga *150*00# kutoka simu yoyote</p>
            </div>
            
            <div>
              <MessageSquare className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">SMS</h4>
              <p className="text-green-100">Tuma ujumbe kwa 15000</p>
            </div>
            
            <div>
              <MapPin className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Ofisi</h4>
              <p className="text-green-100">Dar es Salaam, Tanzania</p>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-green-500">
            <p className="text-green-100">
              © 2024 AgriConnect Tanzania. Haki zote zimehifadhiwa.
            </p>
          </div>
        </div>
      </section>
=======
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p>Start prompting (or editing) to see magic happen :</p>
>>>>>>> development
    </div>
  );
}

export default App;