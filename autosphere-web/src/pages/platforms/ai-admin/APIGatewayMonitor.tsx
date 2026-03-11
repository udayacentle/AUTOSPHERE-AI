import AIAdminScreen from './AIAdminScreen'

export default function APIGatewayMonitor() {
  return (
    <AIAdminScreen
      title="API Gateway Monitor"
      subtitle="Monitor API usage, latency, and errors"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Traffic & latency</h3>
          <p>Requests/sec, latency p50/p95/p99 by endpoint.</p>
        </div>
        <div className="card">
          <h3>Errors & rate limits</h3>
          <p>4xx/5xx rates; rate limit hits; by client.</p>
        </div>
        <div className="card">
          <h3>Quotas & keys</h3>
          <p>API keys, quotas, usage per key or tenant.</p>
        </div>
      </div>
    </AIAdminScreen>
  )
}
