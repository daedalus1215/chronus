/**
 * General Domain Module Boundary Rules
 *
 * This rule file provides a FULLY AUTOMATIC boundary enforcement for ALL domain
 * modules using pattern matching. No configuration needed when adding new domains!
 *
 * How it works:
 * - Any directory under src/ is considered a domain module UNLESS it's in NON_DOMAIN_MODULES
 * - Uses regex backreferences to automatically allow same-module imports
 * - Automatically forbids cross-module imports except via aggregators/ports/modules
 *
 * Domain modules communicate with each other ONLY through:
 * - Aggregators (*.aggregator.*)
 * - Ports (*.port.*)
 * - Module files (*.module.ts)
 */

import type { IForbiddenRuleType } from 'dependency-cruiser';

/**
 * Non-domain directories that should be excluded from boundary checks.
 * These are infrastructure, shared, or utility modules that can be freely imported.
 *
 * ADD MODULES HERE if they provide shared functionality across domains.
 * Any directory under src/ NOT listed here is automatically treated as a domain module.
 */
const NON_DOMAIN_MODULES = [
	'generic',
	'shared',
	'shared-kernel',
	'health',
	'middleware',
	'typeorm',
	'test-utils',
	'__tests__',
	'audits',
] as const;

/**
 * Pattern matching non-domain modules.
 */
const NON_DOMAIN_PATTERN = `^src/(${NON_DOMAIN_MODULES.join('|')})/`;

/**
 * Allowed cross-module dependencies:
 * - Aggregator files (*.aggregator.*)
 * - Port files (*.port.*)
 * - Module files (*.module.ts)
 */
const ALLOWED_CROSS_MODULE_IMPORTS =
	'(.*\\.aggregator\\.|.*aggregator.*|.*\\.port\\.|.*port.*|.*\\.module(?:\\.ts)?)';

/**
 * Single dynamic rule that enforces domain boundaries using pattern matching.
 *
 * How it works:
 * 1. `from.path` captures the source module name in group $1
 * 2. `from.pathNot` excludes non-domain modules as sources
 * 3. `to.pathNot` allows:
 *    - Same module imports (using $1 backreference)
 *    - Non-domain module imports
 *    - Aggregator/port/module imports
 *
 * Any import that doesn't match the allowed patterns is a violation.
 */
export const domainBoundaryRules: IForbiddenRuleType[] = [
	{
		name: 'domain-module-boundary',
		comment:
			'Domain modules should only depend on other domain modules through aggregators, ports, or module imports. ' +
			'This rule auto-discovers domain modules - no configuration needed when adding new domains.',
		severity: 'error',
		from: {
			// Capture the source module name in group $1
			path: '^src/([^/]+)/',
			// Exclude non-domain modules as sources
			pathNot: NON_DOMAIN_PATTERN,
		},
		to: {
			// Match any import from src/
			path: '^src/[^/]+/',
			// Allow these patterns (violations are anything NOT matching these):
			pathNot: [
				// Allow imports within the same module (backreference to captured group)
				'^src/$1/',
				// Allow imports from non-domain modules (shared infrastructure)
				NON_DOMAIN_PATTERN,
				// Allow imports via aggregators, ports, or module files
				ALLOWED_CROSS_MODULE_IMPORTS,
			],
		},
	},
];

/**
 * Exports constants for use in other rule files if needed.
 */
export { NON_DOMAIN_MODULES, NON_DOMAIN_PATTERN, ALLOWED_CROSS_MODULE_IMPORTS };

