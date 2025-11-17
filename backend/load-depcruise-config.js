/**
 * Dependency Cruiser Configuration Loader
 *
 * This file loads the TypeScript configuration file using ts-node,
 * allowing dependency-cruiser to use a fully type-safe configuration.
 *
 * Usage:
 *   npx depcruise --config load-depcruise-config.js src
 */

require('ts-node').register({
	transpileOnly: true,
	compilerOptions: {
		module: 'commonjs',
		esModuleInterop: true,
	},
});

const config = require('./.dependency-cruiser.ts');
module.exports = config.default || config;

