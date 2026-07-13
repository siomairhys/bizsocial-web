import { httpClient } from '../services/httpClient'
import { apiEndpoints } from './apiEndpoints'

const fallbackEvents = {
  tab: 'upcoming',
  limit: 20,
  offset: 0,
  total: 3,
  items: [
    {
      id: 1,
      slug: 'networking-mixer-innovate-connect',
      host_user_id: 1,
      host_name: 'Marcus Holloway',
      host_business_name: 'Holloway Designs LLC',
      title: 'Networking Mixer: Innovate & Connect',
      description: 'Meet founders, funders, and operators for intentional conversations around traction, capital, and partnerships.',
      location: 'Atlanta, GA',
      status: 'published',
      start_at: '2026-07-22T22:00:00Z',
      end_at: '2026-07-23T00:00:00Z',
      timezone: 'America/New_York',
      location_type: 'physical',
      virtual_url: null,
      capacity: 100,
      cover_media_id: null,
      event_type: 'networking',
      attendee_count: 24,
      viewer_rsvp_status: null,
      viewer_guest_count: 0,
      viewer_note: null,
      is_host: false,
      group_id: 1,
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-01T12:00:00Z',
      attendees: [],
    },
    {
      id: 2,
      slug: 'live-pitch-night-community-stage',
      host_user_id: 1,
      host_name: 'Alicia Moore',
      host_business_name: 'Moore Labs',
      title: 'Live Pitch Night: Community Stage',
      description: 'A virtual pitch room for founders to practice, receive feedback, and meet supporters.',
      location: 'Virtual Event',
      status: 'published',
      start_at: '2026-07-29T23:00:00Z',
      end_at: '2026-07-30T00:30:00Z',
      timezone: 'America/New_York',
      location_type: 'virtual',
      virtual_url: 'https://meet.example.com/bizsocials-live-pitch-night',
      capacity: 150,
      cover_media_id: null,
      event_type: 'pitch',
      attendee_count: 56,
      viewer_rsvp_status: null,
      viewer_guest_count: 0,
      viewer_note: null,
      is_host: false,
      group_id: null,
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-01T12:00:00Z',
      attendees: [],
    },
    {
      id: 3,
      slug: 'capital-access-workshop',
      host_user_id: 2,
      host_name: 'David Chen',
      host_business_name: 'Northstar Capital Studio',
      title: 'Capital Access Workshop',
      description: 'A practical workshop on funding readiness, lender conversations, and growth capital options.',
      location: 'Dallas, TX',
      status: 'published',
      start_at: '2026-08-05T23:30:00Z',
      end_at: '2026-08-06T01:30:00Z',
      timezone: 'America/Chicago',
      location_type: 'physical',
      virtual_url: null,
      capacity: 80,
      cover_media_id: null,
      event_type: 'workshop',
      attendee_count: 31,
      viewer_rsvp_status: null,
      viewer_guest_count: 0,
      viewer_note: null,
      is_host: false,
      group_id: null,
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-01T12:00:00Z',
      attendees: [],
    },
  ],
}

function isNumericIdentifier(value) {
  return Number.isInteger(value) || (typeof value === 'string' && /^\d+$/.test(value))
}

function fallbackDetail(identifier) {
  const normalizedIdentifier = String(identifier || '').toLowerCase()
  return (
    fallbackEvents.items.find((event) => (
      String(event.id) === normalizedIdentifier || event.slug === normalizedIdentifier
    )) || fallbackEvents.items[0]
  )
}

export const eventsRepository = {
  async getList({ token, tab = 'upcoming', limit = 20, offset = 0 } = {}) {
    try {
      return await httpClient.get(
        `${apiEndpoints.events.list}?tab=${encodeURIComponent(tab)}&limit=${limit}&offset=${offset}`,
        { token },
      )
    } catch (error) {
      console.error('Failed to fetch events:', error)
      return { ...fallbackEvents, tab, limit, offset }
    }
  },

  async getDetail(identifier, { token } = {}) {
    try {
      const endpoint = isNumericIdentifier(identifier)
        ? apiEndpoints.events.byId(identifier)
        : apiEndpoints.events.bySlug(identifier)

      return await httpClient.get(endpoint, { token })
    } catch (error) {
      console.error(`Failed to fetch event ${identifier}:`, error)
      return fallbackDetail(identifier)
    }
  },

  async create(token, eventData) {
    return httpClient.post(apiEndpoints.events.create, eventData, { token })
  },

  async rsvp(token, eventId, rsvpData) {
    return httpClient.post(apiEndpoints.events.rsvp(eventId), rsvpData, { token })
  },
}

export default eventsRepository
