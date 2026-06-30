import Card from '../common/Card'
import PlaceholderImage from '../common/PlaceholderImage'
import SectionHeader from '../common/SectionHeader'

function MarketplaceSpotlight({ products }) {
  const items = Array.isArray(products) ? products : []

  return (
    <Card>
      <SectionHeader title="Marketplace Spotlight" action="View Marketplace" />
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 ? (
          <p className="sm:col-span-2 xl:col-span-3 text-sm text-slate-500">Marketplace spotlight is not connected to database yet.</p>
        ) : null}
        {items.map((product) => (
          <article key={product.title} className="rounded-xl border border-slate-200 p-2">
            <PlaceholderImage label="Product" variant="thumbnail" className="h-20 w-full" />
            <h4 className="mt-2 text-sm font-semibold text-slate-900">{product.title}</h4>
            <p className="text-xs text-slate-500">{product.seller}</p>
            <p className="mt-1 text-sm font-bold text-blue-700">{product.price}</p>
          </article>
        ))}
      </div>
    </Card>
  )
}

export default MarketplaceSpotlight
