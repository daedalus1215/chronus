/**
 * Layer Dependency Rules
 *
 * Rules enforcing proper layer boundaries in the architecture:
 * - Infrastructure should not depend on application layer
 * - Domain should not depend on application layer
 *
 * Note: For naming conventions (no "Dto" in domain), see:
 * - npm run test:fitness
 * - rules/naming-rules/check-domain-naming.ts
 */

import type { IForbiddenRuleType } from 'dependency-cruiser';

export const layerDependencyRules: IForbiddenRuleType[] = [
	{
		name: 'infrastructure-no-application',
		comment: 'Infrastructure should not depend on application layer',
		severity: 'error',
		from: { path: '.*infrastructure.*' },
		to: { path: '.*application.*' },
	},
	{
		name: 'domain-no-application',
		comment:
			'Domain should not depend on application layer. Use Commands/Projections instead of DTOs.',
		severity: 'error',
		from: { path: '.*domain.*' },
		to: { path: '.*\\.application\\.ts$' },
	},
];

