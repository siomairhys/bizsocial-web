import Card from '../common/Card'

import affluentialLogo from '../../assets/affluential.png'
import excelMediaLogo from '../../assets/excel-media.webp'
import fundableFuturesLogo from '../../assets/fundable-futures-logo.png'
import nextInvestLogo from '../../assets/Next Invest.jpg'
import reimagineLogo from '../../assets/reimagine.png'
import travelEsimLogo from '../../assets/Travel Esim.jpg'

const assetSponsorColumns = [
  {
    title: 'Fundable Futures',
    featured: true,
    items: [{ name: 'Fundable Futures', image: fundableFuturesLogo }],
    description: 'Helping over a thousand underserved businesses get access to business credit',
  },
  {
    title: 'Co-Title Sponsor',
    items: [
      { name: 'Next Invest', image: nextInvestLogo },
      { name: 'Travel eSIM', image: travelEsimLogo },
    ],
  },
  {
    title: 'Platinum Sponsor',
    items: [
      { name: 'Reimagine IT', image: reimagineLogo },
      { name: 'Excel Media Co', image: excelMediaLogo },
      { name: 'Affluential Magazine', image: affluentialLogo },
    ],
  },
]

function normalizeSponsorColumns(sponsors) {
  if (!Array.isArray(sponsors) || sponsors.length === 0) {
    return assetSponsorColumns
  }

  const hasImageSponsors = sponsors.some((group) =>
    Array.isArray(group.items)
      ? group.items.some((item) => item?.image || item?.image_url || item?.logo_url)
      : false,
  )

  if (!hasImageSponsors) {
    return assetSponsorColumns
  }

  return sponsors.map((group) => ({
    title: group.title,
    featured: group.featured,
    description: group.description,
    items: (group.items || []).map((item) => ({
      name: item.name || item.label || 'Sponsor',
      image: item.image || item.image_url || item.logo_url,
    })),
  }))
}

function SponsorStrip({ sponsors }) {
  const sponsorColumns = normalizeSponsorColumns(sponsors)

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid divide-y divide-slate-200 lg:grid-cols-[1.2fr_1fr_1.25fr] lg:divide-x lg:divide-y-0">
        {sponsorColumns.map((group) => (
          <div key={group.title} className="min-w-0 px-4 py-3">
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {group.title}
            </p>
            <div className={`flex items-center justify-center gap-3 ${group.featured ? 'lg:justify-start' : ''}`}>
              {group.items.map((item) => (
                <img
                  key={item.name}
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className={`max-h-14 min-w-0 object-contain ${group.featured ? 'h-14 w-24 flex-none' : 'h-12 w-24'}`}
                />
              ))}
              {group.description ? (
                <p className="max-w-[230px] text-center font-serif text-sm font-bold leading-5 text-blue-900 sm:text-base lg:text-left">
                  {group.description}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default SponsorStrip
