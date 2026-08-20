import { httpClient } from '../services/httpClient'
import { apiEndpoints } from './apiEndpoints'
import { presentationDataOrThrow } from '../services/presentationData'

const fallbackConversationList = {
  limit: 20,
  offset: 0,
  total: 3,
  items: [
    {
      id: 1,
      title: 'Sarah Johnson',
      conversation_type: 'direct',
      created_by: 1,
      participant_count: 2,
      unread_count: 1,
      last_message_id: 3,
      last_message_body: 'The next version should lead with traction and the customer story.',
      last_message_at: '2026-07-06T08:00:00Z',
      last_sender_user_id: 2,
      last_sender_name: 'Sarah Johnson',
      created_at: '2026-07-06T07:00:00Z',
      updated_at: '2026-07-06T08:00:00Z',
    },
    {
      id: 2,
      title: 'Investor Network',
      conversation_type: 'group',
      created_by: 1,
      participant_count: 4,
      unread_count: 0,
      last_message_id: 4,
      last_message_body: 'New event: Live Pitch Night',
      last_message_at: '2026-07-06T07:00:00Z',
      last_sender_user_id: 3,
      last_sender_name: 'Investor Network',
      created_at: '2026-07-05T07:00:00Z',
      updated_at: '2026-07-06T07:00:00Z',
    },
    {
      id: 3,
      title: 'Michael Lee',
      conversation_type: 'direct',
      created_by: 1,
      participant_count: 2,
      unread_count: 0,
      last_message_id: 5,
      last_message_body: 'Thanks for reaching out.',
      last_message_at: '2026-07-06T06:00:00Z',
      last_sender_user_id: 4,
      last_sender_name: 'Michael Lee',
      created_at: '2026-07-05T06:00:00Z',
      updated_at: '2026-07-06T06:00:00Z',
    },
  ],
}

const fallbackMessages = [
  {
    id: 1,
    conversation_id: 1,
    sender_user_id: 2,
    sender_name: 'Sarah Johnson',
    sender_business_name: 'Investor Network',
    sender_avatar_url: null,
    body: 'Hey Marcus, I loved the way you framed the funding use case.',
    reply_to_message_id: null,
    media_count: 0,
    created_at: '2026-07-06T07:20:00Z',
    updated_at: '2026-07-06T07:20:00Z',
  },
  {
    id: 2,
    conversation_id: 1,
    sender_user_id: 1,
    sender_name: 'Marcus Holloway',
    sender_business_name: 'Holloway Designs LLC',
    sender_avatar_url: null,
    body: 'Thank you. I am tightening the ask before I share it more broadly.',
    reply_to_message_id: null,
    media_count: 0,
    created_at: '2026-07-06T07:34:00Z',
    updated_at: '2026-07-06T07:34:00Z',
  },
  {
    id: 3,
    conversation_id: 1,
    sender_user_id: 2,
    sender_name: 'Sarah Johnson',
    sender_business_name: 'Investor Network',
    sender_avatar_url: null,
    body: 'The next version should lead with traction and the customer story.',
    reply_to_message_id: null,
    media_count: 0,
    created_at: '2026-07-06T08:00:00Z',
    updated_at: '2026-07-06T08:00:00Z',
  },
]

function fallbackConversationDetail(conversationId) {
  const normalizedId = Number(conversationId) || 1
  const summary = fallbackConversationList.items.find((item) => item.id === normalizedId) || fallbackConversationList.items[0]

  return {
    id: summary.id,
    title: summary.title,
    conversation_type: summary.conversation_type,
    created_by: summary.created_by,
    unread_count: summary.unread_count,
    last_message_at: summary.last_message_at,
    created_at: summary.created_at,
    updated_at: summary.updated_at,
    participants: [
      {
        user_id: 1,
        display_name: 'Marcus Holloway',
        business_name: 'Holloway Designs LLC',
        avatar_url: null,
        joined_at: summary.created_at,
        last_read_at: summary.updated_at,
      },
      {
        user_id: 2,
        display_name: summary.title,
        business_name: summary.conversation_type === 'group' ? 'BizSocials Network' : 'Investor Network',
        avatar_url: null,
        joined_at: summary.created_at,
        last_read_at: summary.updated_at,
      },
    ],
    messages: fallbackMessages.map((message) => ({ ...message, conversation_id: summary.id })),
  }
}

export const messagesRepository = {
  async listConversations(token, { limit = 20, offset = 0 } = {}) {
    if (!token) {
      return presentationDataOrThrow(token, { ...fallbackConversationList, limit, offset }, null, 'Messages require an authenticated account.')
    }

    try {
      return await httpClient.get(`${apiEndpoints.messages.conversations}?limit=${limit}&offset=${offset}`, { token })
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      return presentationDataOrThrow(token, { ...fallbackConversationList, limit, offset }, error)
    }
  },

  async getConversation(token, conversationId, { limit = 50, offset = 0 } = {}) {
    if (!token) {
      return presentationDataOrThrow(token, () => fallbackConversationDetail(conversationId), null, 'Messages require an authenticated account.')
    }

    try {
      return await httpClient.get(`${apiEndpoints.messages.byId(conversationId)}?limit=${limit}&offset=${offset}`, { token })
    } catch (error) {
      console.error(`Failed to fetch conversation ${conversationId}:`, error)
      return presentationDataOrThrow(token, () => fallbackConversationDetail(conversationId), error)
    }
  },

  async sendMessage(token, conversationId, messageData) {
    return httpClient.post(apiEndpoints.messages.send(conversationId), messageData, { token })
  },
}

export default messagesRepository
