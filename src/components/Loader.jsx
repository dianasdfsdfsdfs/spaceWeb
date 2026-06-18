import { useProgress } from '@react-three/drei'

export default function Loader() {
  const { active, progress } = useProgress()
  if (!active && progress >= 100) return null
  return (
    <div className={`loader ${!active ? 'is-done' : ''}`}>
      <div className="loader-brand">
        COSMOS<span>EXPLORER</span>
      </div>
      <div className="loader-orbit">
        <span className="loader-planet" />
      </div>
      <p className="loader-text">Loading… {Math.round(progress)}%</p>
    </div>
  )
}
