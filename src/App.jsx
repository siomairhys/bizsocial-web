import { useEffect, useState } from 'react'
import AppShell from './components/layout/AppShell'
import { AuthProvider } from './modules/auth/context/AuthContext'
import { useAuth } from './modules/auth/context/useAuth'
import LoginPage from './modules/auth/pages/LoginPage'
import SignupPage from './modules/auth/pages/SignupPage'
import AccountSettingsPage from './pages/AccountSettingsPage'
import CreatePitchReelPage from './pages/CreatePitchReelPage'
import CreatePostPage from './pages/CreatePostPage'
import Dashboard from './pages/Dashboard'
import FeedPage from './pages/FeedPage'
import PostDetailPage from './pages/PostDetailPage'
import FundMeCampaignDetailPage from './pages/FundMeCampaignDetailPage'
import FundMePage from './pages/FundMePage'
import LivePitchesPage from './pages/LivePitchesPage'
import LivePitchSessionPage from './pages/LivePitchSessionPage'
import {
  AnalyticsPage,
  BizBucksWalletPage,
  BizCardProfilePage,
  BizQuestChallengeDetailPage,
  BuyBizBucksPage,
  ChatThreadPage,
  CoursePlayerPage,
  CreateEventPage,
  CreateFundMeCampaignPage,
  CreateGroupPage,
  CreateMarketplaceListingPage,
  CredTrackActionPlanPage,
  CredTrackOverviewPage,
  EventDetailPage,
  EventsDirectoryPage,
  GroupDetailPage,
  GroupsDirectoryPage,
  LearningHubPage,
  MarketplaceListingDetailPage,
  MarketplacePage,
  MessagesPage,
  SettingsPage,
  SponsorImpactPage,
} from './pages/ModulePages'
import PitchReelsPage from './pages/PitchReelsPage'
import ProfilePage from './pages/ProfilePage'

const authRoutes = ['/login', '/signup']
const dashboardRoute = '/dashboard'

function getCurrentRoute() {
  const hashRoute = window.location.hash.replace('#', '')
  return hashRoute || dashboardRoute
}

function navigateTo(route) {
  if (window.location.hash !== `#${route}`) {
    window.location.hash = route
  }
}

function AppContent() {
  const [route, setRoute] = useState(getCurrentRoute)
  const { isAuthenticated, user, signOut } = useAuth()

  useEffect(() => {
    function handleHashChange() {
      setRoute(getCurrentRoute())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (!isAuthenticated && !authRoutes.includes(route)) {
      navigateTo('/login')
    }

    if (isAuthenticated && authRoutes.includes(route)) {
      navigateTo(dashboardRoute)
    }
  }, [isAuthenticated, route])

  function handleAuthenticated() {
    navigateTo(dashboardRoute)
  }

  function handleSignOut() {
    signOut()
    navigateTo('/login')
  }

  function renderAuthenticatedRoute() {
    if (route === '/feed') {
      return <FeedPage onNavigate={navigateTo} />
    }

    if (route.startsWith('/feed/post/')) {
      return <PostDetailPage postId={route.replace('/feed/post/', '')} onNavigate={navigateTo} />
    }

    if (route === '/pitch-reels') {
      return <PitchReelsPage onNavigate={navigateTo} />
    }

    if (route.startsWith('/pitch-reels/')) {
      return (
        <PitchReelsPage
          reelId={decodeURIComponent(route.replace('/pitch-reels/', ''))}
          onNavigate={navigateTo}
        />
      )
    }

    if (route === '/live-pitches') {
      return <LivePitchesPage onNavigate={navigateTo} />
    }

    if (route === '/fundme') {
      return <FundMePage onNavigate={navigateTo} />
    }

    if (route === '/fundme/create') {
      return <CreateFundMeCampaignPage />
    }

    if (route.startsWith('/fundme/campaign/')) {
      return <FundMeCampaignDetailPage />
    }

    if (route === '/bizbucks') {
      return <BizBucksWalletPage onNavigate={navigateTo} />
    }

    if (route === '/bizbucks/buy') {
      return <BuyBizBucksPage />
    }

    if (route === '/credtrack') {
      return <CredTrackOverviewPage onNavigate={navigateTo} />
    }

    if (route === '/credtrack/action-plan') {
      return <CredTrackActionPlanPage />
    }

    if (route === '/groups') {
      return <GroupsDirectoryPage onNavigate={navigateTo} />
    }

    if (route === '/groups/create') {
      return <CreateGroupPage onNavigate={navigateTo} />
    }

    if (route.startsWith('/groups/')) {
      return <GroupDetailPage groupSlug={route.replace('/groups/', '')} onNavigate={navigateTo} />
    }

    if (route === '/events') {
      return <EventsDirectoryPage onNavigate={navigateTo} />
    }

    if (route === '/events/create') {
      return <CreateEventPage onNavigate={navigateTo} />
    }

    if (route.startsWith('/events/')) {
      return <EventDetailPage eventSlug={route.replace('/events/', '')} />
    }

    if (route === '/courses') {
      return <LearningHubPage onNavigate={navigateTo} />
    }

    if (route.startsWith('/courses/')) {
      return <CoursePlayerPage courseSlug={route.replace('/courses/', '')} onNavigate={navigateTo} />
    }

    if (route === '/marketplace') {
      return <MarketplacePage onNavigate={navigateTo} />
    }

    if (route === '/marketplace/create') {
      return <CreateMarketplaceListingPage onNavigate={navigateTo} />
    }

    if (route.startsWith('/marketplace/')) {
      return <MarketplaceListingDetailPage listingSlug={route.replace('/marketplace/', '')} onNavigate={navigateTo} />
    }

    if (route === '/messages') {
      return <MessagesPage onNavigate={navigateTo} />
    }

    if (route.startsWith('/messages/')) {
      return <ChatThreadPage conversationId={route.replace('/messages/', '')} onNavigate={navigateTo} />
    }

    if (route === '/analytics') {
      return <AnalyticsPage />
    }

    if (route === '/bizquest-challenge') {
      return <BizQuestChallengeDetailPage />
    }

    if (route === '/sponsor-impact') {
      return <SponsorImpactPage />
    }

    if (route.startsWith('/live-pitches/session/')) {
      return <LivePitchSessionPage />
    }

    if (route === '/create-pitch-reel') {
      return <CreatePitchReelPage onNavigate={navigateTo} />
    }

    if (route === '/create-post') {
      return <CreatePostPage onNavigate={navigateTo} />
    }

    if (route === '/profile') {
      return <BizCardProfilePage onNavigate={navigateTo} />
    }

    if (route === '/profile/edit') {
      return <ProfilePage user={user} />
    }

    if (route === '/settings') {
      return <SettingsPage />
    }

    if (route === '/settings/account') {
      return <AccountSettingsPage user={user} />
    }

    return <Dashboard />
  }

  if (!isAuthenticated) {
    return route === '/signup' ? (
      <SignupPage onAuthenticated={handleAuthenticated} />
    ) : (
      <LoginPage onAuthenticated={handleAuthenticated} />
    )
  }

  return (
    <AppShell
      user={user}
      currentRoute={route}
      onNavigate={navigateTo}
      onSignOut={handleSignOut}
    >
      {renderAuthenticatedRoute()}
    </AppShell>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
