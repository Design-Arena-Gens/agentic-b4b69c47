'use client'

import { useState, useRef, useEffect } from 'react'

interface Target {
  id: number
  x: number
  y: number
  size: number
  hit: boolean
}

export default function MobileArenaTargeting() {
  const [targets, setTargets] = useState<Target[]>([])
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [gameActive, setGameActive] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null)
  const arenaRef = useRef<HTMLDivElement>(null)
  const targetIdRef = useRef(0)

  const getDifficultySettings = () => {
    switch (difficulty) {
      case 'easy':
        return { size: 80, spawnRate: 1500, maxTargets: 3 }
      case 'medium':
        return { size: 60, spawnRate: 1200, maxTargets: 5 }
      case 'hard':
        return { size: 40, spawnRate: 900, maxTargets: 7 }
    }
  }

  const spawnTarget = () => {
    if (!arenaRef.current || !gameActive) return

    const settings = getDifficultySettings()
    const arena = arenaRef.current.getBoundingClientRect()
    const padding = settings.size

    const newTarget: Target = {
      id: targetIdRef.current++,
      x: Math.random() * (arena.width - padding * 2) + padding,
      y: Math.random() * (arena.height - padding * 2) + padding,
      size: settings.size,
      hit: false,
    }

    setTargets((prev) => {
      const active = prev.filter((t) => !t.hit)
      if (active.length >= settings.maxTargets) return prev
      return [...prev, newTarget]
    })
  }

  const handleTargetHit = (targetId: number, event: React.TouchEvent | React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    setTargets((prev) =>
      prev.map((t) => (t.id === targetId ? { ...t, hit: true } : t))
    )
    setScore((s) => s + 1)

    setTimeout(() => {
      setTargets((prev) => prev.filter((t) => t.id !== targetId))
    }, 300)
  }

  const handleArenaMiss = (event: React.TouchEvent | React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('target')) return

    event.preventDefault()
    setMisses((m) => m + 1)

    if ('touches' in event) {
      const touch = event.touches[0]
      setTouchPos({ x: touch.clientX, y: touch.clientY })
    } else {
      setTouchPos({ x: event.clientX, y: event.clientY })
    }

    setTimeout(() => setTouchPos(null), 300)
  }

  const startGame = () => {
    setGameActive(true)
    setScore(0)
    setMisses(0)
    setAccuracy(0)
    setTargets([])
    targetIdRef.current = 0
  }

  const stopGame = () => {
    setGameActive(false)
    setTargets([])
  }

  useEffect(() => {
    if (!gameActive) return

    const settings = getDifficultySettings()
    const interval = setInterval(spawnTarget, settings.spawnRate)

    return () => clearInterval(interval)
  }, [gameActive, difficulty])

  useEffect(() => {
    const total = score + misses
    if (total > 0) {
      setAccuracy(Math.round((score / total) * 100))
    }
  }, [score, misses])

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🎯 Mobile Arena Targeting</h1>
        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Score:</span>
            <span style={styles.statValue}>{score}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Misses:</span>
            <span style={styles.statValue}>{misses}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Accuracy:</span>
            <span style={styles.statValue}>{accuracy}%</span>
          </div>
        </div>
      </div>

      {!gameActive && (
        <div style={styles.menu}>
          <h2 style={styles.menuTitle}>Select Difficulty</h2>
          <div style={styles.difficultyButtons}>
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                style={{
                  ...styles.difficultyButton,
                  ...(difficulty === level ? styles.difficultyButtonActive : {}),
                }}
              >
                {level.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={startGame} style={styles.startButton}>
            START GAME
          </button>
        </div>
      )}

      {gameActive && (
        <>
          <div
            ref={arenaRef}
            onTouchStart={handleArenaMiss}
            onMouseDown={handleArenaMiss}
            style={styles.arena}
          >
            {targets.map((target) => (
              <div
                key={target.id}
                className="target"
                onTouchStart={(e) => handleTargetHit(target.id, e)}
                onMouseDown={(e) => handleTargetHit(target.id, e)}
                style={{
                  ...styles.target,
                  left: target.x - target.size / 2,
                  top: target.y - target.size / 2,
                  width: target.size,
                  height: target.size,
                  opacity: target.hit ? 0 : 1,
                  transform: target.hit ? 'scale(1.5)' : 'scale(1)',
                  backgroundColor: target.hit ? '#4ade80' : '#ef4444',
                }}
              />
            ))}

            {touchPos && (
              <div
                style={{
                  ...styles.missIndicator,
                  left: touchPos.x - 15,
                  top: touchPos.y - 15,
                }}
              >
                ✕
              </div>
            )}
          </div>

          <button onClick={stopGame} style={styles.stopButton}>
            STOP GAME
          </button>
        </>
      )}

      <div style={styles.instructions}>
        <p style={styles.instructionText}>
          Tap the red targets as fast as you can! Avoid tapping empty space.
        </p>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    padding: '20px',
    backgroundColor: '#1e293b',
    borderBottom: '2px solid #334155',
  },
  title: {
    margin: '0 0 15px 0',
    fontSize: '24px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '10px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  menu: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    gap: '30px',
  },
  menuTitle: {
    fontSize: '20px',
    margin: 0,
  },
  difficultyButtons: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  difficultyButton: {
    padding: '15px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: '2px solid #475569',
    borderRadius: '8px',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  difficultyButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  startButton: {
    padding: '20px 50px',
    fontSize: '20px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#22c55e',
    color: '#ffffff',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s',
  },
  arena: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#1e293b',
    margin: '20px',
    borderRadius: '12px',
    border: '2px solid #334155',
    minHeight: '400px',
    touchAction: 'none',
    userSelect: 'none',
  },
  target: {
    position: 'absolute',
    borderRadius: '50%',
    border: '3px solid #ffffff',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
    touchAction: 'none',
  },
  missIndicator: {
    position: 'absolute',
    fontSize: '30px',
    color: '#fbbf24',
    fontWeight: 'bold',
    animation: 'fadeOut 0.3s',
    pointerEvents: 'none',
  },
  stopButton: {
    margin: '0 20px 20px 20px',
    padding: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    cursor: 'pointer',
  },
  instructions: {
    padding: '15px 20px',
    backgroundColor: '#1e293b',
    borderTop: '2px solid #334155',
  },
  instructionText: {
    margin: 0,
    fontSize: '14px',
    textAlign: 'center',
    color: '#94a3b8',
  },
}
