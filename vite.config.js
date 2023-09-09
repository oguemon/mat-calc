const { resolve } = require("path");

/** @type {import('vite').UserConfig} */
export default {
  build: {
    rollupOptions: {
      input: "ts/mat-det-inv.ts",
      output: {
        entryFileNames: `script.js`,
      },
    },
    outDir: "out",
    assetsDir: "",
  },
};
