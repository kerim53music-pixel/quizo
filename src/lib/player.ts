export type Fighter = {
  name: string
  city: string
  qp: number
  league: string
}

export const ME: Fighter = {
  name: 'Kerim',
  city: 'İstanbul',
  qp: 2240,
  league: 'Elmas III',
}

export const CAREER = {
  soloQp: 2240,
  teamQp: 1750,
  league: 'Elmas III',
  nextLeague: 'Elmas II',
  toNext: 160,
  tierProgress: 0.2, // 0..1 within current tier
}

const OPPONENTS: Fighter[] = [
  { name: 'Mert', city: 'Ankara', qp: 2198, league: 'Elmas III' },
  { name: 'Berk', city: 'İzmir', qp: 2271, league: 'Elmas II' },
  { name: 'Can', city: 'Bursa', qp: 2205, league: 'Elmas III' },
  { name: 'Emre', city: 'Antalya', qp: 2189, league: 'Elmas III' },
  { name: 'Deniz', city: 'Adana', qp: 2256, league: 'Elmas II' },
  { name: 'Kaan', city: 'Konya', qp: 2233, league: 'Elmas III' },
]

export function pickOpponent(): Fighter {
  return OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)]
}
