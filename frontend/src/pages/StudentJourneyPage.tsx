import { AssessmentPanel } from '../features/assessments/AssessmentPanel'
import { ProfilePanel } from '../features/student-journey/ProfilePanel'
import { RecommendationPanel } from '../features/recommendations/RecommendationPanel'
import { RoadmapPanel } from '../features/roadmap/RoadmapPanel'

export const StudentJourneyPage = () => (
  <div className="space-y-4">
    <ProfilePanel />
    <AssessmentPanel />
    <RecommendationPanel />
    <RoadmapPanel />
  </div>
)
