
-- Insert sample farmers
INSERT INTO farmers (name, phone, location, crop_type, farm_size) VALUES
  ('Mwalimu Nyerere', '+255712345001', 'Arusha', 'Mahindi', '5 ekari'),
  ('Mama Fatuma', '+255712345002', 'Mwanza', 'Mchele', '3 ekari'),
  ('Baba Juma', '+255712345003', 'Dodoma', 'Maharage', '2 ekari'),
  ('Dada Amina', '+255712345004', 'Iringa', 'Nyanya', '1 ekari'),
  ('Ndugu Hamisi', '+255712345005', 'Mbeya', 'Vitunguu', '4 ekari'),
  ('Mama Grace', '+255712345006', 'Kilimanjaro', 'Kahawa', '6 ekari'),
  ('Mzee Hassan', '+255712345007', 'Tanga', 'Karanga', '3 ekari'),
  ('Bi Halima', '+255712345008', 'Morogoro', 'Mahindi', '5 ekari'),
  ('Bwana Omari', '+255712345009', 'Singida', 'Mchele', '7 ekari'),
  ('Mama Rehema', '+255712345010', 'Tabora', 'Maharage', '2 ekari')
ON CONFLICT (phone) DO NOTHING;

-- Insert sample buyers
INSERT INTO buyers (name, phone, email, location, business_type, interested_crops, payment_terms) VALUES
  ('Kariakoo Fresh Markets Ltd', '+255712346001', 'orders@kariakoo.co.tz', 'Dar es Salaam', 'Jumla', ARRAY['Mahindi', 'Mchele', 'Maharage'], 'Malipo kwa wiki 2'),
  ('Mwenge Supermarket', '+255712346002', 'procurement@mwenge.co.tz', 'Dar es Salaam', 'Rejareja', ARRAY['Nyanya', 'Vitunguu', 'Mboga'], 'Malipo kwa haraka'),
  ('Arusha Grain Traders', '+255712346003', 'info@arushagrains.co.tz', 'Arusha', 'Jumla', ARRAY['Mahindi', 'Maharage', 'Karanga'], 'Malipo kwa mwezi 1'),
  ('Mwanza Fish & Agro Co', '+255712346004', 'orders@mwanzaagro.co.tz', 'Mwanza', 'Jumla', ARRAY['Mchele', 'Samaki'], 'Malipo kwa wiki 1'),
  ('Dodoma Central Market', '+255712346005', 'manager@dodomamarket.co.tz', 'Dodoma', 'Soko', ARRAY['Mahindi', 'Maharage', 'Nyama'], 'Malipo kwa haraka'),
  ('Iringa Highland Produce', '+255712346006', 'highland@iringa.co.tz', 'Iringa', 'Jumla', ARRAY['Nyanya', 'Mboga za majani'], 'Malipo kwa wiki 2'),
  ('Kilimanjaro Coffee Buyers', '+255712346007', 'coffee@kilimanjaro.co.tz', 'Moshi', 'Maalum', ARRAY['Kahawa'], 'Malipo kwa mwezi 1'),
  ('Tanga Port Exporters', '+255712346008', 'export@tanga.co.tz', 'Tanga', 'Uchukuzi', ARRAY['Karanga', 'Korosho'], 'Malipo kwa wiki 3'),
  ('Mbeya Highland Foods', '+255712346009', 'foods@mbeya.co.tz', 'Mbeya', 'Jumla', ARRAY['Maharage', 'Vitunguu'], 'Malipo kwa wiki 1'),
  ('Morogoro Agro Processing', '+255712346010', 'processing@morogoro.co.tz', 'Morogoro', 'Usindikaji', ARRAY['Mchele', 'Mahindi'], 'Malipo kwa wiki 2')
ON CONFLICT (phone) DO NOTHING;

-- Insert current market prices
INSERT INTO market_prices (crop_type, price, currency, market_location, quality_grade, price_change) VALUES
  ('Mahindi', 1200, 'TSh', 'Soko la Kariakoo', 'Daraja la Juu', 5.0),
  ('Mchele', 2500, 'TSh', 'Soko la Tandale', 'Daraja la Wastani', 0.0),
  ('Maharage', 3800, 'TSh', 'Soko la Buguruni', 'Daraja la Juu', 8.0),
  ('Nyanya', 1800, 'TSh', 'Soko la Ilala', 'Safi', -3.0),
  ('Vitunguu', 2200, 'TSh', 'Soko la Mwenge', 'Daraja la Juu', 2.0),
  ('Karanga', 4500, 'TSh', 'Soko la Temeke', 'Daraja la Juu', 10.0),
  ('Kahawa', 8500, 'TSh', 'Soko la Moshi', 'AA', 15.0),
  ('Korosho', 12000, 'TSh', 'Soko la Tanga', 'Daraja la Juu', 7.0),
  ('Samaki', 3500, 'TSh', 'Soko la Mwanza', 'Safi', -2.0),
  ('Nyama', 8000, 'TSh', 'Soko la Dodoma', 'Safi', 3.0)
ON CONFLICT DO NOTHING;

-- Insert sample transactions
DO $$
DECLARE
    farmer_id_1 uuid;
    farmer_id_2 uuid;
    farmer_id_3 uuid;
    buyer_id_1 uuid;
    buyer_id_2 uuid;
    buyer_id_3 uuid;
BEGIN
    -- Get some farmer and buyer IDs
    SELECT id INTO farmer_id_1 FROM farmers WHERE phone = '+255712345001' LIMIT 1;
    SELECT id INTO farmer_id_2 FROM farmers WHERE phone = '+255712345002' LIMIT 1;
    SELECT id INTO farmer_id_3 FROM farmers WHERE phone = '+255712345003' LIMIT 1;
    
    SELECT id INTO buyer_id_1 FROM buyers WHERE phone = '+255712346001' LIMIT 1;
    SELECT id INTO buyer_id_2 FROM buyers WHERE phone = '+255712346002' LIMIT 1;
    SELECT id INTO buyer_id_3 FROM buyers WHERE phone = '+255712346003' LIMIT 1;
    
    -- Insert sample transactions
    INSERT INTO transactions (
        farmer_id, buyer_id, crop_type, quantity, unit, price_per_unit, 
        total_amount, currency, status, payment_status, payment_method, 
        delivery_date, delivery_location, notes
    ) VALUES
        (farmer_id_1, buyer_id_1, 'Mahindi', 100, 'kg', 1200, 120000, 'TSh', 'completed', 'paid', 'M-Pesa', '2024-01-15', 'Kariakoo', 'Mahindi wa ubora wa juu'),
        (farmer_id_2, buyer_id_2, 'Mchele', 50, 'kg', 2500, 125000, 'TSh', 'completed', 'paid', 'Benki', '2024-01-18', 'Tandale', 'Mchele wa aina ya Supa'),
        (farmer_id_3, buyer_id_3, 'Maharage', 75, 'kg', 3800, 285000, 'TSh', 'pending', 'pending', 'Fedha taslimu', '2024-01-25', 'Arusha', 'Maharage ya rangi nyekundu'),
        (farmer_id_1, buyer_id_2, 'Nyanya', 200, 'kg', 1800, 360000, 'TSh', 'confirmed', 'pending', 'M-Pesa', '2024-01-22', 'Ilala', 'Nyanya za kibanda'),
        (farmer_id_2, buyer_id_1, 'Vitunguu', 80, 'kg', 2200, 176000, 'TSh', 'in_progress', 'paid', 'Benki', '2024-01-20', 'Mwenge', 'Vitunguu vikubwa'),
        (farmer_id_3, buyer_id_3, 'Karanga', 60, 'kg', 4500, 270000, 'TSh', 'pending', 'pending', 'Fedha taslimu', '2024-01-28', 'Dodoma', 'Karanga za asili')
    ON CONFLICT DO NOTHING;
END $$;