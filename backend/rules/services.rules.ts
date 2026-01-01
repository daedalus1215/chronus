/**
 * Domain Service Dependency Rules
 *
 * Rules enforcing that domain services follow architectural constraints:
 * - Cannot depend on other domain services (creates tight coupling)
 * - Cannot depend on mappers, converters, or assemblers directly
 *   (use transaction scripts instead)
 */

import type { IForbiddenRuleType } from 'dependency-cruiser';

export const serviceRules: IForbiddenRuleType[] = [
	{
		name: 'services-no-other-services',
		comment: 'Domain services should not depend on other domain services',
		severity: 'error',
		from: {
			path: '.*domain/services/.*\\.service\\.ts$',
			pathNot: '(__specs__|__spec__)',
		},
		to: { path: '.*domain/services/.*\\.service\\.ts$' },
	},
	{
		name: 'services-no-mappers',
		comment: 'Domain services should not depend on mappers directly',
		severity: 'error',
		from: {
			path: '.*domain/services/.*\\.service\\.ts$',
			pathNot: 'app/app-service',
		},
		to: { path: '.*\\.mapper\\.ts$' },
	},
	{
		name: 'services-no-assemblers',
		comment: 'Domain services should not depend on assemblers directly',
		severity: 'error',
		from: {
			path: '.*domain/services/.*\\.service\\.ts$',
			pathNot: 'app/app-service',
		},
		to: { path: '.*\\.assembler\\.ts$' },
	},
	{
		name: 'services-no-converters',
		comment: 'Domain services should not depend on converters directly',
		severity: 'error',
		from: {
			path: '.*domain/services/.*\\.service\\.ts$',
			pathNot: 'app/app-service',
		},
		to: { path: '.*\\.converter\\.ts$' },
	},
];

