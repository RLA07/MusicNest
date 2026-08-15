export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  artwork: string | null;
  duration_ms: number | null;
}
