import founderAvatar from '../assets/default-seed/founder-avatar.png'
import feedWorkshopImage from '../assets/default-seed/feed-workshop.png'
import fundMeApparelImage from '../assets/default-seed/fundme-apparel-studio.png'
import livePitchStageImage from '../assets/default-seed/live-pitch-stage.png'
import pitchReelStudioImage from '../assets/default-seed/pitch-reel-studio.png'

export const DEFAULT_ACCOUNT_TOKEN =
  'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZW1vLXVzZXItMSIsImVtYWlsIjoibWFyY3VzLmhvbGxvd2F5QGJpenNvY2lhbHMubG9jYWwiLCJleHAiOjE4OTM0NTYwMDB9.demo'

export const defaultAccount = {
  id: 1,
  user_id: 1,
  first_name: 'Marcus',
  last_name: 'Holloway',
  firstName: 'Marcus',
  lastName: 'Holloway',
  name: 'Marcus Holloway',
  business_name: 'Holloway Designs LLC',
  businessName: 'Holloway Designs LLC',
  email: 'marcus.holloway@bizsocials.local',
  avatar_url: founderAvatar,
  avatarUrl: founderAvatar,
  photoUrl: founderAvatar,
  title: 'Founder and Creative Director',
  phone: '+1 (404) 555-0188',
  industry: 'Creative Services',
  location: 'Atlanta, GA',
}

export const defaultDashboardOverview = {
  metrics: [
    { label: 'Profile Views', value: '12,480', trend: '+18%', icon: 'Eye' },
    { label: 'Followers', value: '8,240', trend: '+12%', icon: 'Users2' },
    { label: 'Engagement', value: '24.8%', trend: '+6%', icon: 'Heart' },
    { label: 'Funding Raised', value: '$24,850', trend: '+31%', icon: 'CircleDollarSign', accent: 'green' },
  ],
  recentActivity: [
    { key: 'seed-activity-1', text: 'EcoWay Apparel followed Holloway Designs LLC', time: '8m', icon: 'Users2' },
    { key: 'seed-activity-2', text: 'Your pitch reel received 94 new comments', time: '32m', icon: 'MessageCircle' },
    { key: 'seed-activity-3', text: 'Funding profile moved to Excellent readiness', time: '1h', icon: 'Check' },
    { key: 'seed-activity-4', text: 'Alicia Moore invited you to Founder Fridays', time: '3h', icon: 'CalendarDays' },
  ],
  upcomingEvents: [
    {
      month: 'JUL',
      day: '12',
      title: 'Capital Access Workshop',
      date: 'Sun, Jul 12, 2026',
      time: '6:30 PM',
      location: 'Virtual',
      attendees: 186,
    },
    {
      month: 'JUL',
      day: '18',
      title: 'Founder Fridays Live Pitch',
      date: 'Sat, Jul 18, 2026',
      time: '7:00 PM',
      location: 'Atlanta, GA',
      attendees: 94,
    },
  ],
  messages: [
    { name: 'Alicia Moore', message: 'I reviewed your pitch reel and have two intro ideas.', time: '12m', unread: 2 },
    { name: 'Investor Network', message: 'Your FundMe campaign is ready for review.', time: '1h', unread: 1 },
    { name: 'Tiffany Grant', message: 'Can you join the showcase prep call?', time: '3h', unread: 0 },
  ],
  balanceSummary: {
    bizbucksBalance: 1250,
    fundingReadiness: 82,
    fundingReadinessLabel: 'Excellent',
  },
  campaignSummary: {
    title: 'Holloway Designs Growth Fund',
    description: 'Expanding a creative studio with new equipment and two production roles.',
    raisedAmount: 24850,
    goalAmount: 40000,
    progressPercent: 62,
    supporters: 24,
    status: 'active',
    imageUrl: fundMeApparelImage,
  },
  credTrack: {
    score: 82,
    label: 'Excellent',
    checklist: [
      { label: 'Business Verification', value: '100%' },
      { label: 'Credit Health', value: '75%' },
      { label: 'Cash Flow Stability', value: '80%' },
      { label: 'Public Records', value: '90%' },
      { label: 'Funding Profile', value: '85%' },
    ],
  },
  topGroups: [
    { name: 'Fundable Futures Founders', members: '18.2K members' },
    { name: 'Creative Business Builders', members: '9.8K members' },
    { name: 'Capital Ready Network', members: '7.1K members' },
  ],
  learningCourses: [
    {
      title: 'Capital Sources That Match Your Stage',
      description: 'Choose between grants, loans, investors, and revenue-based capital.',
      duration: '42 min',
      imageUrl: feedWorkshopImage,
    },
    {
      title: 'Pitch Reel Storytelling',
      description: 'Turn a short video into a clear business narrative.',
      duration: '28 min',
      imageUrl: pitchReelStudioImage,
    },
    {
      title: 'Live Pitch Prep',
      description: 'Practice the structure judges and backers expect.',
      duration: '35 min',
      imageUrl: livePitchStageImage,
    },
  ],
  marketplaceProducts: [
    { title: 'Growth Campaign Audit', seller: 'AM Studio', price: '$299', imageUrl: feedWorkshopImage },
    { title: 'Pitch Reel Production Kit', seller: 'Holloway Designs', price: '$450', imageUrl: pitchReelStudioImage },
    { title: 'Funding Page Refresh', seller: 'Grant Luxury', price: '$375', imageUrl: fundMeApparelImage },
  ],
  sponsors: [],
  challenge: {
    title: 'BizDrop Challenge',
    description: 'Record a 30-second pitch and earn votes toward the next live showcase.',
    period: 'July sprint',
    ends_in: '5 days left',
    progress_percent: 67,
    progress_label: '2 of 3 milestones completed',
    cta_label: 'Continue Challenge',
    imageUrl: pitchReelStudioImage,
  },
}

export const defaultFeedPosts = [
  {
    id: 'seed-post-1',
    tabs: ['for_you', 'following', 'trending'],
    author_first_name: 'Marcus',
    author_last_name: 'Holloway',
    author_title: 'Founder and Creative Director',
    author_business_name: 'Holloway Designs LLC',
    author_avatar_url: founderAvatar,
    created_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    content:
      'We mapped the next phase of Holloway Designs today: a cleaner production workflow, stronger founder storytelling, and a FundMe launch plan that is ready for feedback.',
    media: [
      {
        id: 'seed-media-1',
        media_type: 'image',
        media_url: feedWorkshopImage,
        thumbnail_url: feedWorkshopImage,
        url: feedWorkshopImage,
        alt: 'Entrepreneurs reviewing business growth plans around a table.',
      },
    ],
    reactions_count: 184,
    comments_count: 32,
    shares_count: 18,
    viewer_reacted: false,
    media_count: 1,
  },
  {
    id: 'seed-post-2',
    tabs: ['for_you', 'bizquest'],
    author_first_name: 'Alicia',
    author_last_name: 'Moore',
    author_title: 'Growth Coach',
    author_business_name: 'AM Studio',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    content:
      'Pitch Reel tip: lead with the customer problem, show the proof, then ask for one clear next step. Short videos work when the story is specific.',
    media: [
      {
        id: 'seed-media-2',
        media_type: 'image',
        media_url: pitchReelStudioImage,
        thumbnail_url: pitchReelStudioImage,
        url: pitchReelStudioImage,
        alt: 'Founder recording a pitch reel in a studio.',
      },
    ],
    reactions_count: 246,
    comments_count: 41,
    shares_count: 27,
    viewer_reacted: true,
    media_count: 1,
  },
  {
    id: 'seed-post-3',
    tabs: ['for_you', 'trending'],
    author_first_name: 'Tiffany',
    author_last_name: 'Grant',
    author_title: 'Retail Strategist',
    author_business_name: 'Grant Luxury',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    content:
      'Live pitch nights are becoming the best way to see business traction in context. The next showcase has four founders ready for investor Q&A.',
    media: [
      {
        id: 'seed-media-3',
        media_type: 'image',
        media_url: livePitchStageImage,
        thumbnail_url: livePitchStageImage,
        url: livePitchStageImage,
        alt: 'Founder presenting to judges and an audience at a live pitch event.',
      },
    ],
    reactions_count: 321,
    comments_count: 56,
    shares_count: 39,
    viewer_reacted: false,
    media_count: 1,
  },
]

export const defaultTrendingTopics = [
  { hashtag_id: 'seed-topic-1', normalized_tag: 'fundablefutures', tag: 'FundableFutures', post_count: 1840 },
  { hashtag_id: 'seed-topic-2', normalized_tag: 'pitchreel', tag: 'PitchReel', post_count: 1260 },
  { hashtag_id: 'seed-topic-3', normalized_tag: 'capitalready', tag: 'CapitalReady', post_count: 940 },
  { hashtag_id: 'seed-topic-4', normalized_tag: 'bizquest', tag: 'BizQuest', post_count: 788 },
]

export const defaultPitchReels = [
  {
    id: 'reel-1',
    tab: 'top',
    author_first_name: 'Marcus',
    author_last_name: 'Holloway',
    author_business_name: 'Holloway Designs LLC',
    title: 'Design that drives growth.',
    caption: '60-second business pitch',
    category: 'Design',
    visibility: 'public',
    status: 'active',
    reactions_count: 2480,
    comments_count: 164,
    shares_count: 73,
    coverImageUrl: pitchReelStudioImage,
    gradient: 'from-[#0f172a] via-[#1d4ed8] to-[#22d3ee]',
  },
  {
    id: 'reel-2',
    tab: 'latest',
    author_first_name: 'Alicia',
    author_last_name: 'Moore',
    author_business_name: 'AM Studio',
    title: 'Your brand has a story.',
    caption: 'My #BizDropChallenge',
    category: 'Brand Story',
    visibility: 'public',
    status: 'active',
    reactions_count: 1430,
    comments_count: 94,
    shares_count: 43,
    coverImageUrl: feedWorkshopImage,
    gradient: 'from-[#0f766e] via-[#2563eb] to-[#111827]',
  },
  {
    id: 'reel-3',
    tab: 'following',
    author_first_name: 'David',
    author_last_name: 'Chen',
    author_business_name: 'OpsFlow Labs',
    title: 'Workflow tools for small teams.',
    caption: 'Building in public',
    category: 'SaaS',
    visibility: 'public',
    status: 'active',
    reactions_count: 1180,
    comments_count: 72,
    shares_count: 51,
    coverImageUrl: livePitchStageImage,
    gradient: 'from-[#155e75] via-[#1d4ed8] to-[#4338ca]',
  },
  {
    id: 'reel-4',
    tab: 'fundable',
    author_first_name: 'Tiffany',
    author_last_name: 'Grant',
    author_business_name: 'Grant Luxury',
    title: 'A premium style experience.',
    caption: 'Pitch to Win entry',
    category: 'Retail',
    visibility: 'public',
    status: 'active',
    reactions_count: 990,
    comments_count: 64,
    shares_count: 27,
    coverImageUrl: fundMeApparelImage,
    gradient: 'from-[#14532d] via-[#2563eb] to-[#7c3aed]',
  },
]

export const defaultFundMeCampaigns = [
  {
    id: '1',
    title: 'Holloway Designs Growth Fund',
    subtitle: 'Expanding a creative studio with equipment, production space, and two new roles.',
    fundedPercent: 62,
    raisedLabel: '$24,850 raised',
    raised: 24850,
    goal: 40000,
    accent: 'bg-blue-600',
    surface: 'from-[#dbe8f7] to-[#1e3a8a]',
    daysLeft: 18,
    supporters: 24,
    imageUrl: fundMeApparelImage,
  },
  {
    id: '2',
    title: 'EcoWay Apparel',
    subtitle: 'Sustainable fashion for everyday leaders.',
    fundedPercent: 72,
    raisedLabel: '$18,250 raised',
    raised: 18250,
    goal: 25000,
    accent: 'bg-emerald-500',
    surface: 'from-[#d8efe4] to-[#b8d8c9]',
    daysLeft: 24,
    supporters: 42,
    imageUrl: fundMeApparelImage,
  },
  {
    id: '3',
    title: 'UrbanBrew Coffee',
    subtitle: 'Brewed for community, grown with purpose.',
    fundedPercent: 83,
    raisedLabel: '$20,750 raised',
    raised: 20750,
    goal: 25000,
    accent: 'bg-amber-500',
    surface: 'from-[#dbe2f7] to-[#c2cde8]',
    daysLeft: 11,
    supporters: 51,
    imageUrl: feedWorkshopImage,
  },
]

export const defaultFundMeFeatured = [
  {
    id: 'f-1',
    title: 'Holloway Designs Growth Fund',
    subtitle: 'Helping founders build a stronger business.',
    progressText: '$24,850 of $40,000',
    percent: 62,
    accent: 'bg-blue-600',
    imageUrl: fundMeApparelImage,
  },
  {
    id: 'f-2',
    title: 'VentureWell Youth Lab',
    subtitle: 'Helping young founders turn prototypes into pilots.',
    progressText: '$9,600 of $20,000',
    percent: 48,
    accent: 'bg-violet-500',
    imageUrl: feedWorkshopImage,
  },
]

export const defaultFundMeActivity = [
  { id: 'a-1', text: '$250 funded Holloway Designs Growth Fund', at: '5m ago' },
  { id: 'a-2', text: 'Marcus Holloway posted a new studio expansion update', at: '1h ago' },
  { id: 'a-3', text: 'EcoWay Apparel surpassed its first $10K goal', at: '3h ago' },
]

export const defaultFundMeCampaignDetails = {
  '1': {
    id: '1',
    title: 'Holloway Designs Growth Fund',
    subtitle: 'Building a larger creative studio with room for more opportunity.',
    ownerName: 'Marcus Holloway',
    ownerMeta: 'Founder, Holloway Designs LLC - Atlanta, GA',
    ownerAvatarUrl: founderAvatar,
    imageUrl: fundMeApparelImage,
    progressPercent: 62,
    raised: 24850,
    goal: 40000,
    supporters: 24,
    daysLeft: 18,
    summary:
      'We are raising capital to expand our design studio, invest in equipment, and add two new creative roles. Your contribution helps us turn increased demand into jobs.',
    updates: [
      {
        id: 'u-1',
        title: 'Studio lease secured',
        text: 'We identified the right location for the next chapter and are preparing buildout estimates.',
      },
      {
        id: 'u-2',
        title: 'Production workflow mapped',
        text: 'The first funding milestone will go toward upgraded tools, storage, and production scheduling.',
      },
    ],
    suggestedContributions: [
      { amount: 25, caption: 'Show support' },
      { amount: 100, caption: 'Build momentum' },
      { amount: 250, caption: 'Fuel growth' },
    ],
  },
  '2': {
    id: '2',
    title: 'EcoWay Apparel',
    subtitle: 'Sustainable fashion for everyday leaders.',
    ownerName: 'Nia Carter',
    ownerMeta: 'Founder, EcoWay Apparel - Charlotte, NC',
    imageUrl: fundMeApparelImage,
    progressPercent: 72,
    raised: 18250,
    goal: 25000,
    supporters: 42,
    daysLeft: 24,
    summary:
      'EcoWay Apparel is expanding a responsibly sourced basics line and preparing a small-batch production run for retail partners.',
    updates: [
      {
        id: 'u-eco-1',
        title: 'Supplier audit completed',
        text: 'The first production partners passed our material and labor standards review.',
      },
    ],
    suggestedContributions: [
      { amount: 25, caption: 'Back the launch' },
      { amount: 100, caption: 'Support production' },
      { amount: 250, caption: 'Fund inventory' },
    ],
  },
  '3': {
    id: '3',
    title: 'UrbanBrew Coffee',
    subtitle: 'Brewed for community, grown with purpose.',
    ownerName: 'Jordan Ellis',
    ownerMeta: 'Founder, UrbanBrew Coffee - Detroit, MI',
    imageUrl: feedWorkshopImage,
    progressPercent: 83,
    raised: 20750,
    goal: 25000,
    supporters: 51,
    daysLeft: 11,
    summary:
      'UrbanBrew Coffee is raising the final capital needed for mobile equipment, neighborhood pop-ups, and local hiring.',
    updates: [
      {
        id: 'u-brew-1',
        title: 'Pop-up calendar opened',
        text: 'Three community events are now scheduled for the next campaign milestone.',
      },
    ],
    suggestedContributions: [
      { amount: 25, caption: 'Buy the first round' },
      { amount: 100, caption: 'Fuel pop-ups' },
      { amount: 250, caption: 'Support hiring' },
    ],
  },
}

export const defaultLivePitchesOverview = {
  event: {
    id: 'lp-1',
    sessionId: 1,
    title: 'Startup Showdown: Round 2',
    watching: 1245,
    ctaLabel: 'Watch Live Pitch',
    imageUrl: livePitchStageImage,
  },
  battles: [
    { id: 'b1', name: 'TechNova AI', score: 78, accent: 'bg-blue-600' },
    { id: 'b2', name: 'GreenPack', score: 71, accent: 'bg-emerald-500' },
    { id: 'b3', name: 'BoldHire', score: 65, accent: 'bg-violet-500' },
    { id: 'b4', name: 'FreshCart', score: 62, accent: 'bg-amber-500' },
  ],
  upcoming: [
    { id: 'u1', sessionId: 1, title: 'Founder Fridays', date: 'Jul 18', time: '7:00 PM EST' },
    { id: 'u2', sessionId: 1, title: 'Investor Panel Live', date: 'Jul 24', time: '5:00 PM EST' },
    { id: 'u3', sessionId: 1, title: 'Fundable Futures Showcase', date: 'Aug 3', time: '6:00 PM EST' },
  ],
}

export const defaultLivePitchSession = {
  id: 'lp-1',
  title: 'Startup Showdown: Round 2',
  sessionId: 1,
  watching: 1248,
  heroImageUrl: livePitchStageImage,
  currentPitch: {
    entryId: 1,
    name: 'TechNova AI',
    headline: 'Automation that gives teams time back.',
    summary:
      'TechNova AI gives small teams a simple way to connect their most important workflows without enterprise overhead.',
    score: 78,
  },
  chat: [
    { id: 'c1', name: 'Sarah Johnson', text: 'The retention metric is strong.' },
    { id: 'c2', name: 'Mike Taylor', text: 'Love the pricing model.' },
    { id: 'c3', name: 'Investor Network', text: 'Please share the TAM again.' },
    { id: 'c4', name: 'Alicia Moore', text: 'Voting now.' },
  ],
}

export const seedImages = {
  founderAvatar,
  feedWorkshopImage,
  fundMeApparelImage,
  livePitchStageImage,
  pitchReelStudioImage,
}
