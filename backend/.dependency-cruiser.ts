/**
 * Dependency Cruiser Configuration
 *
 * This file defines architectural rules using dependency-cruiser to enforce
 * our Domain-Driven Design and Hexagonal Architecture patterns.
 *
 * Location: Root level (standard for dependency-cruiser configs)
 * Loaded via: load-depcruise-config.js (ts-node bridge)
 *
 * Usage:
 *   npx depcruise --config load-depcruise-config.js src
 *   npm run test:architecture
 *
 * This TypeScript configuration provides full type safety and IntelliSense
 * support for the dependency-cruiser rules.
 *
 * Rules are organized into separate files in the rules/ directory for better
 * maintainability and clarity.
 */

import type { IConfiguration } from 'dependency-cruiser';
import { aggregatorRules } from './rules/aggregators.rules';
import { appServiceRules } from './rules/app-services.rules';
import { assemblerRules } from './rules/assemblers.rules';
import { commonRules } from './rules/common.rules';
import { converterRules } from './rules/converters.rules';
import { domainBoundaryRules } from './rules/domain-boundaries.rules';
import { layerDependencyRules } from './rules/layer-dependencies.rules';
import { mapperRules } from './rules/mappers.rules';
import { repositoryRules } from './rules/repositories.rules';
import { serviceRules } from './rules/services.rules';
import { transactionScriptRules } from './rules/transaction-scripts.rules';

// Type declaration for CommonJS module compatibility
declare const module: { exports: IConfiguration };

const config: IConfiguration = {
	forbidden: [
		...converterRules,
		...assemblerRules,
		...mapperRules,
		...transactionScriptRules,
		...serviceRules,
		...appServiceRules,
		...aggregatorRules,
		...repositoryRules,
		...commonRules,
		...layerDependencyRules,
		...domainBoundaryRules,
	],
	options: {
		includeOnly: '^src',
		doNotFollow: {
			path: 'node_modules',
		},
		// Exclude test files from analysis
		exclude: {
			path: '(__specs__|__spec__)',
		},
		// Enable TypeScript parsing - this tells dependency-cruiser to parse
		// TypeScript files and resolve imports using the TypeScript compiler
		tsPreCompilationDeps: true,
		// Point to TypeScript config for path resolution
		tsConfig: {
			fileName: 'tsconfig.json',
		},
	},
};

// Export as CommonJS for dependency-cruiser compatibility
// This file is loaded via load-depcruise-config.js which uses ts-node
export default config;
module.exports = config;