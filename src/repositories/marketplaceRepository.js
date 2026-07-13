import { seedImages } from '../data/defaultSeedData'
import { httpClient } from '../services/httpClient'
import { apiEndpoints } from './apiEndpoints'

const fallbackListings = {
  category: 'all',
  search: '',
  limit: 20,
  offset: 0,
  total: 4,
  items: [
    {
      id: 1,
      slug: 'logo-brand-identity',
      seller_user_id: 1,
      seller_name: 'Marcus Holloway',
      seller_business_name: 'Holloway Designs LLC',
      title: 'Logo & Brand Identity',
      description: 'Complete identity package for founders who need a polished market-ready brand foundation.',
      category: 'Branding Design',
      price_amount: 299,
      currency: 'USD',
      delivery_time_days: 7,
      remote_available: true,
      cover_media_id: null,
      cover_media_url: seedImages.feedWorkshopImage,
      status: 'published',
      avg_rating: 4.8,
      review_count: 18,
      order_count: 42,
      viewer_is_seller: false,
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-01T12:00:00Z',
    },
    {
      id: 2,
      slug: 'pitch-deck-design',
      seller_user_id: 1,
      seller_name: 'Marcus Holloway',
      seller_business_name: 'Holloway Designs LLC',
      title: 'Pitch Deck Design',
      description: 'Investor-ready pitch deck design with narrative cleanup, visual hierarchy, and final export files.',
      category: 'Branding Design',
      price_amount: 499,
      currency: 'USD',
      delivery_time_days: 10,
      remote_available: true,
      cover_media_id: null,
      cover_media_url: seedImages.pitchReelStudioImage,
      status: 'published',
      avg_rating: 4.9,
      review_count: 11,
      order_count: 27,
      viewer_is_seller: false,
      created_at: '2026-07-02T12:00:00Z',
      updated_at: '2026-07-02T12:00:00Z',
    },
    {
      id: 3,
      slug: 'grant-readiness-review',
      seller_user_id: 1,
      seller_name: 'Marcus Holloway',
      seller_business_name: 'Holloway Designs LLC',
      title: 'Grant Readiness Review',
      description: 'Funding readiness review for grant applications, document gaps, and next-step recommendations.',
      category: 'Funding Services',
      price_amount: 199,
      currency: 'USD',
      delivery_time_days: 5,
      remote_available: true,
      cover_media_id: null,
      cover_media_url: seedImages.fundMeApparelImage,
      status: 'published',
      avg_rating: 4.7,
      review_count: 9,
      order_count: 19,
      viewer_is_seller: false,
      created_at: '2026-07-03T12:00:00Z',
      updated_at: '2026-07-03T12:00:00Z',
    },
    {
      id: 4,
      slug: 'local-seo-audit',
      seller_user_id: 1,
      seller_name: 'Marcus Holloway',
      seller_business_name: 'Holloway Designs LLC',
      title: 'Local SEO Audit',
      description: 'Search visibility audit for local service businesses with prioritized fixes and listing checks.',
      category: 'Marketing Services',
      price_amount: 149,
      currency: 'USD',
      delivery_time_days: 4,
      remote_available: true,
      cover_media_id: null,
      cover_media_url: seedImages.livePitchStageImage,
      status: 'published',
      avg_rating: 4.6,
      review_count: 7,
      order_count: 16,
      viewer_is_seller: false,
      created_at: '2026-07-04T12:00:00Z',
      updated_at: '2026-07-04T12:00:00Z',
    },
  ],
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function matchesCategory(listing, category) {
  const normalizedCategory = String(category || 'all').toLowerCase()
  const listingCategory = String(listing.category || '').toLowerCase()

  if (normalizedCategory === 'all' || normalizedCategory === 'all listings') return true
  if (normalizedCategory === 'design') return listingCategory.includes('design')
  if (normalizedCategory === 'funding') return listingCategory.includes('fund')
  if (normalizedCategory === 'services') return listingCategory.includes('service')
  return listingCategory === normalizedCategory
}

function matchesSearch(listing, search) {
  const value = String(search || '').trim().toLowerCase()
  if (!value) return true

  return [
    listing.title,
    listing.description,
    listing.category,
    listing.seller_business_name,
  ].some((item) => String(item || '').toLowerCase().includes(value))
}

function getFallbackList({ category = 'all', search = '', limit = 20, offset = 0 } = {}) {
  const items = fallbackListings.items.filter((listing) => (
    matchesCategory(listing, category) && matchesSearch(listing, search)
  ))

  return {
    category,
    search,
    limit,
    offset,
    total: items.length,
    items: clone(items.slice(offset, offset + limit)),
  }
}

function getFallbackDetail(identifier) {
  const normalizedIdentifier = String(identifier || 'logo-brand-identity').toLowerCase()
  const summary = fallbackListings.items.find((listing) => (
    String(listing.id) === normalizedIdentifier || listing.slug === normalizedIdentifier
  )) || fallbackListings.items[0]

  return {
    ...clone(summary),
    requirements: 'Brand name, audience, examples, preferred colors, and current website or social links.',
    views_count: 124,
    gallery: [],
  }
}

function fallbackOrder(identifier, payload) {
  const listing = getFallbackDetail(identifier)
  return {
    id: Date.now(),
    listing_id: listing.id,
    listing_slug: listing.slug,
    listing_title: listing.title,
    seller_user_id: listing.seller_user_id,
    seller_name: listing.seller_name,
    buyer_user_id: 1,
    package_id: payload.package_id || 'standard',
    buyer_note: payload.buyer_note || null,
    payment_method_id: payload.payment_method_id || null,
    amount: listing.price_amount,
    currency: listing.currency,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function fallbackMessage(identifier, body) {
  const listing = getFallbackDetail(identifier)
  return {
    id: Date.now(),
    listing_id: listing.id,
    listing_slug: listing.slug,
    listing_title: listing.title,
    sender_user_id: 1,
    recipient_user_id: listing.seller_user_id,
    recipient_name: listing.seller_name,
    body,
    read_at: null,
    created_at: new Date().toISOString(),
  }
}

function fallbackCreatedListing(listingData) {
  return {
    ...listingData,
    id: Date.now(),
    slug: listingData.slug || String(listingData.title || 'listing').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    seller_user_id: 1,
    seller_name: 'Marcus Holloway',
    seller_business_name: 'Holloway Designs LLC',
    cover_media_url: null,
    avg_rating: 0,
    review_count: 0,
    order_count: 0,
    viewer_is_seller: true,
    views_count: 0,
    gallery: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export const marketplaceRepository = {
  async getList({ token, category = 'all', search = '', limit = 20, offset = 0 } = {}) {
    const endpoint = `${apiEndpoints.marketplace.list}?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search || '')}&limit=${limit}&offset=${offset}`

    try {
      return await httpClient.get(endpoint, { token })
    } catch (error) {
      console.error('Failed to fetch marketplace listings:', error)
      return getFallbackList({ category, search, limit, offset })
    }
  },

  async getDetail(identifier, { token } = {}) {
    try {
      return await httpClient.get(apiEndpoints.marketplace.byId(identifier), { token })
    } catch (error) {
      console.error(`Failed to fetch marketplace listing ${identifier}:`, error)
      return getFallbackDetail(identifier)
    }
  },

  async create(token, listingData) {
    if (!token) {
      return fallbackCreatedListing(listingData)
    }

    try {
      return await httpClient.post(apiEndpoints.marketplace.create, listingData, { token })
    } catch (error) {
      console.error('Failed to create marketplace listing:', error)
      return fallbackCreatedListing(listingData)
    }
  },

  async purchase(token, identifier, purchaseData) {
    try {
      return await httpClient.post(apiEndpoints.marketplace.purchase(identifier), purchaseData, { token })
    } catch (error) {
      console.error(`Failed to purchase marketplace listing ${identifier}:`, error)
      return fallbackOrder(identifier, purchaseData)
    }
  },

  async messageSeller(token, identifier, messageData) {
    try {
      return await httpClient.post(apiEndpoints.marketplace.messageSeller(identifier), messageData, { token })
    } catch (error) {
      console.error(`Failed to message marketplace seller ${identifier}:`, error)
      return fallbackMessage(identifier, messageData.body)
    }
  },
}

export default marketplaceRepository
