import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import { resolve } from 'path';
import { glob } from 'glob';

function getHtmlEntryInputs() {
  const files = glob.sync('src/**/index.html', { ignore: 'src/dist/**' });
  const input = {};
  files.forEach(file => {
    const name = file.replace('src/', '').replace('/index.html', '') || 'main';
    input[name] = resolve(__dirname, file);
  });
  return input;
}

export default defineConfig({
  root: './src',
  plugins: [devtools(), solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: getHtmlEntryInputs(),
    },
  },
});