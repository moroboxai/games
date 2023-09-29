import { defineConfig } from "vite";
import {version} from "./package.json";
const { resolve } = require("path");

export default defineConfig({
    build: {
        minify: false,
        emptyOutDir: false,
        outDir: resolve(__dirname),
        lib: {
            entry: resolve(__dirname, "src", "game.ts"),
            name: "Game",
            formats: ["umd"],
            fileName: (format) => {
                switch (format) {
                    case "umd":
                        return `game.js`;
                }
            }
        }
    }
});
