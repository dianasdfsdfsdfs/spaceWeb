import { useProgress } from '@react-three/drei'

export default function Loader() {
  const { active, progress } = useProgress()
  if (!active && progress >= 100) return null
  return (
    <div className={`loader ${!active ? 'is-done' : ''}`}>
      <div className="loader-orbit">
        <span className="loader-planet" />
      </div>
      <p className="loader-text">Charting the Solar System… {Math.round(progress)}%</p>
    </div>
  )
}
