import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AmbientBackground } from './components/AmbientBackground'
import { SplashScene } from './scenes/SplashScene'
import { HomeScene } from './scenes/HomeScene'
import { CareerScene } from './scenes/CareerScene'
import { MatchmakingScene } from './scenes/MatchmakingScene'
import { VsScene } from './scenes/VsScene'
import { QuizBoardScene } from './scenes/QuizBoardScene'
import { CreateRoomScene } from './scenes/CreateRoomScene'
import { JoinRoomScene } from './scenes/JoinRoomScene'
import { DiscoverScene } from './scenes/DiscoverScene'
import { LobbyScene } from './scenes/LobbyScene'
import { EditorScene } from './scenes/EditorScene'
import { TuningPanel } from './components/TuningPanel'
import { ME, pickOpponent, type Fighter } from './lib/player'
import { makeRoom, DEFAULT_SETTINGS, type Room, type Member } from './lib/room'
import { createCloudRoom, joinCloudRoom, subscribeRoom, toRoom, leaveCloudRoom } from './lib/rooms'

type Scene = 'splash' | 'home' | 'career' | 'search' | 'vs' | 'match' | 'create' | 'join' | 'discover' | 'lobby' | 'editor'
type Teams = { red: Member[]; blue: Member[] }

const mem = (name: string, you: boolean): Member => ({ name, you, ready: true, mic: true })

function splashSeen(): boolean {
  try {
    return !!sessionStorage.getItem('quizo-splash-seen')
  } catch {
    return false
  }
}

export default function App() {
  const [scene, setScene] = useState<Scene>(splashSeen() ? 'home' : 'splash')
  const [opponent, setOpponent] = useState<Fighter | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [teams, setTeams] = useState<Teams | null>(null)
  const [cloudCode, setCloudCode] = useState<string | null>(null)

  // Odayı canlı dinle: üye girer/çıkar, hazır olur, host başlatınca herkes maça geçer
  useEffect(() => {
    if (!cloudCode) return
    return subscribeRoom(cloudCode, (r) => {
      setRoom(toRoom(r))
      if (r.status === 'playing') {
        setTeams({ red: toRoom(r).red, blue: toRoom(r).blue })
        setScene((s) => (s === 'lobby' ? 'match' : s))
      }
    })
  }, [cloudCode])

  const finishSplash = () => {
    try {
      sessionStorage.setItem('quizo-splash-seen', '1')
    } catch {
      /* ignore */
    }
    setScene('home')
  }


  return (
    <>
      <div className="app-shell grain">
        <div className="device">
        <AmbientBackground />
        <AnimatePresence>
          {scene === 'splash' && <SplashScene key="splash" onDone={finishSplash} />}

          {scene === 'home' && (
            <HomeScene
              key="home"
              me={ME}
              onSelect={(k) => {
                if (k === 'quick') setScene('search')
                else if (k === 'career') setScene('career')
                else if (k === 'create') setScene('create')
                else if (k === 'join') setScene('join')
                else if (k === 'discover') setScene('discover')
              }}
            />
          )}

          {scene === 'career' && <CareerScene key="career" onBack={() => setScene('home')} onFind={() => setScene('search')} />}

          {scene === 'search' && (
            <MatchmakingScene
              key="search"
              me={ME}
              onCancel={() => setScene('career')}
              onFound={() => {
                const opp = pickOpponent()
                setOpponent(opp)
                setTeams({ red: [mem(ME.name, true)], blue: [mem(opp.name, false)] })
                setScene('vs')
              }}
            />
          )}

          {scene === 'vs' && opponent && <VsScene key="vs" me={ME} opponent={opponent} onStart={() => setScene('match')} />}

          {scene === 'match' && teams && (
            <QuizBoardScene
              key="match"
              me={ME}
              roster={[...teams.red.map((m) => m.name), ...teams.blue.map((m) => m.name)]}
              onExit={() => setScene('home')}
            />
          )}

          {scene === 'create' && (
            <CreateRoomScene
              key="create"
              onBack={() => setScene('home')}
              onCreate={async (size, s) => {
                const r = await createCloudRoom(size, s, ME.name)
                if (r) {
                  setCloudCode(r.code)
                  setRoom(toRoom(r))
                } else {
                  setRoom(makeRoom(size, s, ME.name)) // bulut yoksa tek cihaz
                }
                setScene('lobby')
              }}
            />
          )}

          {scene === 'join' && (
            <JoinRoomScene
              key="join"
              onBack={() => setScene('home')}
              onJoin={async (code) => {
                const { room: r, error } = await joinCloudRoom(code, ME.name)
                if (error || !r) return error || 'Katılınamadı'
                setCloudCode(r.code)
                setRoom(toRoom(r))
                setScene('lobby')
                return null
              }}
            />
          )}

          {scene === 'discover' && (
            <DiscoverScene
              key="discover"
              onBack={() => setScene('home')}
              onJoin={(r) => {
                setRoom(makeRoom(r.size, { ...DEFAULT_SETTINGS, category: r.category, voice: r.voice }, ME.name, r.code))
                setScene('lobby')
              }}
            />
          )}

          {scene === 'lobby' && room && (
            <LobbyScene
              key="lobby"
              room={room}
              cloudCode={cloudCode ?? undefined}
              onLeave={() => {
                if (cloudCode) void leaveCloudRoom(cloudCode)
                setCloudCode(null)
                setScene('home')
              }}
              onStart={() => {
                if (room) setTeams({ red: room.red, blue: room.blue })
                setScene('match')
              }}
            />
          )}
          {scene === 'editor' && <EditorScene key="editor" onExit={() => setScene('home')} />}
        </AnimatePresence>
        </div>
      </div>
      {scene !== 'editor' && <TuningPanel onOpenEditor={() => setScene('editor')} />}
    </>
  )
}
