# BizSocials Module Backend Payloads

This document is the backend and database checklist for the current static UI modules in `bizsocials-web`.

The frontend is prepared to connect one module at a time. Each protected endpoint should accept `Authorization: Bearer <token>` and return JSON. Use `snake_case` for API fields because the existing repositories already map snake_case backend fields into frontend view models.

## Common Conventions

### Standard columns

Use these columns on most primary tables unless there is a reason not to:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint or uuid | Primary key. Keep consistent across backend. |
| `created_at` | timestamp | Server generated. |
| `updated_at` | timestamp | Server generated. |
| `deleted_at` | timestamp nullable | Optional soft delete. |
| `status` | varchar | Draft, active, archived, pending, etc. |

### Standard list response

```json
{
  "items": [],
  "limit": 20,
  "offset": 0,
  "total": 0
}
```

### Standard media attachment fields

```json
{
  "media_id": "123",
  "url": "https://cdn.example.com/file.png",
  "mime_type": "image/png",
  "width": 1600,
  "height": 900,
  "alt_text": "Campaign cover image"
}
```

## Implementation Order

1. `profile`, `settings`, and `media`.
2. `fundme`, because it already has partial repository wiring.
3. `groups`, `events`, `messages`.
4. `marketplace`, `courses`, `bizbucks`.
5. `credtrack`, `analytics`, `bizquest`, `sponsorImpact`.
6. Dashboard aggregate endpoint after module APIs are stable.

## Auth And Users

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/login` | Login. |
| `#/signup` | Register. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/login` | Login with email and password. |
| `POST` | `/auth/register` | Create account. |
| `POST` | `/auth/refresh` | Refresh session token. |
| `POST` | `/auth/firebase-token` | Exchange Firebase token if needed. |
| `GET` | `/users/me` | Current authenticated user. |

### Payloads

```json
{
  "email": "member@example.com",
  "password": "Password123!"
}
```

```json
{
  "first_name": "Marcus",
  "last_name": "Holloway",
  "business_name": "Holloway Designs LLC",
  "email": "member@example.com",
  "password": "Password123!"
}
```

### Response shape

```json
{
  "access_token": "jwt",
  "refresh_token": "jwt",
  "user": {
    "id": 1,
    "first_name": "Marcus",
    "last_name": "Holloway",
    "email": "member@example.com",
    "business_name": "Holloway Designs LLC",
    "avatar_url": "https://cdn.example.com/avatar.png"
  }
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `users` | Login identity and account ownership. |
| `user_sessions` | Refresh tokens and session revocation. |
| `business_profiles` | Business identity tied to users. |

## Profile And BizCard

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/profile` | Public BizCard profile preview. |
| `#/profile/edit` | Editable profile form. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/profile/me` | Editable profile data. |
| `PUT` | `/profile` | Update editable profile data. |
| `GET` | `/profile/:userId` | Public BizCard-style profile by user id. |
| `POST` | `/profile/:userId/follow` | Follow a profile. |
| `DELETE` | `/profile/:userId/follow` | Unfollow a profile. |

### Update payload

```json
{
  "first_name": "Marcus",
  "last_name": "Holloway",
  "phone": "+15550000000",
  "title": "Founder",
  "business_name": "Holloway Designs LLC",
  "industry": "Professional Services",
  "website": "https://hollowaydesigns.example",
  "location": "Atlanta, GA",
  "avatar_url": "https://cdn.example.com/avatar.png",
  "cover_url": "https://cdn.example.com/cover.png",
  "bio": "Short public business bio."
}
```

### Response shape

```json
{
  "user_id": 1,
  "first_name": "Marcus",
  "last_name": "Holloway",
  "business_name": "Holloway Designs LLC",
  "role": "user",
  "is_active": true,
  "phone": "+15550000000",
  "title": "Founder",
  "bio": "Short public business bio.",
  "avatar_url": "https://cdn.example.com/avatar.png",
  "cover_url": "https://cdn.example.com/cover.png",
  "industry": "Professional Services",
  "location": "Atlanta, GA",
  "website_url": "https://hollowaydesigns.example",
  "follower_count": 2764,
  "following_count": 128,
  "created_at": "2026-06-26T23:33:20",
  "updated_at": "2026-06-26T23:33:20"
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `user_profiles` | Editable personal and business profile fields. |
| `user_social_links` | Optional profile social links. |
| `follows` | User follow relationships. |

## Settings

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/settings` | Static settings overview. |
| `#/settings/account` | Detailed account settings form. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/settings/account` | Account preferences. |
| `PUT` | `/settings/account` | Update account preferences. |
| `GET` | `/settings/notifications` | Notification preferences. |
| `PUT` | `/settings/notifications` | Update notifications. |
| `GET` | `/settings/privacy` | Privacy settings. |
| `PUT` | `/settings/privacy` | Update privacy. |
| `POST` | `/settings/password` | Change password. |

### Payloads

```json
{
  "email": "member@example.com",
  "timezone": "Eastern Time (ET)",
  "language": "English",
  "date_format": "MM/DD/YYYY"
}
```

```json
{
  "email_digest": true,
  "pitch_activity": true,
  "marketplace_messages": true,
  "event_reminders": false,
  "funding_updates": true
}
```

```json
{
  "profile_visibility": "members_only",
  "show_email": false,
  "allow_messages": true,
  "public_bizcard_visibility": true,
  "show_growth_milestones": true
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `user_account_settings` | Account and locale preferences. |
| `user_notification_preferences` | Per-channel notification settings. |
| `user_privacy_settings` | Profile visibility and messaging privacy. |
| `audit_logs` | Security and settings audit trail. |

## Media

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/media` | Reserve an upload. |
| `POST` | `/media/:mediaId/ready` | Mark upload complete. |
| `POST` | `/media/:mediaId/attach` | Attach media to a parent record. |
| `GET` | `/media` | Current user's media library. |
| `GET` | `/media/for/:parentType/:parentId` | Media attached to parent. |
| `DELETE` | `/media/:mediaId` | Remove media. |

### Reserve payload

```json
{
  "file_name": "cover.png",
  "mime_type": "image/png",
  "file_size": 512000,
  "media_type": "image",
  "alt_text": "Campaign cover image"
}
```

### Attach payload

```json
{
  "parent_type": "fundme_campaign",
  "parent_id": "1",
  "role": "cover"
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `media_assets` | Uploaded files and CDN metadata. |
| `media_attachments` | Parent record references. |

## Dashboard

### Frontend route

| Route | Purpose |
| --- | --- |
| `#/dashboard` | Aggregate overview. |

### Endpoint

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/dashboard/overview` | Aggregate dashboard data. |

### Response shape

```json
{
  "summary": {
    "profile_views": 3482,
    "followers": 2764,
    "engagement_rate": 9.7,
    "funding_raised": 24850,
    "bizbucks_balance": 1250,
    "funding_readiness": 82,
    "funding_readiness_label": "Funding ready"
  },
  "campaign_progress": [],
  "recent_activity": [],
  "upcoming_events": [],
  "messages_preview": [],
  "credtrack_summary": {},
  "top_groups": [],
  "learning_hub": [],
  "marketplace_spotlight": [],
  "sponsors": [],
  "bizquest_challenge": {}
}
```

### Tables

Dashboard should read from module tables and optionally cache into `dashboard_snapshots`.

## Feed And Posts

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/feed` | Member feed. |
| `#/create-post` | Create post. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/feed` | Feed list. |
| `GET` | `/feed/topics/trending` | Trending topics. |
| `POST` | `/posts` | Create post. |
| `GET` | `/posts/draft/me` | Current user's draft. |
| `GET` | `/posts/:postId` | Post detail. |
| `POST` | `/posts/:postId/reactions` | React to post. |
| `POST` | `/posts/:postId/comments` | Comment. |
| `POST` | `/posts/:postId/shares` | Share. |

### Create payload

```json
{
  "body": "What moved your business forward this week?",
  "topic": "GrowthWins",
  "visibility": "members",
  "media_ids": ["101"],
  "status": "published"
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `posts` | Feed posts and drafts. |
| `post_reactions` | Likes and other reactions. |
| `post_comments` | Comment threads. |
| `post_shares` | Share actions. |
| `feed_topics` | Hashtags and trending labels. |

## Pitch Reels

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/pitch-reels` | Pitch reel directory. |
| `#/create-pitch-reel` | Create pitch reel. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/pitch-reels` | List pitch reels. |
| `POST` | `/pitch-reels` | Create pitch reel. |
| `GET` | `/pitch-reels/draft/me` | Current user's draft. |
| `GET` | `/pitch-reels/:pitchReelId` | Pitch detail. |

### Create payload

```json
{
  "title": "Holloway Designs Growth Pitch",
  "summary": "Brand design studio raising capital for expansion.",
  "industry": "Professional Services",
  "stage": "Growth",
  "funding_goal": 40000,
  "ask": "Funding and strategic introductions",
  "video_media_id": "201",
  "thumbnail_media_id": "202",
  "status": "published"
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `pitch_reels` | Pitch metadata and media references. |
| `pitch_reel_metrics` | Views, saves, shares, engagement. |

## Live Pitches

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/live-pitches` | Live pitch directory. |
| `#/live-pitches/session/:id` | Live pitch session. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/live-pitches` | List sessions. |
| `GET` | `/live-pitches/:livePitchId` | Session detail. |
| `POST` | `/live-pitches/:livePitchId/vote` | Vote. |
| `POST` | `/live-pitches/:livePitchId/fund` | Fund or pledge. |
| `GET` | `/live-pitches/:livePitchId/chat` | Chat list. |
| `POST` | `/live-pitches/:livePitchId/chat` | Send chat message. |
| `DELETE` | `/live-pitches/:livePitchId/chat/:messageId` | Remove message. |
| `POST` | `/live-pitches/:livePitchId/watcher-touch` | Presence heartbeat. |
| `GET` | `/live-pitches/:livePitchId/leaderboard` | Leaderboard. |

### Session payload

```json
{
  "title": "Live Pitch Night",
  "starts_at": "2026-07-20T23:00:00Z",
  "host_user_id": 1,
  "pitcher_user_ids": [1, 2, 3],
  "description": "Community pitch event.",
  "status": "scheduled"
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `live_pitch_sessions` | Event/session metadata. |
| `live_pitch_participants` | Hosts, pitchers, judges. |
| `live_pitch_votes` | Votes by user. |
| `live_pitch_funding_actions` | Pledges or funding actions. |
| `live_pitch_chat_messages` | Session chat. |
| `live_pitch_presence` | Viewer heartbeat records. |

## FundMe

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/fundme` | Campaign directory. |
| `#/fundme/create` | Full create campaign form. |
| `#/fundme/campaign/:id` | Campaign detail. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/fundme?tab=discover&limit=20&offset=0` | Discover campaigns. |
| `GET` | `/fundme/me` | Current user's campaigns. |
| `GET` | `/fundme/supported` | Campaigns user supported. |
| `GET` | `/fundme/following` | Campaigns user follows. |
| `POST` | `/fundme` | Create campaign. |
| `GET` | `/fundme/:campaignId` | Campaign detail. |
| `PATCH` | `/fundme/:campaignId` | Update campaign. |
| `POST` | `/fundme/:campaignId/contributions` | Submit contribution. |
| `GET` | `/fundme/activity` | Funding activity. |
| `POST` | `/fundme/:campaignId/updates` | Campaign update. |

### Create payload

```json
{
  "title": "Holloway Designs Growth Fund",
  "summary": "Helping founders build a stronger business.",
  "story": "We are raising capital to expand our studio, buy equipment, and hire two creative roles.",
  "goal_amount": 40000,
  "currency": "USD",
  "category": "Business growth",
  "use_of_funds": "Equipment, studio lease, hiring",
  "cover_media_id": "301",
  "payout_account_id": "acct_123",
  "status": "draft"
}
```

### Campaign response

```json
{
  "id": "1",
  "owner_user_id": 1,
  "title": "Holloway Designs Growth Fund",
  "summary": "Helping founders build a stronger business.",
  "story": "Long campaign story.",
  "goal_amount": 40000,
  "raised_amount": 24850,
  "progress_percent": 62,
  "supporters_count": 24,
  "days_left": 18,
  "status": "active",
  "cover_media": {},
  "updates": [],
  "suggested_contributions": [
    { "amount": 25, "caption": "Show support" },
    { "amount": 100, "caption": "Build momentum" }
  ]
}
```

### Contribution payload

```json
{
  "amount": 100,
  "currency": "USD",
  "note": "Excited to support this campaign.",
  "payment_method_id": "pm_123",
  "anonymous": false
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `fundme_campaigns` | Campaign core fields. |
| `fundme_campaign_updates` | Founder updates. |
| `fundme_contributions` | Contribution records. |
| `fundme_followers` | Followed campaigns. |
| `fundme_payout_accounts` | Payout setup references. |

## BizBucks

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/bizbucks` | Wallet. |
| `#/bizbucks/buy` | Buy BizBucks. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/bizbucks/wallet` | Wallet balance and limits. |
| `GET` | `/bizbucks/transactions` | Transaction history. |
| `POST` | `/bizbucks/purchases/create-intent` | Create a pending static-package BizBucks purchase intent. |
| `POST` | `/bizbucks/transfers` | Transfer or reward BizBucks. |

### Purchase payload

```json
{
  "package_id": "1000"
}
```

Current static package IDs are `"250"`, `"1000"`, and `"2500"`. Product/package records can be moved into a table later when product IDs are finalized.

### Transfer payload

```json
{
  "recipient_user_id": 2,
  "amount": 50,
  "note": "Helpful feedback on my pitch."
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `credit_wallets` | One wallet per user. |
| `credit_transactions` | Ledger entries. |
| `bizbucks_purchases` | Pending and completed Stripe purchase records. |

## CredTrack

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/credtrack` | Funding readiness overview. |
| `#/credtrack/action-plan` | Recommended action plan. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/credtrack/overview` | Readiness score and checklist. |
| `GET` | `/credtrack/action-plan` | Action list. |
| `PATCH` | `/credtrack/action-plan/:actionId` | Update action status. |

### Overview response

```json
{
  "score": 82,
  "label": "Funding ready",
  "verification_percent": 100,
  "credit_health_percent": 75,
  "cash_flow_percent": 80,
  "roadmap": [
    {
      "id": "verify-business",
      "title": "Business verified",
      "status": "complete",
      "impact_points": 8
    }
  ]
}
```

### Action update payload

```json
{
  "status": "in_progress",
  "notes": "Submitted EIN verification document.",
  "evidence_media_ids": ["401"]
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `credtrack_profiles` | User credit readiness summary. |
| `credtrack_score_events` | Score history. |
| `credtrack_actions` | Action plan tasks. |
| `credtrack_documents` | Evidence documents. |

## Groups

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/groups` | Groups directory. |
| `#/groups/create` | Create group. |
| `#/groups/:slug` | Group detail. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/groups` | Directory. |
| `POST` | `/groups` | Create group. |
| `GET` | `/groups/:groupId` | Group detail. |
| `POST` | `/groups/:groupId/join` | Join group. |
| `GET` | `/groups/:groupId/posts` | Group posts. |
| `POST` | `/groups/:groupId/posts` | Create group post. |
| `GET` | `/groups/:groupId/events` | Group events. |

### Create payload

```json
{
  "name": "Entrepreneurs Unite",
  "slug": "entrepreneurs-unite",
  "description": "A community for founders documenting the journey from idea to scale.",
  "privacy": "public",
  "topics": ["Business Growth", "Funding", "Marketing"],
  "welcome_prompt": "Share your current business goal.",
  "cover_media_id": "501"
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `groups` | Group profile and rules. |
| `group_members` | Member roles and join state. |
| `group_posts` | Group-specific posts. |
| `group_topics` | Topic labels. |
| `group_events` | Event links. |

## Events

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/events` | Events directory. |
| `#/events/create` | Create event. |
| `#/events/:slug` | Event detail. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/events` | Directory. |
| `POST` | `/events` | Create event. |
| `GET` | `/events/:eventId` | Detail. |
| `POST` | `/events/:eventId/rsvp` | RSVP. |

### Create payload

```json
{
  "title": "Networking Mixer: Innovate & Connect",
  "description": "Meet founders, funders, and operators.",
  "start_at": "2026-07-22T22:00:00Z",
  "end_at": "2026-07-23T00:00:00Z",
  "timezone": "America/New_York",
  "location_type": "physical",
  "location": "Atlanta, GA",
  "virtual_url": null,
  "capacity": 100,
  "cover_media_id": "601",
  "group_id": null,
  "status": "published"
}
```

### RSVP payload

```json
{
  "status": "going",
  "guest_count": 1,
  "note": "Interested in funding conversations."
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `events` | Event core fields. |
| `event_rsvps` | RSVP state. |
| `event_hosts` | Host users and organizations. |

## Courses And Learning Hub

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/courses` | Learning Hub. |
| `#/courses/:slug` | Course player. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/courses` | Course directory. |
| `GET` | `/courses/:courseId` | Course detail. |
| `PATCH` | `/courses/:courseId/progress` | Save progress. |
| `POST` | `/courses/:courseId/notes` | Save notes. |

### Course response

```json
{
  "id": "funding-101",
  "title": "Funding 101",
  "description": "The complete guide to raising capital.",
  "duration_minutes": 42,
  "instructor_user_id": 1,
  "cover_media": {},
  "modules": [
    {
      "id": "capital-sources",
      "title": "Capital Sources That Match Your Stage",
      "duration_seconds": 480,
      "video_media_id": "701",
      "completed": false
    }
  ],
  "progress_percent": 68
}
```

### Progress payload

```json
{
  "lesson_id": "capital-sources",
  "progress_seconds": 220,
  "completed": false
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `courses` | Course metadata. |
| `course_lessons` | Lesson records. |
| `course_enrollments` | User enrollment and progress. |
| `course_notes` | User notes. |

## Marketplace

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/marketplace` | Marketplace directory. |
| `#/marketplace/create` | Create listing. |
| `#/marketplace/:slug` | Listing detail. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/marketplace` | Listing directory. |
| `POST` | `/marketplace` | Create listing. |
| `GET` | `/marketplace/:listingId` | Listing detail. |
| `POST` | `/marketplace/:listingId/purchase` | Purchase listing. |
| `POST` | `/marketplace/:listingId/messages` | Message seller. |

### Create payload

```json
{
  "title": "Logo & Brand Identity",
  "description": "Complete identity package for founders.",
  "category": "Branding Design",
  "price_amount": 299,
  "currency": "USD",
  "delivery_time_days": 7,
  "remote_available": true,
  "requirements": "Brand name, audience, examples, preferred colors.",
  "cover_media_id": "801",
  "gallery_media_ids": ["802", "803"],
  "status": "published"
}
```

### Purchase payload

```json
{
  "package_id": "standard",
  "buyer_note": "Need a logo for my coaching brand.",
  "payment_method_id": "pm_123"
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `marketplace_listings` | Seller listings. |
| `marketplace_orders` | Purchases and fulfillment status. |
| `marketplace_messages` | Buyer-seller listing messages. |
| `marketplace_reviews` | Ratings and reviews. |

## Messages

### Frontend routes

| Route | Purpose |
| --- | --- |
| `#/messages` | Inbox and active chat. |
| `#/messages/:conversationId` | Chat thread. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/messages/conversations` | Conversation list. |
| `GET` | `/messages/conversations/:conversationId` | Conversation detail. |
| `POST` | `/messages/conversations/:conversationId/messages` | Send message. |

### Send payload

```json
{
  "body": "Thanks for the feedback on my pitch.",
  "media_ids": [],
  "reply_to_message_id": null
}
```

### Conversation response

```json
{
  "id": "conv_1",
  "title": "Sarah Johnson",
  "participants": [
    { "user_id": 1, "display_name": "Marcus Holloway" },
    { "user_id": 2, "display_name": "Sarah Johnson" }
  ],
  "unread_count": 1,
  "last_message_at": "2026-07-06T08:00:00Z",
  "messages": [
    {
      "id": "msg_1",
      "sender_user_id": 2,
      "body": "Loved your pitch.",
      "created_at": "2026-07-06T08:00:00Z"
    }
  ]
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `message_conversations` | Thread metadata. |
| `message_participants` | Users in conversation. |
| `messages` | Message records. |
| `message_reads` | Read receipts. |

## Analytics

### Frontend route

| Route | Purpose |
| --- | --- |
| `#/analytics` | Metrics dashboard. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/analytics/overview?period=last_30_days` | Metrics, audience chart, top content, and audience mix. |
| `GET` | `/analytics/content?limit=10&offset=0` | Paginated content performance rows. |
| `GET` | `/analytics/export?period=last_30_days` | Export-ready analytics rows. |

Accepted `period` values: `last_7_days`, `last_30_days`, `last_90_days`.

### Overview response

```json
{
  "period": "last_30_days",
  "metrics": {
    "profile_views": { "value": 3482, "trend_percent": 12.6 },
    "pitch_reel_views": { "value": 12900, "trend_percent": 24.8 },
    "new_followers": { "value": 426, "trend_percent": 8.4 },
    "funding_activity": { "value": 24850, "trend_percent": 18.7 }
  },
  "audience_growth": [
    {
      "date": "2026-07-01",
      "followers": 1200,
      "engagement": 80,
      "funding_activity": 450
    }
  ],
  "top_content": [
    {
      "id": 1,
      "user_id": 1,
      "content_type": "post",
      "content_id": 1001,
      "title": "Design that drives growth",
      "views_count": 2840,
      "engagement_rate": 8.6,
      "reactions_count": 184,
      "comments_count": 42,
      "shares_count": 31,
      "amount_value": 0,
      "deep_link": "/feed",
      "last_activity_at": "2026-07-12T12:00:00Z",
      "created_at": "2026-07-01T12:00:00Z",
      "updated_at": "2026-07-12T12:00:00Z"
    }
  ],
  "audience_insights": {
    "entrepreneurs": 44,
    "creators": 28,
    "funders": 16
  }
}
```

### Content response

```json
{
  "limit": 10,
  "offset": 0,
  "total": 4,
  "items": [
    {
      "id": 1,
      "user_id": 1,
      "content_type": "post",
      "content_id": 1001,
      "title": "Design that drives growth",
      "views_count": 2840,
      "engagement_rate": 8.6,
      "reactions_count": 184,
      "comments_count": 42,
      "shares_count": 31,
      "amount_value": 0,
      "deep_link": "/feed",
      "last_activity_at": "2026-07-12T12:00:00Z",
      "created_at": "2026-07-01T12:00:00Z",
      "updated_at": "2026-07-12T12:00:00Z"
    }
  ]
}
```

### Export response

```json
{
  "period": "last_30_days",
  "report_name": "bizsocials-analytics-last_30_days.json",
  "generated_at": "2026-07-12T12:00:00Z",
  "rows": [
    {
      "section": "metric",
      "metric_key": "profile_views",
      "label": "Profile Views",
      "value_number": 3482
    }
  ]
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `analytics_events` | Raw events. |
| `analytics_daily_metrics` | Daily aggregates. |
| `content_metrics` | Post, pitch, listing, and campaign metrics. |

## BizQuest

### Frontend route

| Route | Purpose |
| --- | --- |
| `#/bizquest-challenge` | Challenge detail. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/bizquest/challenges?status=active&limit=20&offset=0` | Challenge list. |
| `GET` | `/bizquest/challenges/:challengeId` | Challenge detail. |
| `POST` | `/bizquest/challenges/:challengeId/join` | Join challenge. |
| `POST` | `/bizquest/challenges/:challengeId/entries` | Submit entry. |

Accepted list `status` values: `active`, `all`, `draft`, `published`, `completed`, `archived`.

### Challenge detail response

```json
{
  "id": 1,
  "slug": "pitch-to-win",
  "title": "Pitch to Win",
  "description": "Turn your business story into a stronger pitch.",
  "starts_at": "2026-07-01T00:00:00Z",
  "ends_at": "2026-07-31T23:59:59Z",
  "status": "published",
  "reward_summary": "Featured placement, BizBucks rewards, and a live pitch invitation.",
  "sponsor_name": "BizSocials Growth Council",
  "cover_media_id": null,
  "cover_media_url": null,
  "task_count": 4,
  "total_points_available": 1100,
  "participant_count": 32,
  "entry_count": 18,
  "viewer_status": "submitted",
  "viewer_points": 900,
  "viewer_entry_count": 1,
  "viewer_latest_entry_id": 7,
  "progress_percent": 82,
  "tasks": [
    {
      "id": 2,
      "challenge_id": 1,
      "task_key": "create-pitch-reel",
      "title": "Create pitch reel",
      "description": "Record or link a short pitch reel.",
      "points": 500,
      "sort_order": 2,
      "viewer_completed": true,
      "created_at": "2026-07-01T00:00:00Z",
      "updated_at": "2026-07-01T00:00:00Z"
    }
  ],
  "leaderboard": [
    {
      "user_id": 1,
      "display_name": "Alicia Moore",
      "business_name": "AM Studio",
      "points": 1200,
      "entries_count": 1,
      "last_points_at": "2026-07-12T12:00:00Z"
    }
  ],
  "viewer_latest_entry": {
    "id": 7,
    "challenge_id": 1,
    "challenge_slug": "pitch-to-win",
    "challenge_title": "Pitch to Win",
    "user_id": 1,
    "pitch_reel_id": 901,
    "summary": "My challenge submission.",
    "media_ids": [],
    "status": "submitted",
    "submitted_at": "2026-07-12T12:00:00Z",
    "updated_at": "2026-07-12T12:00:00Z"
  },
  "created_at": "2026-07-01T00:00:00Z",
  "updated_at": "2026-07-12T12:00:00Z"
}
```

### List response

```json
{
  "status": "active",
  "limit": 20,
  "offset": 0,
  "total": 1,
  "items": []
}
```

### Join response

```json
{
  "id": 1,
  "challenge_id": 1,
  "user_id": 1,
  "status": "joined",
  "points": 100,
  "joined_at": "2026-07-12T12:00:00Z",
  "updated_at": "2026-07-12T12:00:00Z"
}
```

### Entry payload

```json
{
  "pitch_reel_id": 901,
  "summary": "My challenge submission.",
  "media_ids": [902]
}
```

### Entry response

```json
{
  "id": 21,
  "challenge_id": 1,
  "challenge_slug": "pitch-to-win",
  "challenge_title": "Pitch to Win",
  "user_id": 1,
  "pitch_reel_id": 901,
  "summary": "My challenge submission.",
  "media_ids": [902],
  "status": "submitted",
  "submitted_at": "2026-07-12T12:00:00Z",
  "updated_at": "2026-07-12T12:00:00Z"
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `bizquest_challenges` | Challenge metadata. |
| `bizquest_tasks` | Challenge tasks. |
| `bizquest_participants` | Joined users. |
| `bizquest_entries` | User submissions. |
| `bizquest_points` | Point ledger. |

## Sponsor Impact

### Frontend route

| Route | Purpose |
| --- | --- |
| `#/sponsor-impact` | Sponsor dashboard. |

### Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/sponsors/impact?period=last_30_days` | Sponsor impact overview. |
| `GET` | `/sponsors/campaigns?status=active&limit=20&offset=0` | Sponsor campaign list. |
| `GET` | `/sponsors/impact/export?period=last_30_days` | Export impact report. |

Accepted `period` values: `last_7_days`, `last_30_days`, `last_90_days`.

Accepted campaign `status` values: `active`, `paused`, `completed`, `draft`, `all`.

### Overview response

```json
{
  "period": "last_30_days",
  "metrics": {
    "founders_supported": { "value": 300, "trend_percent": 44 },
    "campaign_reach": { "value": 82000, "trend_percent": 29 },
    "funding_facilitated": { "value": 240000, "trend_percent": 18 },
    "active_sponsors": { "value": 21, "trend_percent": 8 }
  },
  "founder_outcomes": [
    {
      "outcome_key": "pitch_readiness_unlocked",
      "label": "Pitch readiness unlocked",
      "value": 120,
      "trend_percent": 12
    }
  ],
  "featured_founder_stories": [
    {
      "id": 1,
      "user_id": 1,
      "display_name": "Alicia Moore",
      "business_name": "AM Studio",
      "milestone": "Growth milestone reached",
      "event_type": "pitch_ready",
      "event_value": 1,
      "campaign_id": 1,
      "campaign_slug": "underserved-business-credit-access",
      "campaign_title": "Underserved Business Credit Access",
      "sponsor_name": "Fundable Futures",
      "event_at": "2026-07-12T12:00:00Z"
    }
  ]
}
```

### Campaign list response

```json
{
  "status": "active",
  "limit": 20,
  "offset": 0,
  "total": 3,
  "items": [
    {
      "id": 1,
      "sponsor_account_id": 1,
      "sponsor_name": "Fundable Futures",
      "sponsor_slug": "fundable-futures",
      "sponsor_tier": "title",
      "slug": "underserved-business-credit-access",
      "title": "Underserved Business Credit Access",
      "description": "Helping founders improve funding readiness and lender visibility.",
      "status": "active",
      "starts_at": "2026-07-01T00:00:00Z",
      "ends_at": "2026-09-30T23:59:59Z",
      "budget_amount": 125000,
      "currency": "USD",
      "target_founders": 350,
      "target_reach": 90000,
      "target_funding_amount": 250000,
      "founders_supported": 300,
      "campaign_reach": 82000,
      "funding_facilitated": 240000,
      "pitch_readiness_unlocked": 120,
      "founder_progress_percent": 86,
      "reach_progress_percent": 91,
      "created_at": "2026-07-01T00:00:00Z",
      "updated_at": "2026-07-12T12:00:00Z"
    }
  ]
}
```

### Export response

```json
{
  "period": "last_30_days",
  "report_name": "bizsocials-sponsor-impact-last_30_days.json",
  "generated_at": "2026-07-12T12:00:00Z",
  "rows": [
    {
      "section": "metric",
      "metric_key": "founders_supported",
      "label": "Founders Supported",
      "value_number": 300
    }
  ]
}
```

### Tables

| Table | Purpose |
| --- | --- |
| `sponsor_accounts` | Sponsor organizations. |
| `sponsor_campaigns` | Sponsored campaigns. |
| `sponsor_impact_events` | Raw sponsor impact events. |
| `sponsor_impact_daily_metrics` | Aggregated impact metrics. |

## Backend Readiness Checklist

Use this checklist for each module before connecting the UI:

1. Add endpoint constants in `src/repositories/apiEndpoints.js`.
2. Add a repository method with static fallback until API is enabled.
3. Validate request payloads on the server.
4. Return frontend-safe response fields only.
5. Add pagination to every list endpoint.
6. Add ownership checks for update, delete, draft, and private detail endpoints.
7. Add media attachment support where screens display images or videos.
8. Add audit rows for money, password, payout, and moderation actions.
9. Add seed data matching the static UI examples.
10. Connect dashboard and analytics only after source module tables are stable.
