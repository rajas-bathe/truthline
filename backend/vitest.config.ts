import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'node-sqlite-shim',
      enforce: 'pre',
      resolveId(id) {
        if (id === 'node:sqlite' || id === 'sqlite') {
          return '\0sqlite';
        }
      },
      load(id) {
        if (id === '\0sqlite') {
          return 'const { DatabaseSync } = require("node:sqlite"); export { DatabaseSync }; export default { DatabaseSync };';
        }
      }
    }
  ],
  test: {
    globals: true,
    environment: 'node'
  }
});
