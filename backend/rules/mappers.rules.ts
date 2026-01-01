/**
 * Mapper Dependency Rules
 *
 * Rules enforcing that mappers follow architectural constraints:
 * - Cannot depend on other mappers (same-level injection forbidden)
 * - Cannot depend on transaction scripts or services
 */

import type { IForbiddenRuleType } from 'dependency-cruiser';

export const mapperRules: IForbiddenRuleType[] = [
	{
		name: 'mappers-no-other-mappers',
		comment: 'Mappers should not depend on other mappers',
		severity: 'error',
		from: {
			path: '.*\\.mapper\\.ts$',
			pathNot: '(__specs__|__spec__)',
		},
		to: { path: '.*\\.mapper\\.ts$' },
	},
	{
		name: 'mappers-no-transaction-scripts',
		comment: 'Mappers should not depend on transaction scripts',
		severity: 'error',
		from: { path: '.*\\.mapper\\.ts$' },
		to: { path: '.*\\.transaction\\.script\\.ts$' },
	},
	{
		name: 'mappers-no-services',
		comment: 'Mappers should not depend on domain services',
		severity: 'error',
		from: { path: '.*\\.mapper\\.ts$' },
		to: { path: '.*\\.service\\.ts$' },
	},
];

