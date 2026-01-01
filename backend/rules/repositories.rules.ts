/**
 * Repository Dependency Rules
 *
 * Rules enforcing that repositories follow architectural constraints:
 * - Cannot depend on transaction scripts, services, converters, assemblers, or mappers
 * - Repositories are the data access layer and should remain shallow
 */

import type { IForbiddenRuleType } from 'dependency-cruiser';

export const repositoryRules: IForbiddenRuleType[] = [
	{
		name: 'repositories-no-transaction-scripts',
		comment: 'Repositories should not depend on transaction scripts',
		severity: 'error',
		from: { path: '.*repositories.*' },
		to: { path: '.*\\.transaction\\.script\\.ts$' },
	},
	{
		name: 'repositories-no-services',
		comment: 'Repositories should not depend on domain services',
		severity: 'error',
		from: { path: '.*repositories.*' },
		to: { path: '.*\\.service\\.ts$' },
	},
	{
		name: 'repositories-no-converters',
		comment: 'Repositories should not depend on converters',
		severity: 'error',
		from: { path: '.*repositories.*' },
		to: { path: '.*\\.converter\\.ts$' },
	},
	{
		name: 'repositories-no-assemblers',
		comment: 'Repositories should not depend on assemblers',
		severity: 'error',
		from: { path: '.*repositories.*' },
		to: { path: '.*\\.assembler\\.ts$' },
	},
	{
		name: 'repositories-no-mappers',
		comment: 'Repositories should not depend on mappers',
		severity: 'error',
		from: { path: '.*repositories.*' },
		to: { path: '.*\\.mapper\\.ts$' },
	},
];

