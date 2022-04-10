'use strict'

const gulp = require('gulp');
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');

gulp.task('compile', () => {	
	return gulp.src('./src/index.ts')
    	.pipe(gulpWebpack(require('./webpack.config'), webpack))
        .pipe(gulp.dest('lib/'));
});

gulp.task('copy', () => {
	return gulp.src('./lib/boot.js')
		.pipe(gulp.dest('./'));
});

gulp.task('build', gulp.series('compile', 'copy'));