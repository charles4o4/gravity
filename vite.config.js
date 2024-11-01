import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',       // Main entry point
        game: 'src/game.html',     // Additional entry point for game.html
      },
    },
  },
});
