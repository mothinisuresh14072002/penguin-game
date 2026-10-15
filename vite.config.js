import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  server: {
    watch: {
      ignored: ['**/*.zip', '**/pawverse-banner-update/**', '**/polar-dash-bunny-push/**']
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        race: fileURLToPath(new URL('./race.html', import.meta.url))
      }
    }
  }
});
