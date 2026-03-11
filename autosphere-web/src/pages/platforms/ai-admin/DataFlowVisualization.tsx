import AIAdminScreen from './AIAdminScreen'

export default function DataFlowVisualization() {
  return (
    <AIAdminScreen
      title="Data Flow Visualization"
      subtitle="Visualize data pipelines and lineage"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Pipeline view</h3>
          <p>Sources, transforms, sinks; DAG or flowchart.</p>
        </div>
        <div className="card">
          <h3>Lineage</h3>
          <p>Trace data from input to model or output.</p>
        </div>
        <div className="card">
          <h3>Quality & schema</h3>
          <p>Data quality checks; schema at each stage.</p>
        </div>
      </div>
    </AIAdminScreen>
  )
}
