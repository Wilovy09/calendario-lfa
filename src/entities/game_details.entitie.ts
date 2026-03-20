export type GameDetail = {
  id: string;
  week: number;
  home: string;
  away: string;
  date: string;
  time: string;
  stadium: string;
  coords?: [number, number];
};
