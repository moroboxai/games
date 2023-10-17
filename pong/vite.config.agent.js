import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
const { resolve } = require("path");

export default defineConfig({
    plugins: [checker({ typescript: true })],
    build: {
        minify: false,
        emptyOutDir: false,
        outDir: resolve(__dirname),
        lib: {
            entry: resolve(__dirname, "src", "agent.ts"),
            name: "Game",
            formats: ["es"],
            fileName: (format) => {
                switch (format) {
                    case "es":
                        return `agent.js`;
                }
            }
        }
    }
});
