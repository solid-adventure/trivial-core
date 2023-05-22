var gulp = require('gulp'),
    // concat = require('gulp-concat'),
		nodemon = require('gulp-nodemon')

// gulp.task('pack-is', () => {
// 	return gulp.src(['components'])
// 				 .pipe(gulp.dest(''))
// })

gulp.task('run', (done) => {

	let app_id = process.env.APP_ID

  nodemon({
    script: `serve.js`,
    ext: 'js html',
    delay: '500',
  // , env: { 'NODE_ENV': 'development' }
    done: done
  })
})

gulp.task('default', gulp.series('run'))