import { defineConfig } from "vite";
import {version} from "./package.json";
const { resolve } = require("path");

export default defineConfig({
    define: {
        "__VERSION__": version
    },
    build: {
        emptyOutDir: false,
        outDir: resolve(__dirname),
        lib: {
            entry: resolve(__dirname, "src", "game.ts"),
            name: "PixiMoroxel8AI",
            formats: ["cjs", "es", "umd"],
            fileName: (format) => {
                switch (format) {
                    case "umd":
                        return `game.js`;
                }
            }
        }
    }
});
