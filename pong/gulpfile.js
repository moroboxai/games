'use strict';

const path = require('path');
const gulp = require('gulp');
const ts = require('gulp-typescript');
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');

// Webpack config for building the game
const webpackConfig = {
        context: path.resolve(__dirname),
        entry: './src/game.ts',
        mode: 'development',
        target: 'web',
        node: false,
        module: {
            rules: [{
                test: /\.tsx?$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        onlyCompileBundledFiles: true
                    }
                }],
                exclude: /node_modules/
            }]
        },
        output: {
            filename: "game.js",
            path: path.resolve(__dirname),
            library: {
                type: 'umd'
            }
        },
        resolve: {
            extensions: ['.ts', '.js']
        }
};

gulp.task('build-game', () => {
    return gulp.src(`./src/game.ts`)
        .pipe(gulpWebpack(webpackConfig, webpack))
        .pipe(gulp.dest(`./`));
    });

gulp.task('build-agent', ()=> {
    return  gulp.src(`./src/agent.ts`)
    	.pipe(gulpWebpack(webpackConfig, webpack))
        .pipe(gulp.dest(`./`));
});