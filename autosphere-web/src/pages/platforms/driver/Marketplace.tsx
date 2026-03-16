import { useState, useEffect } from 'react'
import DriverScreen from './DriverScreen'
import {
  api,
  type DriverMarketplaceData,
  type MarketplaceCategoryItem,
  type MarketplaceListingItem,
} from '../../../api/client'
import { useI18n } from '../../../i18n/context'
import './Marketplace.css'

const FALLBACK_MARKETPLACE: DriverMarketplaceData = {
  categories: [
    { id: 'accessories', name: 'Accessories', description: 'Gadgets, interior, exterior' },
    { id: 'services', name: 'Services', description: 'Detailing, repairs, insurance' },
    { id: 'deals', name: 'Deals', description: 'Offers and discounts' },
  ],
  listings: [
    { id: 'mp-1', categoryId: 'accessories', title: 'Dash cam Pro', description: '1080p dual-channel dash cam with night vision', price: 89.99, currency: 'USD', featured: true },
    { id: 'mp-2', categoryId: 'accessories', title: 'All-weather floor mats', description: 'Custom-fit rubber mats', price: 129.99, currency: 'USD', featured: false },
    { id: 'mp-4', categoryId: 'services', title: 'Full interior detailing', description: 'Deep clean, leather conditioning', price: 149, currency: 'USD', featured: true },
    { id: 'mp-7', categoryId: 'deals', title: '20% off first service', description: 'New customer discount', price: 0, currency: 'USD', featured: true, discount: '20% off' },
  ],
  currency: 'USD',
}

const CATEGORY_KEYS: Record<string, string> = {
  accessories: 'accessories',
  services: 'services',
  deals: 'deals',
}

export default function Marketplace() {
  const { t } = useI18n()
  const [categoryId, setCategoryId] = useState<string>('')
  const [data, setData] = useState<DriverMarketplaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const marketplace = data ?? (error ? FALLBACK_MARKETPLACE : null)
  const categories = marketplace?.categories ?? []
  const listings = marketplace?.listings ?? []

  useEffect(() => {
    setLoading(true)
    setError(false)
    api
      .getDriverMarketplace(categoryId || undefined)
      .then(setData)
      .catch(() => {
        setError(true)
        setData(FALLBACK_MARKETPLACE)
      })
      .finally(() => setLoading(false))
  }, [categoryId])

  const categoryLabel = (cat: MarketplaceCategoryItem) => {
    const key = CATEGORY_KEYS[cat.id]
    return key ? t(`marketplace.${key}`) : cat.name
  }

  return (
    <DriverScreen
      title="Marketplace"
      subtitle="Products and services for your vehicle"
    >
      <div className="marketplace-page">
        {error && (
          <p
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'var(--bg-elevated)',
              borderRadius: 8,
            }}
          >
            {t('fleet.showingSampleData')}
          </p>
        )}

        {marketplace && (
          <>
            <section className="card marketplace-card" style={{ marginBottom: '1.5rem' }}>
              <h3>{t('marketplace.filterBy')}</h3>
              <div className="marketplace-filters">
                <button
                  type="button"
                  className={`marketplace-filter-btn ${!categoryId ? 'marketplace-filter-btn--active' : ''}`}
                  onClick={() => setCategoryId('')}
                >
                  {t('marketplace.allCategories')}
                </button>
                {categories.map((cat: MarketplaceCategoryItem) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`marketplace-filter-btn ${categoryId === cat.id ? 'marketplace-filter-btn--active' : ''}`}
                    onClick={() => setCategoryId(cat.id)}
                  >
                    {categoryLabel(cat)}
                  </button>
                ))}
              </div>
            </section>

            {loading ? (
              <p style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
            ) : listings.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>{t('marketplace.noListings')}</p>
            ) : (
              <section className="marketplace-list">
                {listings.map((item: MarketplaceListingItem) => (
                  <div
                    key={item.id}
                    className={`card marketplace-card marketplace-listing ${item.featured ? 'marketplace-listing--featured' : ''}`}
                  >
                    {item.featured && (
                      <span className="marketplace-badge">{t('marketplace.featured')}</span>
                    )}
                    <h4 className="marketplace-listing-title">{item.title}</h4>
                    <p className="marketplace-listing-desc">{item.description}</p>
                    <div className="marketplace-listing-footer">
                      {item.discount ? (
                        <span className="marketplace-listing-discount">{item.discount}</span>
                      ) : (
                        <span className="marketplace-listing-price">
                          {t('marketplace.price')}: {item.currency} {item.price > 0 ? item.price.toFixed(2) : '—'}
                        </span>
                      )}
                      <span className="marketplace-listing-link">{t('marketplace.viewDetails')}</span>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </>
        )}

        {!marketplace && !loading && (
          <p style={{ color: 'var(--danger)' }}>Unable to load marketplace.</p>
        )}
      </div>
    </DriverScreen>
  )
}
