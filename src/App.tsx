import { Sprout } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Sprout className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AgriConnect</h1>
        <p className="text-gray-600">Agricultural Marketplace Backend API</p>
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md max-w-md">
          <p className="text-sm text-gray-500">
            Backend server running on port 3001
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Check API documentation for endpoints
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
