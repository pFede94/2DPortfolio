import { defineConfig } from "vite";
//this config its to rectify some problems with kaboom and when its time to upload
export default defineConfig({
    //used for the server to find the assets
    base: "./",
    //use this minify because of a bug in kaboom
    build: {
        minify: "terser"
    }
})