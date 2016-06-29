module.exports = function(cfg) {
  cfg.output.library = 'GView';
  cfg.output.libraryTarget = 'umd';
  cfg.babel.plugins.push(require.resolve('babel-plugin-transform-runtime'));
  return cfg;
}