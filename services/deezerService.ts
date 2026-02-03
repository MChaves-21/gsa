import { Track } from '../types';

// Usamos AllOrigins pois corsproxy.io costuma ser bloqueado em servidores de produção
const PROXY_URL = 'https://api.allorigins.win/get?url=';
const BASE_URL = 'https://api.deezer.com';

const fetchFromDeezer = async (path: string) => {
  const url = `${BASE_URL}${path}`;
  try {
    // 1. Faz a chamada via Proxy
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url)}`);

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const data = await response.json();

    // 2. IMPORTANTE: O AllOrigins coloca o JSON da Deezer dentro de 'contents' como STRING
    // Precisamos converter essa string de volta para objeto
    const decodedData = JSON.parse(data.contents);

    if (decodedData.error) {
      throw new Error(`Deezer API error: ${decodedData.error.message}`);
    }

    return decodedData;
  } catch (error) {
    console.error(`Erro na requisição Deezer (${path}):`, error);
    return { data: [] }; // Retorna array vazio para não quebrar o map no Home
  }
};

export const deezerService = {
  searchTracks: async (query: string, index: number = 0): Promise<Track[]> => {
    const data = await fetchFromDeezer(`/search?q=${encodeURIComponent(query)}&index=${index}&limit=20`);
    return data.data || [];
  },

  getChartTracks: async (index: number = 0): Promise<Track[]> => {
    // Se index for 0, pega o chart real, senão faz busca genérica para scroll infinito
    const path = index === 0 ? '/chart/0/tracks' : `/search?q=top&index=${index}&limit=20`;
    const data = await fetchFromDeezer(path);
    return data.data || [];
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