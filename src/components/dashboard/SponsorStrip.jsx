import Card from '../common/Card'
import PlaceholderImage from '../common/PlaceholderImage'

const sponsorColumns = [
  {
    title: 'Fundable Futures',
    items: ['Logo', 'Logo'],
  },
  {
    title: 'Co-Title Sponsor',
    items: ['Logo', 'Logo'],
  },
  {
    title: 'Platinum Sponsor',
    items: ['Logo', 'Logo', 'Logo'],
  },
]

function SponsorStrip() {
  return (
    <Card className="p-3 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sponsorColumns.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {group.title}
            </p>
            <div className="flex items-center justify-center gap-2">
              {group.items.map((item, idx) => (
                <PlaceholderImage
                  key={`${group.title}-${idx}`}
                  label={item}
                  variant="logo"
                  className="h-11 w-20"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default SponsorStrip
