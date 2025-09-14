import { supabase, supabaseAdmin, handleDatabaseError } from '../config/database.js';

// Farmers Database Operations
export const farmersDB = {
  // Get all farmers
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data, count: data.length };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching farmers') };
    }
  },

  // Get farmer by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching farmer') };
    }
  },

  // Get farmer by phone
  async getByPhone(phone) {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('phone', phone)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data: error ? null : data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching farmer by phone') };
    }
  },

  // Create new farmer
  async create(farmerData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('farmers')
        .insert([farmerData])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'creating farmer') };
    }
  },

  // Update farmer
  async update(id, updateData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('farmers')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'updating farmer') };
    }
  },

  // Delete farmer
  async delete(id) {
    try {
      const { data, error } = await supabaseAdmin
        .from('farmers')
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'deleting farmer') };
    }
  }
};

// Buyers Database Operations
export const buyersDB = {
  // Get all buyers
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data, count: data.length };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching buyers') };
    }
  },

  // Get buyer by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching buyer') };
    }
  },

  // Get buyers by crop interest
  async getByCrop(cropType) {
    try {
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .contains('interested_crops', [cropType]);
      
      if (error) throw error;
      return { success: true, data, count: data.length };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching buyers by crop') };
    }
  },

  // Create new buyer
  async create(buyerData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('buyers')
        .insert([buyerData])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'creating buyer') };
    }
  },

  // Update buyer
  async update(id, updateData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('buyers')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'updating buyer') };
    }
  },

  // Delete buyer
  async delete(id) {
    try {
      const { data, error } = await supabaseAdmin
        .from('buyers')
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'deleting buyer') };
    }
  }
};

// Transactions Database Operations
export const transactionsDB = {
  // Get all transactions with filters
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          farmers:farmer_id(name, phone, location),
          buyers:buyer_id(name, phone, location)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.farmerId) query = query.eq('farmer_id', filters.farmerId);
      if (filters.buyerId) query = query.eq('buyer_id', filters.buyerId);
      if (filters.cropType) query = query.ilike('crop_type', `%${filters.cropType}%`);

      const { data, error } = await query;
      
      if (error) throw error;
      return { success: true, data, count: data.length };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching transactions') };
    }
  },

  // Get transaction by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          farmers:farmer_id(name, phone, location),
          buyers:buyer_id(name, phone, location)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching transaction') };
    }
  },

  // Create new transaction
  async create(transactionData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert([transactionData])
        .select(`
          *,
          farmers:farmer_id(name, phone, location),
          buyers:buyer_id(name, phone, location)
        `)
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'creating transaction') };
    }
  },

  // Update transaction
  async update(id, updateData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          farmers:farmer_id(name, phone, location),
          buyers:buyer_id(name, phone, location)
        `)
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'updating transaction') };
    }
  },

  // Get transaction statistics
  async getStats() {
    try {
      const { data: allTransactions, error: allError } = await supabase
        .from('transactions')
        .select('*');
      
      if (allError) throw allError;

      const totalTransactions = allTransactions.length;
      const completedTransactions = allTransactions.filter(t => t.status === 'completed').length;
      const pendingTransactions = allTransactions.filter(t => t.status === 'pending').length;
      const totalValue = allTransactions.reduce((sum, t) => sum + parseFloat(t.total_amount), 0);
      const completedValue = allTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.total_amount), 0);

      // Group by crop type
      const cropStats = allTransactions.reduce((acc, t) => {
        if (!acc[t.crop_type]) {
          acc[t.crop_type] = { count: 0, totalValue: 0, totalQuantity: 0 };
        }
        acc[t.crop_type].count++;
        acc[t.crop_type].totalValue += parseFloat(t.total_amount);
        acc[t.crop_type].totalQuantity += parseFloat(t.quantity);
        return acc;
      }, {});

      return {
        success: true,
        data: {
          overview: {
            totalTransactions,
            completedTransactions,
            pendingTransactions,
            totalValue,
            completedValue,
            averageTransactionValue: totalTransactions > 0 ? totalValue / totalTransactions : 0
          },
          cropStats
        }
      };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching transaction stats') };
    }
  }
};

// Market Prices Database Operations
export const marketPricesDB = {
  // Get all market prices
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data, count: data.length };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching market prices') };
    }
  },

  // Get price by crop type
  async getByCrop(cropType) {
    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('crop_type', cropType)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data: error ? null : data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching market price') };
    }
  },

  // Update market price
  async updatePrice(cropType, priceData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('market_prices')
        .upsert([{ crop_type: cropType, ...priceData, updated_at: new Date().toISOString() }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'updating market price') };
    }
  }
};

// USSD Sessions Database Operations
export const ussdSessionsDB = {
  // Get session by session ID
  async getBySessionId(sessionId) {
    try {
      const { data, error } = await supabase
        .from('ussd_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data: error ? null : data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching USSD session') };
    }
  },

  // Create or update USSD session
  async upsert(sessionData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('ussd_sessions')
        .upsert([{ ...sessionData, updated_at: new Date().toISOString() }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'upserting USSD session') };
    }
  },

  // Delete session
  async delete(sessionId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('ussd_sessions')
        .delete()
        .eq('session_id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'deleting USSD session') };
    }
  },

  // Get all active sessions
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('ussd_sessions')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data, count: data.length };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'fetching USSD sessions') };
    }
  },

  // Clear all sessions
  async clearAll() {
    try {
      const { error } = await supabaseAdmin
        .from('ussd_sessions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, ...handleDatabaseError(error, 'clearing USSD sessions') };
    }
  }
};

export default {
  farmersDB,
  buyersDB,
  transactionsDB,
  marketPricesDB,
  ussdSessionsDB
};