/**
 * Converter Dependency Rules
 *
 * Rules enforcing that converters follow architectural constraints:
 * - Cannot depend on repositories (use assemblers instead)
 * - Cannot depend on other converters (same-level injection forbidden)
 * - Cannot depend on transaction scripts, services, mappers, or assemblers
 */

import type { IForbiddenRuleType } from 'dependency-cruiser';

export const converterRules: IForbiddenRuleType[] = [
	{
		name: 'converters-no-repositories',
		comment: 'Converters should not depend on repositories',
		severity: 'error',
		from: {
			path: '.*\\.converter\\.ts$',
			pathNot: '(__specs__|__spec__)',
		},
		to: { path: '^src/.*/repositories/.*' },
	},
	{
		name: 'converters-no-other-converters',
		comment:
			'Converters should not depend on other converters (same-level injection forbidden)',
		severity: 'error',
		from: {
			path: '.*\\.converter\\.ts$',
			pathNot: '(__specs__|__spec__)',
		},
		to: {
			path: '.*\\.converter\\.ts$',
		},
	},
	{
		name: 'converters-no-transaction-scripts',
		comment: 'Converters should not depend on transaction scripts',
		severity: 'error',
		from: { path: '.*\\.converter\\.ts$' },
		to: { path: '.*\\.transaction\\.script\\.ts$' },
	},
	{
		name: 'converters-no-services',
		comment: 'Converters should not depend on domain services',
		severity: 'error',
		from: { path: '.*\\.converter\\.ts$' },
		to: { path: '.*\\.service\\.ts$' },
	},
	{
		name: 'converters-no-mappers',
		comment: 'Converters should not depend on mappers',
		severity: 'error',
		from: { path: '.*\\.converter\\.ts$' },
		to: { path: '.*\\.mapper\\.ts$' },
	},
	{
		name: 'converters-no-assemblers',
		comment: 'Converters should not depend on assemblers',
		severity: 'error',
		from: { path: '.*\\.converter\\.ts$' },
		to: { path: '.*\\.assembler\\.ts$' },
	},
];

