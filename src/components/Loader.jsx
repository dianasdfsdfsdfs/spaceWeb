import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

export default function Loader({ onDone }) {
  const { active, progress } = useProgress()
  const [fading, setFading] = useState(false)
  const finished = useRef(false)

  useEffect(() => {
    const finish = () => {
      if (finished.current) return
      finished.current = true
      setFading(true)
      setTimeout(() => onDone?.(), 700) // after the fade-out
    }
    // hold briefly once assets are loaded, then fade; safety net if it stalls
    const holdT = !active && progress >= 100 ? setTimeout(finish, 400) : null
    const safetyT = setTimeout(finish, 15000)
    return () => {
      if (holdT) clearTimeout(holdT)
      clearTimeout(safetyT)
    }
  }, [active, progress, onDone])

  return (
    <div className={`loader ${fading ? 'is-done' : ''}`}>
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
