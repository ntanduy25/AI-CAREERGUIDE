import { StateCard } from '../components/StateCard'

export const HomePage = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <StateCard title="AI CareerGuide" message="Nền tảng tư vấn ngành học có giải thích cho học sinh THPT Việt Nam." />
    <StateCard title="Kiến trúc" message="Monorepo gồm backend FastAPI + frontend React với mô-đun độc lập." />
  </div>
)
