
export interface Artist {
  id: number;
  name: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
}

export interface Album {
  id: number;
  title: string;
  cover: string;
  cover_small: string;
  cover_medium: string;
  cover_big: string;
  cover_xl: string;
}

export interface Track {
  id: number;
  title: string;
  title_short: string;
  duration: number;
  preview: string;
  artist: Artist;
  album: Album;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
}

export enum View {
  HOME = 'home',
  SEARCH = 'search',
  PLAYLISTS = 'playlists',
  SETTINGS = 'settings'
}
