var rollup = require('rollup');
var uglify = require('uglify-js');
var babel = require('rollup-plugin-babel');
var nodeResolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');

rollup.rollup({
  entry: 'src/index.js',
  plugins: [
    babel(),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs()
  ]
}).then(function(bundle) {
  bundle.write({
    format: 'umd',
    moduleName: 'GView',
    banner: '/* GView */',
    dest: 'dist/gview.common.js'
  });
  console.log('done.');
}).catch(function(e) {
  console.log(e.stack);
});