import DriverScreen from './DriverScreen'

export default function ClaimsUpload() {
  return (
    <DriverScreen
      title="Claims Upload & AI Damage Assessment"
      subtitle="Upload photos for AI damage estimate"
    >
      <div className="card-grid">
        <div className="card">
          <h3>Upload photos</h3>
          <p>Damage images</p>
        </div>
        <div className="card">
          <h3>AI assessment</h3>
          <p>Estimated cost & parts</p>
        </div>
        <div className="card">
          <h3>Submit claim</h3>
          <p>Send to insurer</p>
        </div>
      </div>
    </DriverScreen>
  )
}
