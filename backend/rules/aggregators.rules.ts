/**
 * Aggregator Dependency Rules
 *
 * Rules enforcing that aggregators follow architectural constraints:
 * - Cannot depend on other aggregators (same-level injection forbidden)
 *   (except ports/interfaces which are allowed)
 * - Cannot depend on domain services
 */

import type { IForbiddenRuleType } from 'dependency-cruiser';

export const aggregatorRules: IForbiddenRuleType[] = [
	{
		name: 'aggregators-no-other-aggregators',
		comment: 'Aggregators should not depend on other aggregators',
		severity: 'error',
		from: {
			path: '.*\\.aggregator\\.ts$', // Match only files ending with .aggregator.ts
			pathNot: '(__specs__|__spec__)',
		},
		to: {
			path: '.*\\.aggregator\\.ts$', // Match only files ending with .aggregator.ts
			pathNot: '(\\.port|port\\.)', // Allow ports/interfaces - aggregators can implement ports
		},
	},
	{
		name: 'aggregators-no-services',
		comment: 'Aggregators should not depend on domain services',
		severity: 'error',
		from: {
			path: '.*\\.aggregator\\.ts$', // Match only files ending with .aggregator.ts
			pathNot: '(__specs__|__spec__)',
		},
		to: { path: '.*\\.service\\.ts$' },
	},
];

