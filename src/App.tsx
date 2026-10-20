import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { memories } from './data/memories'

type ScreenName =
  | 'delivery'
  | 'greeting'
  | 'map'
  | 'memory'
  | 'catch'
  | 'quest'
  | 'question'
  | 'penguins'
  | 'cake'
  | 'birthday'
  | 'slide'
  | 'hug'

type HeartKind = 'pink' | 'golden' | 'chocolate' | 'broken'

type FallingItem = {
  id: number
  x: number
  y: number
  speed: number
  kind: HeartKind
}

type PenguinCard = {
  id: number
  name: string
  message: string
  mood: string
}

type MemoryPhoto = (typeof memories)[number]

const mapLocations = [
  { key: 'memory', title: 'Memory Lane', emoji: '📷' },
  { key: 'catch', title: 'Catch My Hearts', emoji: '💗' },
  { key: 'quest', title: 'Penguin Quest', emoji: '🐧' },
  { key: 'question', title: 'Question Corner', emoji: '💬' },
  { key: 'penguins', title: 'Click the Penguins', emoji: '🐧' },
  { key: 'cake', title: 'Birthday Cake Cafe', emoji: '🎂' },
] as const

const penguinCards: PenguinCard[] = [
  { id: 1, name: 'Shy Penguin', mood: 'shy', message: 'Psst... she likes you more than you know.' },
  { id: 2, name: 'Dramatic Penguin', mood: 'dramatic', message: 'She\'s fallen for you. Literally.' },
  { id: 3, name: 'Sleepy Penguin', mood: 'sleepy', message: 'Even when she\'s sleepy, you\'re her favourite thought.' },
  { id: 4, name: 'Jealous Penguin', mood: 'jealous', message: 'Excuse me, where are you going?' },
  { id: 5, name: 'Delivery Penguin', mood: 'delivery', message: 'Special delivery: one forehead kiss.' },
  { id: 6, name: 'Dancing Penguin', mood: 'dance', message: 'This is how happy you make her.' },
  { id: 7, name: 'Crybaby Penguin', mood: 'cry', message: 'Okay fine, I forgive you. Kiss?' },
  { id: 8, name: 'Secret Penguin', mood: 'secret', message: 'You\'re her favourite person, you know.' },
]

const pageCopy = {
  birthdayTitle: 'Happy Birthday to My Future Husband ❤️',
  birthdayText:
    'To my Love,\n\nI hope this birthday brings you all the happiness, success, love, and beautiful things you deserve.\n\nI hope I get to celebrate many more birthdays with you.\n\nWith all my love,\nYour Home Minister ❤️',
}

const heartValues = {
  pink: 10,
  golden: 25,
  chocolate: 15,
  broken: -1,
} as const

const mazeRoute = [
  { x: 14, y: 78 },
  { x: 22, y: 71 },
  { x: 30, y: 64 },
  { x: 38, y: 58 },
  { x: 47, y: 46 },
  { x: 56, y: 38 },
  { x: 66, y: 28 },
  { x: 78, y: 18 },
  { x: 88, y: 18 },
]

const activeMazePoints = (points: Array<{ x: number; y: number }>) => (points.length > 1 ? points : mazeRoute)

function App() {
  const [screen, setScreen] = useState<ScreenName>('delivery')
  const [musicOn, setMusicOn] = useState(false)
  const [deliveryOpened, setDeliveryOpened] = useState(false)
  const [scrapbookPage, setScrapbookPage] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryPhoto | null>(null)
  const [photoFlipped, setPhotoFlipped] = useState(false)
  const [catchScore, setCatchScore] = useState(0)
  const [catchTimeLeft, setCatchTimeLeft] = useState(45)
  const [catchLives, setCatchLives] = useState(3)
  const [basketX, setBasketX] = useState(50)
  const [catchItems, setCatchItems] = useState<FallingItem[]>([])
  const [catchToast, setCatchToast] = useState('')
  const [catchGameOver, setCatchGameOver] = useState(false)
  const [catchEndingText, setCatchEndingText] = useState('No problem, darling. Anyway, my heart is already yours.')
  const [questMessage, setQuestMessage] = useState('Draw a warm little path to home, sweetheart.')
  const [questWon, setQuestWon] = useState(false)
  const [mazePath, setMazePath] = useState<Array<{ x: number; y: number }>>([])
  const [mazeDrawing, setMazeDrawing] = useState(false)
  const [noAttempts, setNoAttempts] = useState(0)
  const [yesClicked, setYesClicked] = useState(false)
  const [noButtonPos, setNoButtonPos] = useState({ x: 62, y: 70 })
  const [clickedPenguins, setClickedPenguins] = useState<number[]>([])
  const [selectedPenguin, setSelectedPenguin] = useState<PenguinCard | null>(null)
  const [cakeBaked, setCakeBaked] = useState(false)
  const [cakeLit, setCakeLit] = useState(false)
  const [cakeBlown, setCakeBlown] = useState(false)
  const [smokeVisible, setSmokeVisible] = useState(false)
  const [birthdayReveal, setBirthdayReveal] = useState(false)
  const [hugPlayed, setHugPlayed] = useState(false)
  const [currentQuestionReaction, setCurrentQuestionReaction] = useState('')
  const audioContextRef = useRef<AudioContext | null>(null)
  const musicTimerRef = useRef<number | null>(null)

  const scrapbookPages = useMemo(() => {
    const chunkSize = 8
    return Array.from({ length: Math.ceil(memories.length / chunkSize) }, (_, pageIndex) =>
      memories.slice(pageIndex * chunkSize, pageIndex * chunkSize + chunkSize),
    )
  }, [])

  const resetCatchGame = () => {
    setCatchScore(0)
    setCatchTimeLeft(45)
    setCatchLives(3)
    setBasketX(50)
    setCatchItems([])
    setCatchToast('')
    setCatchGameOver(false)
    setCatchEndingText('No problem, darling. Anyway, my heart is already yours.')
  }

  const resetQuestGame = () => {
    setQuestMessage('Draw a warm little path to home, sweetheart.')
    setQuestWon(false)
    setMazePath([])
    setMazeDrawing(false)
  }

  const ensureNoPosition = (nextX: number, nextY: number) => {
    const yesX = 18
    const yesY = 72
    const overlapDistance = 12

    const dx = nextX - yesX
    const dy = nextY - yesY
    if (Math.abs(dx) < overlapDistance && Math.abs(dy) < overlapDistance) {
      return { x: Math.min(78, yesX + 18), y: Math.min(82, yesY + 18) }
    }

    return { x: Math.min(82, Math.max(8, nextX)), y: Math.min(80, Math.max(12, nextY)) }
  }

  const moveNoButton = () => {
    const nextX = Math.random() * 62 + 18
    const nextY = Math.random() * 62 + 20
    setNoButtonPos(ensureNoPosition(nextX, nextY))
  }

  const handleNoAttempt = () => {
    const nextAttempt = noAttempts + 1
    setNoAttempts(nextAttempt)
    if (nextAttempt === 1) {
      setCurrentQuestionReaction('Penguin looks shocked!')
    } else if (nextAttempt === 2) {
      setCurrentQuestionReaction('Penguin starts crying dramatically.')
    } else if (nextAttempt === 3) {
      setCurrentQuestionReaction('Penguin holds a sign: EXCUSE ME???')
    } else if (nextAttempt === 4) {
      setCurrentQuestionReaction('Penguin runs around in panic.')
    } else {
      setCurrentQuestionReaction('Penguin looks angry and says: WRONG ANSWER!')
    }
    moveNoButton()
  }

  useEffect(() => {
    if (!musicOn) {
      if (musicTimerRef.current) {
        window.clearTimeout(musicTimerRef.current)
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close()
        audioContextRef.current = null
      }
      return
    }

    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return

    const ctx = audioContextRef.current ?? new AudioContextCtor()
    audioContextRef.current = ctx
    const notes = [261.63, 329.63, 392.0, 329.63, 349.23, 440.0, 392.0, 349.23]
    let noteIndex = 0

    const playNote = () => {
      if (!musicOn || !audioContextRef.current) return
      const oscillator = audioContextRef.current.createOscillator()
      const gain = audioContextRef.current.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = notes[noteIndex % notes.length]
      gain.gain.value = 0.015
      oscillator.connect(gain)
      gain.connect(audioContextRef.current.destination)
      oscillator.start()
      oscillator.stop(audioContextRef.current.currentTime + 0.3)
      noteIndex += 1
      musicTimerRef.current = window.setTimeout(playNote, 420)
    }

    if (ctx.state === 'suspended') {
      void ctx.resume()
    }
    playNote()

    return () => {
      if (musicTimerRef.current) {
        window.clearTimeout(musicTimerRef.current)
      }
    }
  }, [musicOn])

  useEffect(() => {
    if (screen !== 'catch' || catchGameOver) return
    const tick = window.setInterval(() => {
      setCatchTimeLeft((previous) => {
        if (previous <= 1) {
          setCatchGameOver(true)
          return 0
        }
        return previous - 1
      })
    }, 1000)
    return () => window.clearInterval(tick)
  }, [screen, catchGameOver])

  useEffect(() => {
    if (screen !== 'catch' || catchGameOver) return
    const spawnInterval = window.setInterval(() => {
      const kinds: HeartKind[] = ['pink', 'golden', 'chocolate', 'broken']
      const kind = kinds[Math.floor(Math.random() * kinds.length)]
      const spawnX = Math.random() * 80 + 10
      setCatchItems((previous) => [
        ...previous,
        {
          id: Date.now() + Math.random(),
          x: spawnX,
          y: 4,
          speed: 1.1 + Math.random() * 1.2,
          kind,
        },
      ])
    }, 500)
    return () => window.clearInterval(spawnInterval)
  }, [screen, catchGameOver])

  useEffect(() => {
    if (screen !== 'catch' || catchGameOver) return
    const moveInterval = window.setInterval(() => {
      setCatchItems((previous) => {
        let nextScore = catchScore
        let nextLives = catchLives
        const remaining: FallingItem[] = []

        for (const item of previous) {
          const updatedY = item.y + item.speed
          const basketLeft = basketX - 12
          const basketRight = basketX + 12
          const collided = updatedY >= 78 && updatedY <= 90 && item.x >= basketLeft && item.x <= basketRight

          if (collided) {
            if (item.kind === 'broken') {
              nextLives -= 1
              setCatchLives(nextLives)
              setCatchToast('A broken heart! Be careful.')
            } else {
              nextScore += heartValues[item.kind]
              setCatchScore(nextScore)
              setCatchToast(item.kind === 'golden' ? 'Golden heart bonus!' : 'Caught a sweet little heart!')
            }
            continue
          }

          if (updatedY < 100) {
            remaining.push({ ...item, y: updatedY })
          }
        }

        if (nextLives <= 0) {
          setCatchLives(0)
          setCatchGameOver(true)
          setCatchEndingText('No problem, darling. Anyway, my heart is already yours.')
          setCatchToast('')
        }

        if (nextLives !== catchLives) {
          setCatchLives(nextLives)
        }

        return remaining
      })
    }, 30)
    return () => window.clearInterval(moveInterval)
  }, [screen, catchGameOver, catchScore, catchLives, basketX])

  useEffect(() => {
    if (screen !== 'catch') return
    if (catchScore >= 10 && catchScore < 25) {
      setCatchToast("Someone's good at catching feelings!")
    } else if (catchScore >= 25 && catchScore < 50) {
      setCatchToast('Certified boyfriend material.')
    } else if (catchScore >= 50) {
      setCatchToast('Stop stealing my heart!')
    }
  }, [catchScore, screen])

  useEffect(() => {
    if (screen !== 'quest') return
    if (mazePath.length < 4) return

    const lastPoint = mazePath[mazePath.length - 1]
    const endReached = Math.hypot(lastPoint.x - 88, lastPoint.y - 18) < 7

    if (endReached) {
      setQuestWon(true)
      setQuestMessage('Mission accomplished! You found your Home Minister. Unfortunately, she\'s permanently attached to you.')
    }
  }, [mazePath, screen])

  useEffect(() => {
    if (screen !== 'cake' || cakeBaked) return
    const timer = window.setTimeout(() => {
      setCakeBaked(true)
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [screen, cakeBaked])

  useEffect(() => {
    if (screen !== 'delivery') return
    if (deliveryOpened) {
      const timer = window.setTimeout(() => setScreen('greeting'), 1300)
      return () => window.clearTimeout(timer)
    }
  }, [screen, deliveryOpened])

  useEffect(() => {
    if (screen !== 'birthday') return
    const timer = window.setTimeout(() => setBirthdayReveal(true), 700)
    return () => window.clearTimeout(timer)
  }, [screen])

  useEffect(() => {
    if (screen !== 'hug') return
    if (hugPlayed) {
      setTimeout(() => {
        setHugPlayed(false)
      }, 1800)
    }
  }, [hugPlayed, screen])

  const renderPenguin = (mood: string, scale = 1) => (
    <div className="penguin-shell" style={{ transform: `scale(${scale})` }}>
      <div className={`penguin ${mood}`}>
        <div className="penguin-head">
          <span className="penguin-eye left" />
          <span className="penguin-eye right" />
          <span className="penguin-blush left" />
          <span className="penguin-blush right" />
          <span className="penguin-beak" />
        </div>
        <div className="penguin-body" />
        <div className="penguin-wing left" />
        <div className="penguin-wing right" />
        <div className="penguin-feet" />
      </div>
    </div>
  )

  const renderDeliveryScene = () => (
    <div className="page delivery-page">
      <div className="cloud cloud-one" />
      <div className="cloud cloud-two" />
      <div className="cloud cloud-three" />
      <motion.div
        className="delivery-penguin-wrap"
        animate={{ x: [0, 10, -10, 0], rotate: [0, -2, 1, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {renderPenguin('walking', 1.2)}
        <div className="envelope">💌</div>
      </motion.div>
      <div className="card soft-card delivery-card">
        <h1>URGENT LOVE DELIVERY! 💌</h1>
        <p className="tiny-copy">To: My Love</p>
        <p className="tiny-copy">From: Your Home Minister</p>
        <p className="subtext">Apparently someone very special was born today... and his girlfriend has been planning something suspiciously cute.</p>
        <button type="button" className="primary-button" onClick={() => { setDeliveryOpened(true); setScreen('delivery') }}>
          Open Your Surprise ❤️
        </button>
      </div>
      {deliveryOpened && (
        <div className="floating-hearts">
          {[...Array(18)].map((_, index) => (
            <motion.span
              key={`heart-${index}`}
              className="heart-pop"
              initial={{ opacity: 0, y: 40, x: 0 }}
              animate={{ opacity: 1, y: -140, x: index % 2 === 0 ? 18 : -18, scale: 1.3 }}
              transition={{ duration: 1.8, ease: 'easeOut', delay: index * 0.08 }}
            >
              ❤️
            </motion.span>
          ))}
        </div>
      )}
      <button type="button" className="music-toggle" onClick={() => setMusicOn((value) => !value)}>
        {musicOn ? '🔊 Music On' : '🔇 Music Off'}
      </button>
    </div>
  )

  const renderGreeting = () => (
    <div className="page greeting-page">
      <div className="two-penguins">
        {renderPenguin('blush', 1.22)}
        {renderPenguin('hug', 1.22)}
      </div>
      <div className="card soft-card welcome-card">
        <h1>Happiest Birthday, My Love!</h1>
        <p className="subtext">From your favourite headache, biggest fan, and permanent Home Minister.</p>
        <p className="tiny-copy">I was going to buy you the entire universe... but my budget said make him a website instead.</p>
        <button type="button" className="primary-button" onClick={() => setScreen('map')}>
          Begin Your Birthday Adventure
        </button>
      </div>
    </div>
  )

  const renderMap = () => (
    <div className="page map-page">
      <div className="card soft-card map-hero">
        <h2>Our Little Love Universe</h2>
      </div>
      <div className="mini-map-grid">
        {mapLocations.map((location) => (
          <motion.button
            key={location.key}
            type="button"
            className="map-node"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen(location.key as ScreenName)}
          >
            <div className="map-icon">{location.emoji}</div>
            <span>{location.title}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )

  const renderMemoryPage = () => {
    const pagePhotos = scrapbookPages[scrapbookPage] ?? []
    return (
      <div className="page scrapbook-page">
        <div className="scrapbook-header">
          <div>
            <h2>Memory Lane</h2>
            <p>Our scrapbook</p>
          </div>
          <button type="button" className="secondary-button" onClick={() => setScreen('map')}>Back to map</button>
        </div>
        <div className="scrapbook-grid">
          {pagePhotos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className={`photo-frame ${photo.frame}`}
              onClick={() => { setSelectedPhoto(photo); setPhotoFlipped(false) }}
              aria-label={photo.caption}
            >
              <img src={photo.src} alt={photo.label} style={{ objectPosition: photo.position }} />
              <span className="photo-caption">{photo.caption}</span>
            </button>
          ))}
        </div>

        <div className="scrapbook-nav">
          <button type="button" className="secondary-button" onClick={() => setScrapbookPage((page) => Math.max(0, page - 1))} disabled={scrapbookPage === 0}>
            Previous
          </button>
          <span>Page {scrapbookPage + 1}</span>
          <button type="button" className="secondary-button" onClick={() => setScrapbookPage((page) => Math.min(scrapbookPages.length - 1, page + 1))} disabled={scrapbookPage >= scrapbookPages.length - 1}>
            Next
          </button>
        </div>

        {selectedPhoto && (
          <div className="photo-overlay" onClick={() => setSelectedPhoto(null)}>
            <div className="photo-modal" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="close-button" onClick={() => setSelectedPhoto(null)}>×</button>
              <motion.div
                className="flip-card"
                animate={{ rotateY: photoFlipped ? 180 : 0 }}
                transition={{ duration: 0.7 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="flip-front">
                  <img src={selectedPhoto.src} alt={selectedPhoto.label} />
                </div>
                <div className="flip-back">
                  <p>{selectedPhoto.hiddenMessage}</p>
                </div>
              </motion.div>
              <div className="photo-text">
                <strong>{selectedPhoto.label}</strong>
                <p>{selectedPhoto.caption}</p>
              </div>
              <button type="button" className="secondary-button" onClick={() => setPhotoFlipped((value) => !value)}>
                {photoFlipped ? 'Show Photo' : 'Flip to Secret'}
              </button>
            </div>
          </div>
        )}

        {scrapbookPage === scrapbookPages.length - 1 && (
          <div className="closing-caption">
            <p>If I could relive these moments, I’d choose every single one with you.</p>
            <div className="hug-penguins">{renderPenguin('hug', 1)} {renderPenguin('hug', 1)}</div>
          </div>
        )}
      </div>
    )
  }

  const renderCatchGame = () => (
    <div className="page game-page">
      <div className="card game-header">
        <h2>Catch My Hearts, My Love!</h2>
        <div className="stats-row">
          <span>Score: {catchScore}</span>
          <span>Time: {catchTimeLeft}s</span>
          <span>Lives: {catchLives}</span>
        </div>
      </div>
      <div
        className="catch-zone"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          setBasketX(((event.clientX - rect.left) / rect.width) * 100)
        }}
        onTouchMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const touch = event.touches[0]
          setBasketX(((touch.clientX - rect.left) / rect.width) * 100)
        }}
      >
        {catchItems.map((item) => (
          <div
            key={item.id}
            className={`falling-item ${item.kind}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {item.kind === 'pink' ? '💗' : item.kind === 'golden' ? '💛' : item.kind === 'chocolate' ? '🍫' : '💔'}
          </div>
        ))}
        <motion.div
          className="basket"
          animate={{ left: `${basketX}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        >
          <div className="basket-body">🧺</div>
          <div className="penguin-basket">{renderPenguin('waddle', 0.58)}</div>
        </motion.div>
      </div>
      {catchToast && <p className="game-toast">{catchToast}</p>}
      {catchGameOver && (
        <div className="game-finish">
          <h3>{catchEndingText}</h3>
          <div className="hug-penguins">{renderPenguin('hug', 1)} {renderPenguin('hug', 1)}</div>
          <div className="button-row">
            <button type="button" className="primary-button" onClick={() => { resetCatchGame(); setScreen('catch') }}>Replay</button>
            <button type="button" className="secondary-button" onClick={() => setScreen('map')}>Back</button>
          </div>
        </div>
      )}
    </div>
  )

  const renderQuest = () => (
    <div className="page quest-page">
      <div className="card game-header">
        <h2>Operation: Find Your Home Minister</h2>
      </div>
      <div
        className="quest-track"
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const x = ((event.clientX - rect.left) / rect.width) * 100
          const y = ((event.clientY - rect.top) / rect.height) * 100
          setMazeDrawing(true)
          setMazePath([{ x, y }])
        }}
        onPointerMove={(event) => {
          if (!mazeDrawing) return
          const rect = event.currentTarget.getBoundingClientRect()
          const x = ((event.clientX - rect.left) / rect.width) * 100
          const y = ((event.clientY - rect.top) / rect.height) * 100
          setMazePath((previous) => {
            const last = previous[previous.length - 1]
            if (!last) return [{ x, y }]
            const dist = Math.hypot(x - last.x, y - last.y)
            if (dist < 3) return previous
            return [...previous, { x, y }]
          })
        }}
        onPointerUp={() => {
          setMazeDrawing(false)
          if (mazePath.length > 6) {
            const last = mazePath[mazePath.length - 1]
            const success = Math.hypot(last.x - 88, last.y - 18) < 7
            if (success) {
              setQuestWon(true)
              setQuestMessage('Mission accomplished! You found your Home Minister. Unfortunately, she\'s permanently attached to you.')
            } else {
              setQuestMessage('Almost! Try drawing a softer path toward the heart at the end.')
            }
          }
        }}
      >
        <div className="maze-start">♥</div>
        <div className="maze-end">🏠</div>
        <div className="maze-obstacle maze-wall-1" />
        <div className="maze-obstacle maze-wall-2" />
        <div className="maze-obstacle maze-wall-3" />
        <svg className="maze-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={activeMazePoints(mazePath).map((point) => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke="#f7d7e1"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={mazePath.length > 1 ? 0.85 : 1}
          />
          {mazePath.length > 1 && (
            <polyline
              points={mazePath.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke="#d98198"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        <motion.div
          className="quest-runner"
          animate={{ left: `${Math.min(88, mazePath[mazePath.length - 1]?.x ?? 14)}%`, top: `${Math.min(82, mazePath[mazePath.length - 1]?.y ?? 78)}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          {renderPenguin('waddle', 0.52)}
        </motion.div>
      </div>
      <p className="game-toast">{questMessage}</p>
      {questWon && (
        <div className="game-finish small-finish">
          <h3>{questMessage}</h3>
          <div className="hug-penguins">{renderPenguin('hug', 1)} {renderPenguin('hug', 1)}</div>
          <div className="button-row">
            <button type="button" className="primary-button" onClick={() => { resetQuestGame(); setScreen('quest') }}>Replay</button>
            <button type="button" className="secondary-button" onClick={() => setScreen('map')}>Back</button>
          </div>
        </div>
      )}
    </div>
  )

  const renderQuestionCorner = () => (
    <div className="page question-page">
      <div className="question-bubble">{currentQuestionReaction || 'Two very nervous penguins...'}</div>
      <div className="question-penguins">{renderPenguin('blush', 1.2)} {renderPenguin('love', 1.2)}</div>
      <div className="card soft-card question-card">
        <h2>Do you love your Home Minister?</h2>
        {!yesClicked ? (
          <div className="question-buttons">
            <button type="button" className="primary-button yes-button" onClick={() => setYesClicked(true)}>YES, OBVIOUSLY! ❤️</button>
            <button
              type="button"
              className="secondary-button no-button"
              onMouseEnter={moveNoButton}
              onTouchStart={moveNoButton}
              onFocus={moveNoButton}
              onClick={handleNoAttempt}
              style={{
                position: 'absolute',
                left: `${noButtonPos.x}%`,
                top: `${noButtonPos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              No...
            </button>
          </div>
        ) : (
          <div className="success-question">
            <motion.div className="happy-penguins" animate={{ y: [0, -18, 0] }} transition={{ repeat: Infinity, duration: 1.3 }}>
              {renderPenguin('love', 1.1)} {renderPenguin('hug', 1.1)}
            </motion.div>
            <p>KNEW IT! I love you more though. No arguments accepted.</p>
            <button type="button" className="primary-button" onClick={() => setScreen('map')}>Return to the map</button>
          </div>
        )}
      </div>
    </div>
  )

  const renderPenguinClickGame = () => (
    <div className="page penguin-click-page">
      <div className="card game-header">
        <h2>Click the Penguins</h2>
      </div>
      <div className="penguin-grid">
        {penguinCards.map((penguin) => {
          const isActive = clickedPenguins.includes(penguin.id)
          const isSelected = selectedPenguin?.id === penguin.id
          return (
            <motion.button
              key={penguin.id}
              type="button"
              className={`penguin-card ${penguin.mood} ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                if (!clickedPenguins.includes(penguin.id)) {
                  setClickedPenguins((prev) => [...prev, penguin.id])
                }
                setSelectedPenguin(penguin)
              }}
              animate={isSelected ? { y: [0, -8, 0], rotate: [0, -3, 3, 0] } : { y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mini-penguin">{renderPenguin(penguin.mood, 0.75)}</div>
              <span>{penguin.name}</span>
            </motion.button>
          )
        })}
      </div>
      {selectedPenguin && (
        <motion.div className="speech-bubble" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p>{selectedPenguin.message}</p>
        </motion.div>
      )}
      {clickedPenguins.length === penguinCards.length && (
        <div className="game-finish small-finish">
          <h3>You&apos;ve officially survived eight penguins and one very clingy girlfriend.</h3>
          <button type="button" className="secondary-button" onClick={() => setScreen('map')}>Back to map</button>
        </div>
      )}
    </div>
  )

  const renderCakePage = () => (
    <div className="page cake-page">
      <div className="cake-scene">
        <div className="counter-scene">
          <div className="female-chef-wrap">
            {renderPenguin('love', 1.1)}
            <span className="chef-label">Chef Poppy</span>
          </div>
          <div className="bowl">
            <div className="batter-layer" style={{ opacity: cakeBaked ? 1 : 0.4 }} />
          </div>
          <div className="cake-prep-note">{cakeBaked ? 'The red velvet cake is ready to decorate.' : 'Mixing the batter and preparing the layers...'}</div>
        </div>

        <div className="cake-area">
          <div className={`cake-base ${cakeBaked ? 'baked' : ''}`}>
            <div className="cake-layer layer-1" />
            <div className="cake-layer layer-2" style={{ opacity: cakeBaked ? 1 : 0.15 }} />
            <div className="cake-frosting" style={{ opacity: cakeBaked ? 1 : 0.1 }} />
            {cakeBaked && <div className="cake-strawberries">🍓</div>}
            {cakeBaked && <div className="cake-sprinkles">✨</div>}
            {cakeBaked && <div className="cake-hearts">💖</div>}
            {cakeLit && <div className="candle flame">{'🕯️'}</div>}
          </div>

          <div className="cake-actions">
            {!cakeBaked && <button type="button" className="primary-button" disabled>Preparing cake...</button>}
            {cakeBaked && !cakeLit && <button type="button" className="primary-button" onClick={() => setCakeLit(true)}>Light the Candle 🕯️</button>}
            {cakeLit && !cakeBlown && <button type="button" className="primary-button" onClick={() => { setCakeBlown(true); setSmokeVisible(true); setTimeout(() => setScreen('birthday'), 1700) }}>Blow the Candle 🌬️</button>}
          </div>
        </div>
        {smokeVisible && <div className="smoke-screen" />}
      </div>
    </div>
  )

  const renderBirthdayPage = () => (
    <div className="page birthday-page">
      <div className="birthday-content">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          {pageCopy.birthdayTitle.split('').map((char, index) => (
            <motion.span key={`${char}-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.04 }}>
              {char}
            </motion.span>
          ))}
        </motion.h1>
        <div className="birthday-note">
          <p>To my Love,</p>
          <p>
            I hope this birthday brings you all the happiness, success, love, and beautiful things you deserve.
          </p>
          <p>I hope I get to celebrate many more birthdays with you.</p>
          <p>With all my love,</p>
          <p>Your Home Minister ❤️</p>
        </div>
        <div className="birthday-hearts">
          <span>💖</span>
          <span>💞</span>
          <span>💗</span>
        </div>
        {birthdayReveal && (
          <button type="button" className="primary-button" onClick={() => setScreen('slide')}>
            There&apos;s Still One Tiny Surprise...
          </button>
        )}
      </div>
    </div>
  )

  const renderSlidePage = () => (
    <div className="page slide-page">
      <div className="ice-scene">
        <div className="slide-track" />
        <motion.div className="slide-penguin top-one" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.7 }}>
          {renderPenguin('waddle', 0.8)}
        </motion.div>
        <motion.div className="slide-penguin top-two" animate={{ x: [0, 20, 0], rotate: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}>
          {renderPenguin('cute', 0.8)}
        </motion.div>
        <div className="slide-button-wrap">
          <button type="button" className="primary-button" onClick={() => setScreen('hug')}>One Last Thing ❤️</button>
        </div>
      </div>
    </div>
  )

  const renderHugPage = () => (
    <div className="page hug-page">
      <div className="card soft-card hug-card">
        <p className="hug-intro">Someone has been waiting to give you a hug...</p>
        {!hugPlayed ? (
          <button type="button" className="primary-button" onClick={() => { setHugPlayed(true) }}>
            Receive Your Virtual Hug ❤️
          </button>
        ) : (
          <div className="hug-animation">
            <motion.div className="hug-penguin left-penguin" animate={{ x: [0, 170], y: [0, -10, 0] }} transition={{ duration: 1.4, ease: 'easeInOut' }}>
              {renderPenguin('love', 1.2)}
            </motion.div>
            <motion.div className="hug-penguin right-penguin" animate={{ x: [0, -170], y: [0, -10, 0] }} transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.2 }}>
              {renderPenguin('hug', 1.2)}
            </motion.div>
            <div className="heart-glow">💖</div>
            <p className="hug-text">No matter how far we are, you&apos;ll always have a hug waiting for you from your Home Minister.</p>
            <p className="hug-text">In every universe, I&apos;d still choose you. ❤️</p>
            <button type="button" className="primary-button" onClick={() => setHugPlayed(false)}>Hug Me Again</button>
          </div>
        )}
      </div>
    </div>
  )

  const renderCurrentScreen = () => {
    if (screen === 'delivery') return renderDeliveryScene()
    if (screen === 'greeting') return renderGreeting()
    if (screen === 'map') return renderMap()
    if (screen === 'memory') return renderMemoryPage()
    if (screen === 'catch') return renderCatchGame()
    if (screen === 'quest') return renderQuest()
    if (screen === 'question') return renderQuestionCorner()
    if (screen === 'penguins') return renderPenguinClickGame()
    if (screen === 'cake') return renderCakePage()
    if (screen === 'birthday') return renderBirthdayPage()
    if (screen === 'slide') return renderSlidePage()
    return renderHugPage()
  }

  return <div className="app-shell">{renderCurrentScreen()}</div>
}

export default App
