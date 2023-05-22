const gulp = require('gulp')
const fs = require('fs').promises

gulp.task('publish-layer', async () => {
  const pkg = require('./package.json')
  const LayerBuilder = require('../../../lib/aws/LayerBuilder')
  const builder = new LayerBuilder(pkg.name, /^\d+\.\d+/.exec(pkg.version)[0])
  const versionArn = await builder.publish()
  if (!pkg.config) { pkg.config = {} }
  pkg.config.layers = [versionArn]
  await fs.writeFile('package.json', JSON.stringify(pkg, null, 2))
})

gulp.task('default', gulp.series(['publish-layer']))