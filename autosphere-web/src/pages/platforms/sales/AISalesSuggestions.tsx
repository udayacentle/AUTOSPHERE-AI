import { Link } from 'react-router-dom'
import SalesScreen from './SalesScreen'
import { api, type SalesAISuggestionsData } from '../../api/client'
import { useApiData } from '../../hooks/useApiData'
import { useI18n } from '../../i18n/context'
import { FALLBACK_SALES_AI_SUGGESTIONS } from './salesFallbackData'
import './SalesSection.css'

export default function AISalesSuggestions() {
  const { t } = useI18n()
  const { data, loading, error, refetch } = useApiData<SalesAISuggestionsData>(() => api.getSalesAISuggestions())
  const displayData = (data != null && typeof data === 'object') ? data : (error ? FALLBACK_SALES_AI_SUGGESTIONS : null)
  const nextBest = displayData?.nextBestAction
  const talkingPoints = displayData?.talkingPoints ?? []
  const vehicleRecs = displayData?.vehicleRecommendations ?? []

  if (loading && !displayData) {
    return (
      <SalesScreen title="AI Sales Suggestions" subtitle="AI-powered next-best-action and talking points">
        <p className="sales-loading">{t('common.loading')}</p>
      </SalesScreen>
    )
  }
  if (!displayData) {
    return (
      <SalesScreen title="AI Sales Suggestions" subtitle="AI-powered next-best-action and talking points">
        <div className="sales-error">
          <p>Could not load AI suggestions.</p>
          <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
      </SalesScreen>
    )
  }

  const isLive = !error && displayData?.dataSource === 'live'

  return (
    <SalesScreen title="AI Sales Suggestions" subtitle="AI-powered next-best-action and talking points">
      <div className="sales-page">
        <div className="sales-toolbar">
          <span className={`sales-badge ${isLive ? 'sales-badge-live' : 'sales-badge-sample'}`}>
            {isLive ? 'Live data' : 'Sample data'}
          </span>
          {displayData?.lastUpdated && (
            <span className="sales-meta">Last updated: {new Date(displayData.lastUpdated).toLocaleString()}</span>
          )}
          <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
        </div>
        {error && (
          <div className="sales-sample-banner">
            <span>{t('common.sampleDataBanner')}</span>
            <button type="button" className="sales-btn" onClick={() => refetch()}>{t('common.refresh')}</button>
          </div>
        )}
        <nav className="sales-quick-links">
          <Link to="sales-dashboard">Dashboard</Link>
          <Link to="lead-assignment-scoring">Leads</Link>
          <Link to="follow-up-scheduler">Follow-ups</Link>
        </nav>
        {nextBest && (
          <section className="sales-section">
            <h3>Next best action</h3>
            <p className="sales-desc">Suggested follow-up: call, email, offer, vehicle match.</p>
            <div className="card" style={{ padding: '1rem' }}>
              <p><strong>Lead:</strong> {nextBest.leadId} · <strong>Action:</strong> {nextBest.action} · <strong>Priority:</strong> {nextBest.priority}</p>
              <p>{nextBest.reason}</p>
            </div>
          </section>
        )}
        <section className="sales-section">
          <h3>Talking points</h3>
          <p className="sales-desc">Per-lead prompts and objections.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {talkingPoints.map((tp) => (
              <li key={tp.leadId} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                <strong>Lead {tp.leadId}:</strong>
                <ul style={{ margin: '0.35rem 0 0 1.25rem' }}>
                  {(tp.points ?? []).map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          {talkingPoints.length === 0 && <p className="sales-empty">No talking points.</p>}
        </section>
        <section className="sales-section">
          <h3>Vehicle recommendations</h3>
          <p className="sales-desc">Match inventory to customer preference and budget.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {vehicleRecs.map((vr) => (
              <li key={vr.leadId} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                <strong>Lead {vr.leadId}:</strong> {vr.vehicles?.join(', ') ?? '—'} — {vr.matchReason}
              </li>
            ))}
          </ul>
          {vehicleRecs.length === 0 && <p className="sales-empty">No vehicle recommendations.</p>}
        </section>
      </div>
    </SalesScreen>
  )
}
