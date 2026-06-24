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

function Dashboard() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,72%)_minmax(0,28%)] 2xl:grid-cols-[minmax(0,70%)_minmax(0,30%)]">
      <div className="min-w-0 space-y-4">
        <WelcomeBanner />
        <SponsorStrip />
        <MetricsGrid />
        <div className="grid gap-4 2xl:grid-cols-2">
          <FundMeCampaignCard />
          <BizQuestChallengeCard />
        </div>
        <div className="grid gap-4 2xl:grid-cols-2">
          <div className="space-y-4">
            <RecentActivity />
            <TopGroups />
          </div>
          <div className="space-y-4">
            <LearningHub />
            <MarketplaceSpotlight />
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:h-fit">
        <CredTrackOverview />
        <BalanceSummaryCards />
        <UpcomingEvents />
        <MessagePreview />
      </div>
    </div>
  )
}

export default Dashboard
