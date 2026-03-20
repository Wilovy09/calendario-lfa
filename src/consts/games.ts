import type { LfaGames } from '../entities/lfa_games.entitie'

/**
 * Calendario de la Liga de Fútbol Americano Profesional (LFA) para la temporada 2026.
 * Cada equipo tiene su estado, estadio, coordenadas, sitio web y su calendario de juegos.
 * Los juegos incluyen el rival, fecha, hora, semana y si es un juego de despedida (goodbye).
 * La estructura de datos permite mostrar el calendario completo de la temporada,
 * incluyendo los juegos de despedida.
 * La información de los juegos se basa en el formato proporcionado por la LFA,
 * con fechas y horarios específicos para cada juego.
 * Los juegos de despedida (goodbye) se indican claramente para que los usuarios
 * puedan identificarlos fácilmente en el calendario.
 * Cada equipo tiene sus juegos como local y los juegos de visita se infieren a
 * partir de los juegos de los otros equipos, eliminando la necesidad de
 * marcar explícitamente cada juego como local o visitante.
 */
export const lfa_games: LfaGames[] = [
  [
    'Osos',
    {
      state: 'Monterrey',
      stadium: 'Estadio Borregos, Monterrey',
      coords: [25.6538834, -100.2859069],
      website: 'https://ososlfa.com/',
      color: '#e84524',
      games: [
        { rival: 'Dinos', date: '2026-04-09', time: '20:00', week: 1 },
        { rival: 'Mexicas', date: '2026-05-02', time: '19:00', week: 4 },
        { date: '2026-05-09', goodbye: true, week: 5 },
        { rival: 'Raptors', date: '2026-05-16', time: '19:00', week: 6 },
      ],
    },
  ],
  [
    'Dinos',
    {
      state: 'Saltillo',
      stadium: 'Estadio Olímpico de Saltillo',
      coords: [25.4318189, -100.9800433],
      website: 'https://www.instagram.com/dinoslfa',
      color: '#662c91',
      games: [
        { rival: 'Gallos Negros', date: '2026-04-18', time: '19:00', week: 2 },
        { date: '2026-05-02', goodbye: true, week: 4 },
        { rival: 'Caudillos', date: '2026-05-16', time: '19:00', week: 6 },
        { rival: 'Reyes', date: '2026-05-23', time: '19:00', week: 7 },
      ],
    },
  ],
  [
    'Caudillos',
    {
      state: 'Chihuahua',
      stadium: 'Estadio Olímpico de la UACH',
      coords: [28.7129598, -106.1440636],
      website: 'https://www.instagram.com/caudilloschihuahua',
      color: '#957633',
      games: [
        { rival: 'Raptors', date: '2026-04-11', time: '19:00', week: 1 },
        { rival: 'Osos', date: '2026-04-18', time: '19:00', week: 2 },
        { date: '2026-04-25', goodbye: true, week: 3 },
        { rival: 'Gallos Negros', date: '2026-05-09', time: '19:00', week: 5 },
      ],
    },
  ],
  [
    'Raptors',
    {
      state: 'Estado de México',
      stadium: 'Estadio Tec CCM',
      coords: [19.2862035, -99.1420001],
      website: 'https://raptorslfa.mx/',
      color: '#0f4734',
      games: [
        { rival: 'Mexicas', date: '2026-04-18', time: '19:00', week: 2 },
        { rival: 'Dinos', date: '2026-04-25', time: '19:00', week: 3 },
        { rival: 'Gallos Negros', date: '2026-05-02', time: '19:00', week: 4 },
        { date: '2026-05-23', goodbye: true, week: 7 },
      ],
    },
  ],
  [
    'Gallos Negros',
    {
      state: 'Querétaro',
      stadium: 'Estadio Olímpico de Querétaro',
      coords: [20.5848793, -100.3876311],
      website: 'https://www.instagram.com/gallosnegroslfa',
      color: '#1d59a3',
      games: [
        { rival: 'Reyes', date: '2026-04-11', time: '19:00', week: 1 },
        { rival: 'Mexicas', date: '2026-04-25', time: '19:00', week: 3 },
        { date: '2026-05-16', goodbye: true, week: 6 },
        { rival: 'Osos', date: '2026-05-23', time: '19:00', week: 7 },
      ],
    },
  ],
  [
    'Reyes',
    {
      state: 'Jalisco',
      stadium: 'Estadio Fortaleza Azul',
      coords: [20.7372583, -103.4568731],
      website: 'https://www.instagram.com/reyes_lfa',
      color: '#004f9a',
      games: [
        { date: '2026-04-18', goodbye: true, week: 2 },
        { rival: 'Osos', date: '2026-04-26', time: '19:00', week: 3 },
        { rival: 'Caudillos', date: '2026-05-03', time: '19:00', week: 4 },
        { rival: 'Raptors', date: '2026-05-09', time: '19:00', week: 5 },
      ],
    },
  ],
  [
    'Mexicas',
    {
      state: 'Ciudad de México',
      stadium: 'Estadio Tec CCM',
      coords: [19.3553, -99.1811],
      website: 'https://mexicaslfa.com/',
      color: '#ed1c24',
      games: [
        { date: '2026-04-11', goodbye: true, week: 1 },
        { rival: 'Dinos', date: '2026-05-09', time: '19:00', week: 5 },
        { rival: 'Reyes', date: '2026-05-16', time: '19:00', week: 6 },
        { rival: 'Caudillos', date: '2026-05-23', time: '19:00', week: 7 },
      ],
    },
  ],
]
