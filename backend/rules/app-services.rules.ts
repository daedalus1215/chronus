/**
 * App Service Dependency Rules
 *
 * Rules enforcing that app services follow architectural constraints:
 * - Cannot depend on other app services (same-level injection forbidden)
 * - Cannot depend on repositories, transaction scripts, aggregators, mappers, assemblers, or converters
 *   (use domain services instead)
 */

import type { IForbiddenRuleType } from 'dependency-cruiser';

export const appServiceRules: IForbiddenRuleType[] = [
	{
		name: 'app-services-no-other-app-services',
		comment: 'App services should not depend on other app services',
		severity: 'error',
		from: {
			path: '.*app/app-service/.*',
			pathNot: '(__specs__|__spec__)',
		},
		to: { path: '.*app/app-service/.*' },
	},
	{
		name: 'app-services-no-repositories',
		comment:
			'App services should not depend on repositories. Use domain services instead.',
		severity: 'error',
		from: { path: '.*app/app-service/.*' },
		to: { path: '.*repositories.*' },
	},
	{
		name: 'app-services-no-transaction-scripts',
		comment:
			'App services should not depend on transaction scripts. Use domain services instead.',
		severity: 'error',
		from: { path: '.*app/app-service/.*' },
		to: { path: '.*\\.transaction\\.script\\.ts$' },
	},
	{
		name: 'app-services-no-aggregators',
		comment:
			'App services should not depend on aggregators. Use domain services instead.',
		severity: 'error',
		from: { path: '.*app/app-service/.*' },
		to: { path: '.*aggregator.*' },
	},
	{
		name: 'app-services-no-mappers',
		comment:
			'App services should not depend on mappers. Use domain services instead.',
		severity: 'error',
		from: { path: '.*app/app-service/.*' },
		to: { path: '.*\\.mapper\\.ts$' },
	},
	{
		name: 'app-services-no-assemblers',
		comment:
			'App services should not depend on assemblers. Use domain services instead.',
		severity: 'error',
		from: { path: '.*app/app-service/.*' },
		to: { path: '.*\\.assembler\\.ts$' },
	},
	{
		name: 'app-services-no-converters',
		comment:
			'App services should not depend on converters. Use domain services instead.',
		severity: 'error',
		from: { path: '.*app/app-service/.*' },
		to: { path: '.*\\.converter\\.ts$' },
	},
];

