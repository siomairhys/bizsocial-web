import { useEffect, useState } from 'react'

import BalanceSummaryCards from '../components/dashboard/BalanceSummaryCards'
import BizQuestChallengeCard from '../components/dashboard/BizQuestChallengeCard'
import CredTrackOverview from '../components/dashboard/CredTrackOverview'
import FundMeCampaignCard from '../components/dashboard/FundMeCampaignCard'
import LearningHub from '../components/dashboard/LearningHub'
import MarketplaceSpotlight from '../components/dashboard/MarketplaceSpotlight'
import MessagePreview from '../components/dashboard/MessagePreview'
import MetricsGrid from '../components/dashboard/MetricsGrid'
import RecentActivity from '../components/dashboard/RecentActivity'
import SponsorStrip from '../components/dashboard/SponsorStrip'
import TopGroups from '../components/dashboard/TopGroups'
import UpcomingEvents from '../components/dashboard/UpcomingEvents'
import WelcomeBanner from '../components/dashboard/WelcomeBanner'
import { useAuth } from '../modules/auth/context/useAuth'
import { dashboardRepository } from '../repositories/dashboardRepository'

function Dashboard() {
  const { token, user } = useAuth()
  const [overviewData, setOverviewData] = useState(null)

  useEffect(() => {
    let active = true

    async function loadDashboardOverview() {
      if (!token) {
        return
      }

      try {
        const nextData = await dashboardRepository.getOverview(token)
        if (active) {
          setOverviewData(nextData)
        }
      } catch (error) {
        console.error('Failed to load dashboard overview:', error)
        if (active) {
          setOverviewData(null)
        }
      }
    }

    loadDashboardOverview()

    return () => {
      active = false
    }
  }, [token])

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,72%)_minmax(0,28%)] 2xl:grid-cols-[minmax(0,70%)_minmax(0,30%)]">
      <div className="min-w-0 space-y-4">
        <WelcomeBanner user={user} />
        <SponsorStrip sponsors={overviewData?.sponsors} />
        <MetricsGrid metrics={overviewData?.metrics} />
        <div className="grid gap-4 2xl:grid-cols-2">
          <FundMeCampaignCard campaign={overviewData?.campaignSummary} />
          <BizQuestChallengeCard challenge={overviewData?.challenge} />
        </div>
        <div className="grid gap-4 2xl:grid-cols-2">
          <div className="space-y-4">
            <RecentActivity activities={overviewData?.recentActivity} />
            <TopGroups groups={overviewData?.topGroups} />
          </div>
          <div className="space-y-4">
            <LearningHub courses={overviewData?.learningCourses} />
            <MarketplaceSpotlight products={overviewData?.marketplaceProducts} />
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-4 xl:self-start">
        <CredTrackOverview overview={overviewData?.credTrack} />
        <BalanceSummaryCards summary={overviewData?.balanceSummary} />
        <UpcomingEvents events={overviewData?.upcomingEvents} />
        <MessagePreview messages={overviewData?.messages} />
      </div>
    </div>
  )
}

export default Dashboard
