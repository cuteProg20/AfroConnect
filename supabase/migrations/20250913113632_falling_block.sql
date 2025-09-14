
-- Create farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  location text NOT NULL,
  crop_type text DEFAULT '',
  farm_size text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create buyers table
CREATE TABLE IF NOT EXISTS buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text UNIQUE,
  location text NOT NULL,
  business_type text DEFAULT '',
  interested_crops text[] DEFAULT '{}',
  payment_terms text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES farmers(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES buyers(id) ON DELETE CASCADE,
  crop_type text NOT NULL,
  quantity decimal NOT NULL,
  unit text DEFAULT 'kg',
  price_per_unit decimal NOT NULL,
  total_amount decimal NOT NULL,
  currency text DEFAULT 'TSh',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text DEFAULT 'cash',
  delivery_date date,
  delivery_location text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create market_prices table
CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type text NOT NULL,
  price decimal NOT NULL,
  currency text DEFAULT 'TSh',
  market_location text DEFAULT '',
  quality_grade text DEFAULT '',
  price_change decimal DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Create ussd_sessions table
CREATE TABLE IF NOT EXISTS ussd_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  phone_number text NOT NULL,
  current_menu text DEFAULT 'MAIN',
  user_data jsonb DEFAULT '{}',
  step integer DEFAULT 0,
  user_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ussd_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for farmers
CREATE POLICY "Farmers can read own data"
  ON farmers
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Service role can manage farmers"
  ON farmers
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Public can read farmers"
  ON farmers
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for buyers
CREATE POLICY "Buyers can read own data"
  ON buyers
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Service role can manage buyers"
  ON buyers
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Public can read buyers"
  ON buyers
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for transactions
CREATE POLICY "Users can read related transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = farmer_id::text OR 
    auth.uid()::text = buyer_id::text
  );

CREATE POLICY "Service role can manage transactions"
  ON transactions
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Public can read transactions"
  ON transactions
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for market_prices
CREATE POLICY "Anyone can read market prices"
  ON market_prices
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage market prices"
  ON market_prices
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for ussd_sessions
CREATE POLICY "Service role can manage USSD sessions"
  ON ussd_sessions
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farmers_phone ON farmers(phone);
CREATE INDEX IF NOT EXISTS idx_farmers_location ON farmers(location);
CREATE INDEX IF NOT EXISTS idx_farmers_crop_type ON farmers(crop_type);

CREATE INDEX IF NOT EXISTS idx_buyers_phone ON buyers(phone);
CREATE INDEX IF NOT EXISTS idx_buyers_email ON buyers(email);
CREATE INDEX IF NOT EXISTS idx_buyers_location ON buyers(location);

CREATE INDEX IF NOT EXISTS idx_transactions_farmer_id ON transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_crop_type ON transactions(crop_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_market_prices_crop_type ON market_prices(crop_type);
CREATE INDEX IF NOT EXISTS idx_market_prices_updated_at ON market_prices(updated_at);

CREATE INDEX IF NOT EXISTS idx_ussd_sessions_session_id ON ussd_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_ussd_sessions_phone_number ON ussd_sessions(phone_number);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON farmers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ussd_sessions_updated_at BEFORE UPDATE ON ussd_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();