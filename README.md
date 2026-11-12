# 🎵 GSA Player

![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

Player de música minimalista feito com **React** e a **API do Deezer**: busca em tempo real, playlists próprias e um player com visual glassmorphism que funciona bem no celular.

<div align="center">
  <img src="gsa1.png" width="45%" alt="Tela inicial do GSA Player" />
  <img src="gsa2.png" width="45%" alt="Playlists do GSA Player" />
</div>

## ✨ Funcionalidades

**Descoberta**
- Rolagem infinita: novas músicas carregam conforme você desce a página
- Botão "Atualizar tudo" alterna entre os charts globais e palavras-chave em alta
- Seção de artistas populares

**Busca**
- Faixas, álbuns e artistas, com resultados enquanto você digita

**Playlists (CRUD completo)**
- Crie, edite e exclua playlists; adicione e remova faixas
- Favoritos com um clique ("Curtir")
- Tudo salvo no `localStorage`

**Player**
- Play/pause, próxima/anterior, aleatório e repetir
- Barra de progresso clicável e controle de volume
- Navegação inferior estilo app no celular

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Interface | React 19 + TypeScript |
| Build | Vite |
| Estilo | Tailwind CSS |
| Ícones | Lucide React |
| Estado | Context API |
| Dados | API do Deezer |

## 🚀 Como rodar

```bash
git clone https://github.com/MChaves-21/gsa.git
cd gsa
npm install
npm run dev
```

## 📝 Próximos passos

- [ ] Letras sincronizadas com a música
- [ ] Modo offline (PWA)
- [ ] Login para sincronizar playlists na nuvem
