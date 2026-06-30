export const apiEndpoints = Object.freeze({
  auth: Object.freeze({
    login: '/auth/login',
    signup: '/auth/register',
    firebaseToken: '/auth/firebase-token',
  }),
  users: Object.freeze({
    me: '/users/me',
  }),
  profile: Object.freeze({
    me: '/profile/me',
    update: '/profile',
  }),
  dashboard: Object.freeze({
    overview: '/dashboard/overview',
  }),
  settings: Object.freeze({
    account: '/settings/account',
    notifications: '/settings/notifications',
    privacy: '/settings/privacy',
    password: '/settings/password',
  }),
  media: Object.freeze({
    reserve: '/media',
    ready: (mediaId) => `/media/${mediaId}/ready`,
    attach: (mediaId) => `/media/${mediaId}/attach`,
    mine: '/media',
    byParent: (parentType, parentId) => `/media/for/${parentType}/${parentId}`,
    remove: (mediaId) => `/media/${mediaId}`,
  }),
  feed: Object.freeze({
    list: '/feed',
    trendingTopics: '/feed/topics/trending',
  }),
  posts: Object.freeze({
    create: '/posts',
    byId: (postId) => `/posts/${postId}`,
    react: (postId) => `/posts/${postId}/reactions`,
    comments: (postId) => `/posts/${postId}/comments`,
    shares: (postId) => `/posts/${postId}/shares`,
  }),
})
