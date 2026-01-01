/**
 * Common Dependency Cruiser Rules
 *
 * Rules that apply across all patterns, such as orphan detection
 * and domain boundary rules.
 */

import type { IForbiddenRuleType } from 'dependency-cruiser';

export const commonRules: IForbiddenRuleType[] = [
	{
		name: 'no-orphans',
		severity: 'error',
		from: {
			path: '.*',
			orphan: true,
			pathNot:
				'(/migrations/|__specs__|__spec__|__tests__|typeorm/data-source)',
		},
		to: {},
	},
	// Domain Boundaries
	{
		name: 'cases-entities-no-records-entities',
		comment: 'Cases entities should not depend on records entities',
		severity: 'error',
		from: { path: '.*cases.*entities.*' },
		to: { path: '.*records.*entities.*' },
	},
	{
		name: 'records-entities-no-cases-entities',
		comment: 'Records entities should not depend on cases entities',
		severity: 'error',
		from: { path: '.*records.*entities.*' },
		to: { path: '.*cases.*entities.*' },
	},
];

