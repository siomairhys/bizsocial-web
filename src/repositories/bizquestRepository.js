import { defaultDashboardOverview } from '../data/defaultSeedData'
import { httpClient } from '../services/httpClient'
import { apiEndpoints } from './apiEndpoints'
import { isPresentationAccount, presentationDataOrThrow } from '../services/presentationData'

const fallbackChallenge = {
  id: 1,
  slug: 'pitch-to-win',
  title: 'Pitch to Win',
  description: 'Turn your business story into a stronger pitch, submit a reel, and compete for community visibility.',
  starts_at: '2026-07-01T00:00:00Z',
  ends_at: '2026-07-31T23:59:59Z',
  status: 'published',
  reward_summary: 'Featured placement, BizBucks rewards, and a live pitch invitation.',
  sponsor_name: 'BizSocials Growth Council',
  sponsor_url: 'https://bizsocials.local/sponsors/growth-council',
  cover_media_id: null,
  cover_media_url: defaultDashboardOverview.challenge?.imageUrl,
  imageUrl: defaultDashboardOverview.challenge?.imageUrl,
  task_count: 4,
  total_points_available: 1100,
  participant_count: 32,
  entry_count: 18,
  viewer_status: 'submitted',
  viewer_points: 900,
  viewer_entry_count: 1,
  viewer_latest_entry_id: 1,
  progress_percent: 82,
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-12T12:00:00Z',
  tasks: [
    {
      id: 1,
      challenge_id: 1,
      task_key: 'join-challenge',
      title: 'Join the challenge',
      description: 'Claim your place in the current BizQuest sprint.',
      points: 100,
      sort_order: 1,
      viewer_completed: true,
      created_at: '2026-07-01T00:00:00Z',
      updated_at: '2026-07-01T00:00:00Z',
    },
    {
      id: 2,
      challenge_id: 1,
      task_key: 'create-pitch-reel',
      title: 'Create a pitch reel',
      description: 'Record or link a short pitch reel that introduces the business opportunity.',
      points: 500,
      sort_order: 2,
      viewer_completed: true,
      created_at: '2026-07-01T00:00:00Z',
      updated_at: '2026-07-01T00:00:00Z',
    },
    {
      id: 3,
      challenge_id: 1,
      task_key: 'submit-entry',
      title: 'Submit your entry',
      description: 'Send the summary and supporting media for review.',
      points: 300,
      sort_order: 3,
      viewer_completed: true,
      created_at: '2026-07-01T00:00:00Z',
      updated_at: '2026-07-01T00:00:00Z',
    },
    {
      id: 4,
      challenge_id: 1,
      task_key: 'promote-entry',
      title: 'Promote your entry',
      description: 'Share your BizQuest entry and earn engagement toward the leaderboard.',
      points: 200,
      sort_order: 4,
      viewer_completed: false,
      created_at: '2026-07-01T00:00:00Z',
      updated_at: '2026-07-01T00:00:00Z',
    },
  ],
  leaderboard: [
    { user_id: 1, display_name: 'Marcus Holloway', business_name: 'Holloway Designs LLC', points: 900, entries_count: 1, last_points_at: '2026-07-12T12:00:00Z' },
    { user_id: 2, display_name: 'Alicia Moore', business_name: 'AM Studio', points: 760, entries_count: 1, last_points_at: '2026-07-11T15:30:00Z' },
    { user_id: 3, display_name: 'Tiffany Grant', business_name: 'Grant Luxury', points: 620, entries_count: 1, last_points_at: '2026-07-10T11:20:00Z' },
  ],
  viewer_latest_entry: {
    id: 1,
    challenge_id: 1,
    challenge_slug: 'pitch-to-win',
    challenge_title: 'Pitch to Win',
    user_id: 1,
    pitch_reel_id: null,
    summary: 'Holloway Designs is using BizQuest to tighten the studio story, test demand, and prepare for a stronger funding pitch.',
    media_ids: [],
    status: 'submitted',
    submitted_at: '2026-07-12T12:00:00Z',
    updated_at: '2026-07-12T12:00:00Z',
  },
}

const fallbackList = {
  status: 'active',
  limit: 20,
  offset: 0,
  total: 1,
  items: [fallbackChallenge],
}

function withFallbackImage(challenge, allowPresentationImage = false) {
  if (!challenge) {
    throw new Error('BizQuest challenge was not found.')
  }

  return {
    ...challenge,
    imageUrl: challenge.imageUrl || challenge.cover_media_url || (allowPresentationImage ? defaultDashboardOverview.challenge?.imageUrl : ''),
  }
}

export const bizquestRepository = {
  async listChallenges(token, { status = 'active', limit = 20, offset = 0 } = {}) {
    try {
      return await httpClient.get(
        `${apiEndpoints.bizquest.challenges}?status=${encodeURIComponent(status)}&limit=${limit}&offset=${offset}`,
        { token }
      )
    } catch (error) {
      console.error('Failed to fetch BizQuest challenges:', error)
      return presentationDataOrThrow(token, { ...fallbackList, status, limit, offset }, error)
    }
  },

  async getChallenge(token, challengeId = 'pitch-to-win') {
    try {
      const challenge = await httpClient.get(apiEndpoints.bizquest.byId(challengeId), { token })
      return withFallbackImage(challenge, isPresentationAccount(token))
    } catch (error) {
      console.error('Failed to fetch BizQuest challenge:', error)
      return presentationDataOrThrow(token, () => withFallbackImage(fallbackChallenge, true), error)
    }
  },

  async joinChallenge(token, challengeId = 'pitch-to-win') {
    try {
      return await httpClient.post(apiEndpoints.bizquest.join(challengeId), undefined, { token })
    } catch (error) {
      console.error('Failed to join BizQuest challenge:', error)
      return presentationDataOrThrow(token, {
        id: 1,
        challenge_id: 1,
        user_id: 1,
        status: 'joined',
        points: 100,
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, error)
    }
  },

  async submitEntry(token, challengeId = 'pitch-to-win', payload = {}) {
    try {
      return await httpClient.post(apiEndpoints.bizquest.entries(challengeId), payload, { token })
    } catch (error) {
      console.error('Failed to submit BizQuest entry:', error)
      return presentationDataOrThrow(token, {
        id: Date.now(),
        challenge_id: 1,
        challenge_slug: 'pitch-to-win',
        challenge_title: 'Pitch to Win',
        user_id: 1,
        pitch_reel_id: payload.pitch_reel_id || null,
        summary: payload.summary || '',
        media_ids: payload.media_ids || [],
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, error)
    }
  },
}

export default bizquestRepository
