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
import FeatureActionPage from './pages/FeatureActionPage'
import FeedPage from './pages/FeedPage'
import PitchReelsPage from './pages/PitchReelsPage'
import ProfilePage from './pages/ProfilePage'

const authRoutes = ['/login', '/signup']
const dashboardRoute = '/dashboard'

const featureRoutes = {
  '/fundme': {
    eyebrow: 'FundMe',
    title: 'Start Fundraiser',
    description: 'Prepare a campaign page for capital goals, business needs, contribution details, and supporter updates.',
    icon: 'CircleDollarSign',
    primaryAction: 'Start fundraiser draft',
    checklist: ['Funding goal', 'Campaign story', 'Use of funds', 'Supporter updates'],
  },
  '/bizquest-challenge': {
    eyebrow: 'BizQuest',
    title: 'Join Challenge',
    description: 'Enter a business growth challenge, track progress, and compete for visibility, rewards, and community support.',
    icon: 'Trophy',
    primaryAction: 'View challenge details',
    checklist: ['Challenge selection', 'Eligibility details', 'Submission requirements', 'Progress tracking'],
  },
  '/events': {
    eyebrow: 'Events',
    title: 'Create Event',
    description: 'Set up an event for the BizSocials community, define the schedule, and manage registrations.',
    icon: 'CalendarDays',
    primaryAction: 'Start event draft',
    checklist: ['Event title', 'Date and time', 'Location or virtual link', 'Audience and RSVP settings'],
  },
  '/marketplace': {
    eyebrow: 'Marketplace',
    title: 'List Product or Service',
    description: 'Create a marketplace listing with pricing, media, and business details for discovery by members.',
    icon: 'Store',
    primaryAction: 'Create listing draft',
    checklist: ['Listing title', 'Price and category', 'Description and media', 'Delivery or service details'],
  },
  '/groups': {
    eyebrow: 'Groups',
    title: 'Create Group',
    description: 'Launch a focused community group around your business niche, audience, or shared goals.',
    icon: 'Users',
    primaryAction: 'Create group draft',
    checklist: ['Group name', 'Purpose and guidelines', 'Privacy and membership settings', 'Initial welcome post'],
  },
}

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
      return <FeedPage />
    }

    if (route === '/pitch-reels') {
      return <PitchReelsPage onNavigate={navigateTo} />
    }

    if (route === '/create-pitch-reel') {
      return <CreatePitchReelPage onNavigate={navigateTo} />
    }

    if (route === '/create-post') {
      return <CreatePostPage onNavigate={navigateTo} />
    }

    if (route === '/profile') {
      return <ProfilePage user={user} />
    }

    if (route === '/settings') {
      return <AccountSettingsPage user={user} />
    }

    if (featureRoutes[route]) {
      return <FeatureActionPage {...featureRoutes[route]} />
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
