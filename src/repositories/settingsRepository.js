import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'

function toAccount(payload, fallback = {}) {
  if (!payload || typeof payload !== 'object') {
    return {
      email: fallback.email || '',
      timezone: fallback.timezone || 'Eastern Time (ET)',
      language: fallback.language || 'English',
      dateFormat: fallback.dateFormat || 'MM/DD/YYYY',
    }
  }

  return {
    email: payload.email || fallback.email || '',
    timezone: payload.timezone || fallback.timezone || 'Eastern Time (ET)',
    language: payload.language || fallback.language || 'English',
    dateFormat: payload.date_format || fallback.dateFormat || 'MM/DD/YYYY',
  }
}

function toNotifications(payload, fallback = {}) {
  if (!payload || typeof payload !== 'object') {
    return {
      emailDigest: fallback.emailDigest ?? true,
      pitchActivity: fallback.pitchActivity ?? true,
      marketplaceMessages: fallback.marketplaceMessages ?? true,
      eventReminders: fallback.eventReminders ?? false,
    }
  }

  return {
    emailDigest: Boolean(payload.email_digest),
    pitchActivity: Boolean(payload.pitch_activity),
    marketplaceMessages: Boolean(payload.marketplace_messages),
    eventReminders: Boolean(payload.event_reminders),
  }
}

function toPrivacy(payload, fallback = {}) {
  if (!payload || typeof payload !== 'object') {
    return {
      profileVisibility: fallback.profileVisibility || 'members_only',
      showEmail: fallback.showEmail ?? false,
      allowMessages: fallback.allowMessages ?? true,
    }
  }

  return {
    profileVisibility: payload.profile_visibility || fallback.profileVisibility || 'members_only',
    showEmail: Boolean(payload.show_email),
    allowMessages: Boolean(payload.allow_messages),
  }
}

function toAccountPayload(account) {
  return {
    email: account.email?.trim() || '',
    timezone: account.timezone,
    language: account.language,
    date_format: account.dateFormat,
  }
}

function toNotificationPayload(notifications) {
  return {
    email_digest: Boolean(notifications.emailDigest),
    pitch_activity: Boolean(notifications.pitchActivity),
    marketplace_messages: Boolean(notifications.marketplaceMessages),
    event_reminders: Boolean(notifications.eventReminders),
  }
}

function toPrivacyPayload(privacy) {
  return {
    profile_visibility: privacy.profileVisibility,
    show_email: Boolean(privacy.showEmail),
    allow_messages: Boolean(privacy.allowMessages),
  }
}

export const settingsRepository = {
  async getAccount(token, fallback = {}) {
    const payload = await httpClient.get(apiEndpoints.settings.account, { token })
    return toAccount(payload, fallback)
  },

  async updateAccount(token, account, fallback = {}) {
    const payload = await httpClient.put(apiEndpoints.settings.account, toAccountPayload(account), {
      token,
    })

    return toAccount(payload, fallback)
  },

  async getNotifications(token, fallback = {}) {
    const payload = await httpClient.get(apiEndpoints.settings.notifications, { token })
    return toNotifications(payload, fallback)
  },

  async updateNotifications(token, notifications, fallback = {}) {
    const payload = await httpClient.put(
      apiEndpoints.settings.notifications,
      toNotificationPayload(notifications),
      { token }
    )

    return toNotifications(payload, fallback)
  },

  async getPrivacy(token, fallback = {}) {
    const payload = await httpClient.get(apiEndpoints.settings.privacy, { token })
    return toPrivacy(payload, fallback)
  },

  async updatePrivacy(token, privacy, fallback = {}) {
    const payload = await httpClient.put(apiEndpoints.settings.privacy, toPrivacyPayload(privacy), {
      token,
    })

    return toPrivacy(payload, fallback)
  },

  async changePassword(token, security) {
    return httpClient.post(
      apiEndpoints.settings.password,
      {
        current_password: security.currentPassword,
        new_password: security.newPassword,
        confirm_password: security.confirmPassword,
      },
      { token }
    )
  },
}
