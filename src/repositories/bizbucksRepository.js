import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'

/**
 * Static fallback wallet data
 */
const defaultWallet = {
  wallet_id: 1,
  user_id: 1,
  balance: 1250,
  lifetime_earned: 1000,
  lifetime_spent: 0,
  updated_at: new Date().toISOString(),
}

/**
 * Static fallback transaction data
 */
const defaultTransactions = [
  {
    id: 4,
    wallet_id: 1,
    user_id: 1,
    amount: 25,
    transaction_type: 'earn',
    source_type: 'live_pitch_vote',
    source_id: 1,
    note: 'Reward: Pitch Reel View',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    wallet_id: 1,
    user_id: 1,
    amount: 50,
    transaction_type: 'earn',
    source_type: 'system',
    source_id: null,
    note: 'Event RSVP bonus',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    wallet_id: 1,
    user_id: 1,
    amount: -100,
    transaction_type: 'spend',
    source_type: 'system',
    source_id: null,
    note: 'Boost campaign support',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 1,
    wallet_id: 1,
    user_id: 1,
    amount: -25,
    transaction_type: 'spend',
    source_type: 'system',
    source_id: null,
    note: 'Marketplace listing fee',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const bizbucksRepository = {
  /**
   * Get user's wallet balance and stats
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Wallet data
   */
  async getWallet(token) {
    if (!token) {
      return defaultWallet
    }

    try {
      return await httpClient.get(apiEndpoints.bizbucks.wallet, { token })
    } catch (error) {
      console.warn('Failed to fetch wallet, using default data:', error)
      return defaultWallet
    }
  },

  /**
   * Get paginated transaction history
   * @param {string} token - JWT token
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Items per page (default 20, max 100)
   * @param {number} params.offset - Page offset (default 0)
   * @returns {Promise<Array>} Transaction records
   */
  async listTransactions(token, { limit = 20, offset = 0 } = {}) {
    if (!token) {
      return defaultTransactions.slice(offset, offset + limit)
    }

    try {
      const url = `${apiEndpoints.bizbucks.transactions}?limit=${limit}&offset=${offset}`
      return await httpClient.get(url, { token })
    } catch (error) {
      console.warn('Failed to fetch transactions, using default data:', error)
      return defaultTransactions.slice(offset, offset + limit)
    }
  },

  /**
   * Create a Stripe PaymentIntent for BizBucks purchase
   * @param {string} token - JWT token
   * @param {string} packageId - Package ID ("250", "1000", "2500")
   * @returns {Promise<Object>} Purchase intent with client_secret
   */
  async createPurchaseIntent(token, packageId) {
    if (!token) {
      throw new Error('Authentication required to create purchase')
    }

    try {
      return await httpClient.post(
        `${apiEndpoints.bizbucks.purchase}/create-intent`,
        { package_id: packageId },
        { token }
      )
    } catch (error) {
      console.error('Failed to create purchase intent:', error)
      throw error
    }
  },

  /**
   * Transfer BizBucks to another user
   * @param {string} token - JWT token
   * @param {number} recipientUserId - Recipient user ID
   * @param {number} amount - Amount to transfer
   * @param {string} note - Optional transfer note
   * @returns {Promise<Object>} Transfer result
   */
  async transferBizBucks(token, recipientUserId, amount, note = null) {
    if (!token) {
      throw new Error('Authentication required to transfer')
    }

    try {
      return await httpClient.post(
        apiEndpoints.bizbucks.transfer,
        {
          recipient_user_id: recipientUserId,
          amount,
          note,
        },
        { token }
      )
    } catch (error) {
      console.error('Failed to transfer BizBucks:', error)
      throw error
    }
  },
}
