import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { memories } from './data/memories'
import backgroundLayer from '../b2.png'
import foregroundLayer from '../foreground.png'

type ScreenName =
  | 'delivery'
  | 'gallery'
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

const mazeRows = 9
const mazeColumns = 13
const mazeStart = { row: 1, column: 1 }
const mazeGoal = { row: 7, column: 11 }

const cakeAssetSources = {
  carrier: '/Gemini_Generated_Image_2gywdf2gywdf2gyw.png',
  cake: '/Gemini_Generated_Image_gd6ob1gd6ob1gd6o.png',
  sloth: '/Gemini_Generated_Image_t2e354t2e354t2e3.png',
  slice: '/Gemini_Generated_Image_y6244vy6244vy624.png',
}

const createMazeWalls = () => {
  const walls = new Set<string>()
  const visited = new Set<string>(['1-1'])
  const stack = [mazeStart]

  for (let row = 0; row < mazeRows; row += 1) {
    for (let column = 0; column < mazeColumns; column += 1) {
      if (row === 0 || column === 0 || row === mazeRows - 1 || column === mazeColumns - 1 || row % 2 === 0 || column % 2 === 0) {
        walls.add(`${row}-${column}`)
      }
    }
  }

  while (stack.length > 0) {
    const current = stack[stack.length - 1]
    const directions = [
      { row: -2, column: 0 },
      { row: 2, column: 0 },
      { row: 0, column: -2 },
      { row: 0, column: 2 },
    ].sort(() => Math.random() - 0.5)
    let carved = false

    for (const direction of directions) {
      const next = { row: current.row + direction.row, column: current.column + direction.column }
      const nextKey = `${next.row}-${next.column}`
      if (next.row < 1 || next.row >= mazeRows - 1 || next.column < 1 || next.column >= mazeColumns - 1 || visited.has(nextKey)) continue

      visited.add(nextKey)
      walls.delete(nextKey)
      walls.delete(`${current.row + direction.row / 2}-${current.column + direction.column / 2}`)
      stack.push(next)
      carved = true
      break
    }

    if (!carved) stack.pop()
  }

  return walls
}

const transparentForeground = (source: string) => new Promise<string>((resolve) => {
  const image = new Image()
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) {
      resolve(source)
      return
    }

    context.drawImage(image, 0, 0)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    const visited = new Uint8Array(canvas.width * canvas.height)
    const queue: number[] = []

    for (let x = 0; x < canvas.width; x += 1) {
      queue.push(x, (canvas.height - 1) * canvas.width + x)
    }
    for (let y = 1; y < canvas.height - 1; y += 1) {
      queue.push(y * canvas.width, y * canvas.width + canvas.width - 1)
    }

    while (queue.length > 0) {
      const index = queue.pop() ?? 0
      if (visited[index]) continue
      visited[index] = 1
      const red = pixels[index * 4]
      const green = pixels[index * 4 + 1]
      const blue = pixels[index * 4 + 2]
      const alpha = pixels[index * 4 + 3]
      if (alpha === 0 || red < 235 || green < 235 || blue < 235) continue
      pixels[index * 4 + 3] = 0
      const x = index % canvas.width
      const y = Math.floor(index / canvas.width)
      if (x > 0) queue.push(index - 1)
      if (x < canvas.width - 1) queue.push(index + 1)
      if (y > 0) queue.push(index - canvas.width)
      if (y < canvas.height - 1) queue.push(index + canvas.width)
    }

    context.putImageData(imageData, 0, 0)
    resolve(canvas.toDataURL('image/png'))
  }
  image.onerror = () => resolve(source)
  image.src = source
})

const transparentAsset = (source: string) => new Promise<string>((resolve) => {
  const image = new Image()
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) {
      resolve(source)
      return
    }

    context.drawImage(image, 0, 0)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    const visited = new Uint8Array(canvas.width * canvas.height)
    const queue = [0]
    const background = [pixels[0], pixels[1], pixels[2]]

    while (queue.length > 0) {
      const index = queue.pop() ?? 0
      if (visited[index]) continue
      visited[index] = 1
      const pixelOffset = index * 4
      const red = pixels[pixelOffset]
      const green = pixels[pixelOffset + 1]
      const blue = pixels[pixelOffset + 2]
      const alpha = pixels[pixelOffset + 3]
      const distance = Math.hypot(red - background[0], green - background[1], blue - background[2])
      if (alpha === 0 || distance > 72) continue
      pixels[pixelOffset + 3] = 0
      const x = index % canvas.width
      const y = Math.floor(index / canvas.width)
      if (x > 0) queue.push(index - 1)
      if (x < canvas.width - 1) queue.push(index + 1)
      if (y > 0) queue.push(index - canvas.width)
      if (y < canvas.height - 1) queue.push(index + canvas.width)
    }

    context.putImageData(imageData, 0, 0)
    resolve(canvas.toDataURL('image/png'))
  }
  image.onerror = () => resolve(source)
  image.src = source
})

function App() {
  const [screen, setScreen] = useState<ScreenName>('delivery')
  const [musicOn, setMusicOn] = useState(false)
  const [deliveryOpened, setDeliveryOpened] = useState(false)
  const [deliveryMovieReady, setDeliveryMovieReady] = useState(false)
  const [foregroundSource, setForegroundSource] = useState(foregroundLayer)
  const [cakeAssets, setCakeAssets] = useState(cakeAssetSources)
  const [flippedGalleryPhotos, setFlippedGalleryPhotos] = useState<number[]>([])
  const [galleryNotice, setGalleryNotice] = useState('')
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
  const [questMessage, setQuestMessage] = useState('Use the arrow keys to guide the sloth to the penguin.')
  const [questWon, setQuestWon] = useState(false)
  const [questPlayer, setQuestPlayer] = useState(mazeStart)
  const [questWalls, setQuestWalls] = useState(createMazeWalls)
  const [questTrail, setQuestTrail] = useState<string[]>(['1-1'])
  const [noAttempts, setNoAttempts] = useState(0)
  const [yesClicked, setYesClicked] = useState(false)
  const [noButtonPos, setNoButtonPos] = useState({ x: 62, y: 70 })
  const [clickedPenguins, setClickedPenguins] = useState<number[]>([])
  const [selectedPenguin, setSelectedPenguin] = useState<PenguinCard | null>(null)
  const [cakeStage, setCakeStage] = useState<'peek' | 'leaving' | 'returning' | 'ready' | 'countdown' | 'cut' | 'eating'>('peek')
  const [cakeCountdown, setCakeCountdown] = useState(0)
  const [hugPlayed, setHugPlayed] = useState(false)
  const [currentQuestionReaction, setCurrentQuestionReaction] = useState('')
  const audioContextRef = useRef<AudioContext | null>(null)
  const musicTimerRef = useRef<number | null>(null)

  useEffect(() => {
    let active = true
    void transparentForeground(foregroundLayer).then((source) => {
      if (active) setForegroundSource(source)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    void Promise.all(Object.entries(cakeAssetSources).map(async ([key, source]) => [key, await transparentAsset(source)] as const)).then((entries) => {
      if (active) setCakeAssets(Object.fromEntries(entries) as typeof cakeAssetSources)
    })
    return () => {
      active = false
    }
  }, [])

  const scrapbookPages = useMemo(() => {
    const chunkSize = 8
    return Array.from({ length: Math.ceil(memories.length / chunkSize) }, (_, pageIndex) =>
      memories.slice(pageIndex * chunkSize, pageIndex * chunkSize + chunkSize),
    )
  }, [])

  const galleryPhotos = useMemo(() => [...memories].sort(() => Math.random() - 0.5).slice(0, 8), [])

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
    setQuestMessage('Use the arrow keys to guide the sloth to the penguin.')
    setQuestWon(false)
    setQuestPlayer(mazeStart)
    setQuestWalls(createMazeWalls())
    setQuestTrail(['1-1'])
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
    if (screen !== 'quest' || questWon) return

    const handleMazeKey = (event: KeyboardEvent) => {
      const direction = {
        ArrowUp: { row: -1, column: 0 },
        ArrowDown: { row: 1, column: 0 },
        ArrowLeft: { row: 0, column: -1 },
        ArrowRight: { row: 0, column: 1 },
      }[event.key]
      if (!direction) return

      event.preventDefault()
      const next = {
        row: questPlayer.row + direction.row,
        column: questPlayer.column + direction.column,
      }
      const outsideMaze = next.row < 1 || next.row >= mazeRows - 1 || next.column < 1 || next.column >= mazeColumns - 1
      if (outsideMaze || questWalls.has(`${next.row}-${next.column}`)) {
        setQuestMessage('That way is blocked. Try another arrow, sweetheart.')
        return
      }

      setQuestPlayer(next)
      setQuestTrail((previous) => previous.includes(`${next.row}-${next.column}`) ? previous : [...previous, `${next.row}-${next.column}`])
      if (next.row === mazeGoal.row && next.column === mazeGoal.column) {
        setQuestWon(true)
        setQuestMessage('You found your penguin! Love always knows the way home.')
      } else {
        setQuestMessage('Keep going. Your penguin is waiting at the end.')
      }
    }

    window.addEventListener('keydown', handleMazeKey)
    return () => window.removeEventListener('keydown', handleMazeKey)
  }, [questPlayer, questWalls, questWon, screen])

  useEffect(() => {
    if (screen !== 'cake') return
    setCakeStage('ready')
    setCakeCountdown(0)
  }, [screen])

  useEffect(() => {
    if (screen !== 'cake') return
    if (cakeStage === 'countdown' && cakeCountdown > 0) {
      const timer = window.setTimeout(() => setCakeCountdown((value) => value - 1), 1000)
      return () => window.clearTimeout(timer)
    }
    if (cakeStage === 'countdown' && cakeCountdown === 0) {
      setCakeStage('cut')
    }
  }, [screen, cakeStage, cakeCountdown])

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
    <div className={`page delivery-page ${deliveryOpened ? 'delivery-opened' : ''}`}>
      <div className="storybook-scene" aria-hidden="true">
        <img className="storybook-background" src={backgroundLayer} alt="" />
        <img className="storybook-foreground" src={foregroundSource} alt="" />
      </div>
      <div className="mailroom-snow" aria-hidden="true">
        {[...Array(14)].map((_, index) => <span key={`snow-${index}`} style={{ '--snow-delay': `${index * 0.7}s` } as React.CSSProperties} />)}
      </div>
      <div className="delivery-copy" aria-live="polite">
        <p className="eyebrow">WELCOME TO CHILL & WADDLE!</p>
        <h1>{deliveryOpened ? 'A little movie is beginning...' : <>Where A Sloth & A Penguin Discover<br />Unexpected Friendship & Adventures!</>}</h1>
        {!deliveryOpened && (
          <>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setDeliveryOpened(true)
              }}
            >
              START OUR STORY
            </button>
          </>
        )}
      </div>
      {deliveryOpened && (
        <div className="heart-ripple" aria-hidden="true">
          {[...Array(32)].map((_, index) => (
            <motion.span
              key={`heart-${index}`}
              className="heart-pop"
              onAnimationEnd={index === 31 ? () => setDeliveryMovieReady(true) : undefined}
              style={{
                '--heart-angle': `${(index / 32) * 360}deg`,
                '--heart-delay': '0s',
              } as React.CSSProperties}
            >
              ❤️
            </motion.span>
          ))}
        </div>
      )}
      <button type="button" className="music-toggle" onClick={() => setMusicOn((value) => !value)}>
        {musicOn ? '🔊 Music On' : '🔇 Music Off'}
      </button>
      {deliveryMovieReady && (
        <motion.div className="movie-title-reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="movie-kicker">A birthday story begins</p>
          <h2>Birthday wishes to<br />Mr. Sloth Berry</h2>
          <p>With love from “Home Minister”</p>
          <button type="button" className="primary-button" onClick={() => setScreen('gallery')}>
            Begin the movie <span aria-hidden="true">→</span>
          </button>
        </motion.div>
      )}
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

  const renderGalleryPage = () => (
    <div className="page gallery-page">
      <div className="gallery-header">
        <p className="eyebrow">A LITTLE COLLECTION OF US</p>
        <h1>Open a little love note</h1>
        <p className="subtext">Tap each picture to discover what is waiting on the other side.</p>
      </div>
      <div className="gallery-grid">
        {galleryPhotos.map((photo) => {
          const isFlipped = flippedGalleryPhotos.includes(photo.id)
          return (
            <button
              key={photo.id}
              type="button"
              className={`gallery-card ${photo.frame} ${isFlipped ? 'flipped' : ''}`}
              onClick={() => {
                if (!isFlipped) {
                  setFlippedGalleryPhotos((previous) => [...previous, photo.id])
                }
              }}
              aria-label={isFlipped ? `Message revealed for ${photo.label}` : `Reveal message for ${photo.label}`}
            >
              <span className="gallery-card-inner">
                <span className="gallery-card-face gallery-card-front">
                  <img className="gallery-card-backdrop" src={photo.src} alt="" aria-hidden="true" />
                  <img src={photo.src} alt={photo.label} style={{ objectPosition: photo.position }} />
                </span>
                <span className="gallery-card-face gallery-card-back">
                  <span className="gallery-heart">♥</span>
                  <span>{photo.hiddenMessage}</span>
                </span>
              </span>
            </button>
          )
        })}
      </div>
      {galleryNotice && <p className="gallery-notice" role="status">{galleryNotice}</p>}
      <button
        type="button"
        className="primary-button gallery-continue"
        onClick={() => {
          if (flippedGalleryPhotos.length < galleryPhotos.length) {
            setGalleryNotice('Why?? 😢 Please open all the pictures first!')
            window.setTimeout(() => setGalleryNotice(''), 2200)
            return
          }
          setScreen('quest')
        }}
      >
        Continue our story <span aria-hidden="true">→</span>
      </button>
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
        <h2>Guide the Sloth to the Penguin</h2>
        <p className="subtext">Use the arrow keys to find the way through the maze.</p>
      </div>
      <div className="keyboard-maze" role="application" aria-label="Arrow key maze">
        {Array.from({ length: mazeRows * mazeColumns }, (_, index) => {
          const row = Math.floor(index / mazeColumns)
          const column = index % mazeColumns
          const isBoundary = row === 0 || row === mazeRows - 1 || column === 0 || column === mazeColumns - 1
          const isWall = isBoundary || questWalls.has(`${row}-${column}`)
          const isPlayer = row === questPlayer.row && column === questPlayer.column
          const isGoal = row === mazeGoal.row && column === mazeGoal.column
          const isTrail = questTrail.includes(`${row}-${column}`)
          return (
            <div key={`${row}-${column}`} className={`maze-cell ${isWall ? 'wall' : 'path'} ${isPlayer ? 'player' : ''} ${isGoal ? 'goal' : ''} ${isTrail ? 'trail' : ''}`}>
              {!isWall && isPlayer && <span aria-label="Sloth">🦥</span>}
              {!isWall && isGoal && !isPlayer && <span aria-label="Penguin">🐧</span>}
              {!isWall && isTrail && !isPlayer && !isGoal && <span className="maze-trail-heart" aria-hidden="true">♥</span>}
            </div>
          )
        })}
      </div>
      <p className="game-toast">{questMessage}</p>
      {questWon && (
        <div className="game-finish small-finish">
          <h3>{questMessage}</h3>
          <div className="maze-celebration">🦥 💕 🐧</div>
          <div className="button-row">
            <button type="button" className="primary-button" onClick={() => { resetQuestGame(); setScreen('quest') }}>Replay</button>
            <button type="button" className="secondary-button" onClick={() => setScreen('cake')}>Continue</button>
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
    <div className={`page cake-page cake-stage-${cakeStage}`}>
      <img className="cake-background-art" src="/background.png" alt="" />
      <div className="cake-overlay" aria-hidden="true" />
      <div className="cake-story">
        <p className="eyebrow">A LITTLE BAKERY SURPRISE</p>
        <h1>Red velvet wishes</h1>
        <p className="cake-story-copy">
          {cakeStage === 'ready' && 'Your cake is here! Make a wish before the candles disappear.'}
          {cakeStage === 'countdown' && `Blow in ${cakeCountdown}...`}
          {cakeStage === 'cut' && 'The candles are out. Time to cut the cake!'}
          {cakeStage === 'eating' && 'A perfect bite for a very special birthday.'}
        </p>
        <div className="cake-stage-scene" aria-hidden="true">
          <div className={`cake-object ${cakeStage === 'eating' ? 'cake-object-hidden' : ''}`}>
            {cakeStage !== 'cut' && <img className="cake-art cake-complete-art" src={cakeAssets.cake} alt="A red velvet birthday cake" />}
            {cakeStage === 'cut' && <img className="cake-slice-art" src={cakeAssets.slice} alt="A slice of red velvet cake" />}
            {(cakeStage === 'cut' || cakeStage === 'eating') && <div className="cake-knife">🔪</div>}
          </div>
          {cakeStage === 'eating' && (
            <div className="cake-eating-characters">
              <img className="cake-eating-sloth" src={cakeAssets.sloth} alt="A sloth eating a slice of red velvet cake" />
            </div>
          )}
          {cakeStage === 'countdown' && <div className="cake-countdown">{cakeCountdown}</div>}
          {cakeStage === 'cut' && <div className="cake-cut-piece">A slice is ready!</div>}
        </div>
        <div className="cake-story-actions">
          {cakeStage === 'ready' && <button type="button" className="primary-button" onClick={() => { setCakeCountdown(3); setCakeStage('countdown') }}>Make a Wish ✨</button>}
          {cakeStage === 'cut' && <button type="button" className="primary-button" onClick={() => setCakeStage('eating')}>Enjoy It ❤️</button>}
          {cakeStage === 'eating' && <button type="button" className="primary-button" onClick={() => setScreen('birthday')}>Continue</button>}
        </div>
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
    if (screen === 'gallery') return renderGalleryPage()
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
