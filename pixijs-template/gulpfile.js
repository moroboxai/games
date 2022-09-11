'use strict'

const path = require('path');
const gulp = require('gulp');
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');

const webpackConfig = (prod) => ({
    context: path.resolve(__dirname, 'src'),
    entry: './index.ts',
    mode: prod ? 'production' : 'development',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    output: {
        filename: prod ? 'boot.min.js' : 'boot.js',
        path: path.resolve(__dirname),
        library: {
          type: 'umd'
        },
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
});

gulp.task('dev', () => {	
	return gulp.src('./src/index.ts')
    	.pipe(gulpWebpack(webpackConfig(), webpack))
        .pipe(gulp.dest('./'));
});

gulp.task('build', () => {
	return gulp.src('./src/index.ts')
    	.pipe(gulpWebpack(webpackConfig(true), webpack))
        .pipe(gulp.dest('./'));
});