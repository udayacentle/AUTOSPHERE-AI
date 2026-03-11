import SalesScreen from './SalesScreen'

export default function FollowUpScheduler() {
  return (
    <SalesScreen
      title="Follow-Up Scheduler"
      subtitle="Schedule and manage follow-up tasks"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Upcoming follow-ups</h3>
          <p>Calendar view: calls, meetings, test drives due.</p>
        </div>
        <div className="card">
          <h3>Set reminder</h3>
          <p>Add follow-up for a lead or deal with date/time.</p>
        </div>
        <div className="card">
          <h3>Overdue</h3>
          <p>Missed follow-ups and reschedule options.</p>
        </div>
      </div>
    </SalesScreen>
  )
}
