import { Track } from '../types';

// Usando AllOrigins: Mais estável para deploys externos (Vercel)
const PROXY_URL = 'https://api.allorigins.win/get?url=';
const BASE_URL = 'https://api.deezer.com';

const fetchFromDeezer = async (path: string) => {
  const url = `${BASE_URL}${path}`;
  try {
    // AllOrigins exige que a URL de destino seja encodada
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url)}`);

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const wrapper = await response.json();
    // O AllOrigins retorna os dados da Deezer dentro de 'contents' como uma STRING
    const data = JSON.parse(wrapper.contents);

    if (data.error) {
      throw new Error(`Deezer API error: ${data.error.message}`);
    }

    return data;
  } catch (error) {
    console.error(`Error fetching from Deezer (${path}):`, error);
    throw error;
  }
};

export const deezerService = {
  searchTracks: async (query: string, index: number = 0): Promise<Track[]> => {
    const data = await fetchFromDeezer(`/search?q=${encodeURIComponent(query)}&index=${index}&limit=20`);
    return data.data || [];
  },

  getChartTracks: async (index: number = 0): Promise<Track[]> => {
    if (index === 0) {
      const data = await fetchFromDeezer('/chart/0/tracks');
      return data.data || [];
    } else {
      const data = await fetchFromDeezer(`/search?q=top&index=${index}&limit=20`);
      return data.data || [];
    }
  },

  getTopArtists: async () => {
    const data = await fetchFromDeezer('/chart/0/artists');
    return data.data || [];
  },

  getArtistTopTracks: async (artistId: number): Promise<Track[]> => {
    const data = await fetchFromDeezer(`/artist/${artistId}/top?limit=50`);
    return data.data || [];
  }
};