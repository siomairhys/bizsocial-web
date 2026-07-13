import { seedImages } from '../data/defaultSeedData'
import { httpClient } from '../services/httpClient'
import { apiEndpoints } from './apiEndpoints'

const fallbackCourses = {
  filter: 'recommended',
  limit: 20,
  offset: 0,
  total: 4,
  items: [
    {
      id: 1,
      slug: 'funding-101',
      title: 'Funding 101',
      description: 'The complete guide to raising capital for an early-stage business.',
      category: 'funding',
      level: 'beginner',
      duration_minutes: 42,
      instructor_user_id: 1,
      instructor_name: 'Marcus Holloway',
      cover_media_id: null,
      cover_media_url: seedImages.feedWorkshopImage,
      status: 'published',
      lesson_count: 4,
      enrollment_status: 'in_progress',
      progress_percent: 50,
      completed_lessons_count: 2,
      current_lesson_id: 3,
      current_lesson_key: 'funding-ask',
      last_activity_at: '2026-07-12T12:00:00Z',
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-12T12:00:00Z',
    },
    {
      id: 2,
      slug: 'business-credit-builder',
      title: 'Build Business Credit',
      description: 'Create stronger credibility with lenders, vendors, and partners.',
      category: 'funding',
      level: 'beginner',
      duration_minutes: 36,
      instructor_user_id: 1,
      instructor_name: 'Marcus Holloway',
      cover_media_id: null,
      cover_media_url: seedImages.fundMeApparelImage,
      status: 'published',
      lesson_count: 3,
      enrollment_status: 'not_started',
      progress_percent: 0,
      completed_lessons_count: 0,
      current_lesson_id: null,
      current_lesson_key: null,
      last_activity_at: null,
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-01T12:00:00Z',
    },
    {
      id: 3,
      slug: 'pitch-like-a-pro',
      title: 'Pitch Like a Pro',
      description: 'Clarify your story, traction, and ask for investor-ready conversations.',
      category: 'sales',
      level: 'intermediate',
      duration_minutes: 28,
      instructor_user_id: 1,
      instructor_name: 'Marcus Holloway',
      cover_media_id: null,
      cover_media_url: seedImages.pitchReelStudioImage,
      status: 'published',
      lesson_count: 2,
      enrollment_status: 'not_started',
      progress_percent: 0,
      completed_lessons_count: 0,
      current_lesson_id: null,
      current_lesson_key: null,
      last_activity_at: null,
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-01T12:00:00Z',
    },
    {
      id: 4,
      slug: 'growth-marketing-engine',
      title: 'Growth Marketing Engine',
      description: 'Build repeatable campaigns that move prospects from awareness to revenue.',
      category: 'marketing',
      level: 'intermediate',
      duration_minutes: 34,
      instructor_user_id: 1,
      instructor_name: 'Marcus Holloway',
      cover_media_id: null,
      cover_media_url: seedImages.livePitchStageImage,
      status: 'published',
      lesson_count: 2,
      enrollment_status: 'not_started',
      progress_percent: 0,
      completed_lessons_count: 0,
      current_lesson_id: null,
      current_lesson_key: null,
      last_activity_at: null,
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-01T12:00:00Z',
    },
  ],
}

const fallbackModules = {
  'funding-101': [
    {
      id: 1,
      course_id: 1,
      lesson_key: 'capital-sources',
      title: 'Capital Sources That Match Your Stage',
      description: 'Compare grants, loans, investors, and revenue-based capital.',
      content: 'Map the funding source to the business stage, repayment profile, and timeline before making the ask.',
      video_url: null,
      video_media_id: null,
      duration_seconds: 480,
      sort_order: 10,
      is_preview: true,
      progress_seconds: 480,
      completed: true,
      completed_at: '2026-07-10T12:00:00Z',
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-10T12:00:00Z',
    },
    {
      id: 2,
      course_id: 1,
      lesson_key: 'lender-readiness',
      title: 'Prepare Lender Documents',
      description: 'Organize bank statements, revenue proof, ownership records, and use of funds.',
      content: 'A clean document set reduces friction and keeps funding conversations moving.',
      video_url: null,
      video_media_id: null,
      duration_seconds: 540,
      sort_order: 20,
      is_preview: false,
      progress_seconds: 540,
      completed: true,
      completed_at: '2026-07-11T12:00:00Z',
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-11T12:00:00Z',
    },
    {
      id: 3,
      course_id: 1,
      lesson_key: 'funding-ask',
      title: 'Shape a Clear Funding Ask',
      description: 'Define the amount, milestones, payback plan, and expected business impact.',
      content: 'A strong ask is specific, measurable, and connected to growth outcomes.',
      video_url: null,
      video_media_id: null,
      duration_seconds: 620,
      sort_order: 30,
      is_preview: false,
      progress_seconds: 220,
      completed: false,
      completed_at: null,
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-12T12:00:00Z',
    },
    {
      id: 4,
      course_id: 1,
      lesson_key: 'follow-up-system',
      title: 'Follow Up After Capital Conversations',
      description: 'Create a rhythm for updates, diligence requests, and next steps.',
      content: 'Follow-up discipline can separate serious founders from casual applicants.',
      video_url: null,
      video_media_id: null,
      duration_seconds: 430,
      sort_order: 40,
      is_preview: false,
      progress_seconds: 0,
      completed: false,
      completed_at: null,
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-01T12:00:00Z',
    },
  ],
  'business-credit-builder': [
    {
      id: 5,
      course_id: 2,
      lesson_key: 'credit-foundation',
      title: 'Set the Credit Foundation',
      description: 'Separate business identity, banking, and vendor activity.',
      content: 'Business credit starts with clean identity, operating separation, and consistent records.',
      video_url: null,
      video_media_id: null,
      duration_seconds: 420,
      sort_order: 10,
      is_preview: true,
      progress_seconds: 0,
      completed: false,
      completed_at: null,
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-01T12:00:00Z',
    },
  ],
  'pitch-like-a-pro': [
    {
      id: 8,
      course_id: 3,
      lesson_key: 'pitch-structure',
      title: 'Build a Clear Pitch Structure',
      description: 'Use a concise flow from problem to traction to ask.',
      content: 'The listener should understand the opportunity and next step without guesswork.',
      video_url: null,
      video_media_id: null,
      duration_seconds: 440,
      sort_order: 10,
      is_preview: true,
      progress_seconds: 0,
      completed: false,
      completed_at: null,
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-01T12:00:00Z',
    },
  ],
  'growth-marketing-engine': [
    {
      id: 10,
      course_id: 4,
      lesson_key: 'campaign-positioning',
      title: 'Position the Campaign',
      description: 'Define the audience, offer, and conversion moment.',
      content: 'Better campaigns begin with a narrow customer and a clear reason to act.',
      video_url: null,
      video_media_id: null,
      duration_seconds: 430,
      sort_order: 10,
      is_preview: true,
      progress_seconds: 0,
      completed: false,
      completed_at: null,
      created_at: '2026-07-01T12:00:00Z',
      updated_at: '2026-07-01T12:00:00Z',
    },
  ],
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function isNumericIdentifier(value) {
  return Number.isInteger(value) || (typeof value === 'string' && /^\d+$/.test(value))
}

function getFallbackDetail(identifier) {
  const normalizedIdentifier = String(identifier || 'funding-101').toLowerCase()
  const summary = fallbackCourses.items.find((course) => (
    String(course.id) === normalizedIdentifier || course.slug === normalizedIdentifier
  )) || fallbackCourses.items[0]

  return {
    ...clone(summary),
    modules: clone(fallbackModules[summary.slug] || fallbackModules['funding-101']),
  }
}

function getFallbackList({ filter = 'recommended', limit = 20, offset = 0 } = {}) {
  const normalizedFilter = filter || 'recommended'
  const items = fallbackCourses.items.filter((course) => {
    if (normalizedFilter === 'recommended' || normalizedFilter === 'all') return true
    if (normalizedFilter === 'in_progress') return course.enrollment_status === 'in_progress'
    return course.category === normalizedFilter
  })

  return {
    filter: normalizedFilter,
    limit,
    offset,
    total: items.length,
    items: clone(items.slice(offset, offset + limit)),
  }
}

function fallbackProgress(identifier, payload) {
  const detail = getFallbackDetail(identifier)
  const lesson = detail.modules.find((item) => item.lesson_key === payload.lesson_id) || detail.modules[0]
  const totalLessons = Math.max(detail.modules.length, 1)
  const completedLessons = detail.modules.filter((item) => item.completed || item.lesson_key === lesson.lesson_key).length

  return {
    course_id: detail.id,
    user_id: 1,
    status: completedLessons >= totalLessons ? 'completed' : 'in_progress',
    progress_percent: Math.round((completedLessons / totalLessons) * 100),
    current_lesson_id: lesson?.id || null,
    current_lesson_key: lesson?.lesson_key || null,
    progress_seconds: payload.progress_seconds || lesson?.duration_seconds || 0,
    completed_lessons_count: completedLessons,
    total_lessons: totalLessons,
    last_activity_at: new Date().toISOString(),
    completed_at: completedLessons >= totalLessons ? new Date().toISOString() : null,
  }
}

export const coursesRepository = {
  async getList({ token, filter = 'recommended', limit = 20, offset = 0 } = {}) {
    if (!token) {
      return getFallbackList({ filter, limit, offset })
    }

    try {
      return await httpClient.get(
        `${apiEndpoints.courses.list}?filter=${encodeURIComponent(filter)}&limit=${limit}&offset=${offset}`,
        { token },
      )
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      return getFallbackList({ filter, limit, offset })
    }
  },

  async getDetail(identifier, { token } = {}) {
    if (!token) {
      return getFallbackDetail(identifier)
    }

    try {
      return await httpClient.get(apiEndpoints.courses.byId(identifier), { token })
    } catch (error) {
      console.error(`Failed to fetch course ${identifier}:`, error)
      return getFallbackDetail(identifier)
    }
  },

  async saveProgress(token, identifier, progressData) {
    if (!token) {
      return fallbackProgress(identifier, progressData)
    }

    try {
      return await httpClient.patch(apiEndpoints.courses.progress(identifier), progressData, { token })
    } catch (error) {
      console.error(`Failed to save course progress for ${identifier}:`, error)
      return fallbackProgress(identifier, progressData)
    }
  },

  async addNote(token, identifier, noteData) {
    if (!token) {
      return {
        id: Date.now(),
        course_id: isNumericIdentifier(identifier) ? Number(identifier) : getFallbackDetail(identifier).id,
        lesson_id: null,
        lesson_key: noteData.lesson_id || null,
        user_id: 1,
        note: noteData.note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    try {
      return await httpClient.post(apiEndpoints.courses.notes(identifier), noteData, { token })
    } catch (error) {
      console.error(`Failed to save course note for ${identifier}:`, error)
      return {
        id: Date.now(),
        course_id: isNumericIdentifier(identifier) ? Number(identifier) : getFallbackDetail(identifier).id,
        lesson_id: null,
        lesson_key: noteData.lesson_id || null,
        user_id: 1,
        note: noteData.note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  },
}

export default coursesRepository
