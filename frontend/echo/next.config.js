module.exports = {
//... other config options...
	webpack(config) {
	  config.resolve.fallback = {
	  ...config.resolve.fallback,
 	  http: require.resolve('stream-http'),
	  https: require.resolve('https-browserify'),
	  util: require.resolve('util/'),
  	  zlib: require.resolve('browserify-zlib'),
	  stream: require.resolve('stream-browserify'),
};

return config;
}
};
