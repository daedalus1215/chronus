/**
 * Transaction Script Dependency Rules
 *
 * Rules enforcing that transaction scripts follow architectural constraints:
 * - Cannot depend on other transaction scripts (same-level injection forbidden)
 * - Cannot depend on domain services (creates circular dependency)
 * - Cannot depend on aggregators (aggregators should only be injected into services or higher)
 */

import type { IForbiddenRuleType } from 'dependency-cruiser';

export const transactionScriptRules: IForbiddenRuleType[] = [
	{
		name: 'transaction-scripts-no-other-transaction-scripts',
		comment:
			'Transaction scripts should not depend on other transaction scripts',
		severity: 'error',
		from: {
			path: '.*\\.transaction\\.script\\.ts$',
			pathNot: '(__specs__|__spec__)',
		},
		to: { path: '.*\\.transaction\\.script\\.ts$' },
	},
	{
		name: 'transaction-scripts-no-services',
		comment: 'Transaction scripts should not depend on domain services',
		severity: 'error',
		from: { path: '.*\\.transaction\\.script\\.ts$' },
		to: { path: '.*\\.service\\.ts$' },
	},
	{
		name: 'transaction-scripts-no-aggregators',
		comment:
			'Transaction scripts should not depend on aggregators - aggregators should only be injected into services or higher',
		severity: 'error',
		from: {
			path: '.*\\.transaction\\.script\\.ts$',
			pathNot: '(__specs__|__spec__)',
		},
		to: {
			path: '.*aggregator.*',
			pathNot: '(\\.port|port\\.)',
		},
	},
];

