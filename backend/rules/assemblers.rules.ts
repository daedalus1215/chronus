/**
 * Assembler Dependency Rules
 *
 * Rules enforcing that assemblers follow architectural constraints:
 * - Cannot depend on other assemblers (same-level injection forbidden)
 * - Cannot depend on transaction scripts, services, or mappers
 */

import type { IForbiddenRuleType } from 'dependency-cruiser';

export const assemblerRules: IForbiddenRuleType[] = [
	{
		name: 'assemblers-no-other-assemblers',
		comment: 'Assemblers should not depend on other assemblers',
		severity: 'error',
		from: {
			path: '.*\\.assembler\\.ts$',
			pathNot: '(__specs__|__spec__)',
		},
		to: { path: '.*\\.assembler\\.ts$' },
	},
	{
		name: 'assemblers-no-transaction-scripts',
		comment: 'Assemblers should not depend on transaction scripts',
		severity: 'error',
		from: { path: '.*\\.assembler\\.ts$' },
		to: { path: '.*\\.transaction\\.script\\.ts$' },
	},
	{
		name: 'assemblers-no-services',
		comment: 'Assemblers should not depend on domain services',
		severity: 'error',
		from: { path: '.*\\.assembler\\.ts$' },
		to: { path: '.*\\.service\\.ts$' },
	},
	{
		name: 'assemblers-no-mappers',
		comment: 'Assemblers should not depend on mappers',
		severity: 'error',
		from: { path: '.*\\.assembler\\.ts$' },
		to: { path: '.*\\.mapper\\.ts$' },
	},
];

