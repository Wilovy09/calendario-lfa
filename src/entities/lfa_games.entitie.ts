export type Game = {
  rival?: string
  date: string
  time?: string
  week: number
  goodbye?: boolean
}

export type Team = {
  state: string
  stadium?: string
  coords?: [lat: number, lon: number]
  website?: string
  color?: string
  games?: Game[]
}

export type LfaGames = [string, Team]
