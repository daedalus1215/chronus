import { execSync } from 'child_process';
import * as fs from 'fs';

type ViolationType =
	| 'centralized-types-folder'
	| 'orphaned-param-file'
	| 'generic-type-file';

type Violation = {
	type: ViolationType;
	path: string;
	message: string;
};

const DOMAIN_PATH_PATTERN = 'src/*/domain';

/**
 * Checks for centralized types/ folders in domain layer.
 * Types should be colocated with their consumers (transaction-scripts, services, etc.)
 */
const checkCentralizedTypesFolders = (): Violation[] => {
	const violations: Violation[] = [];
	try {
		const result = execSync(
			`find ${DOMAIN_PATH_PATTERN} -type d -name "types" 2>/dev/null`,
			{ encoding: 'utf-8' },
		);
		const folders = result.trim().split('\n').filter(Boolean);
		for (const folder of folders) {
			// Check if folder has any .ts files
			const files = fs
				.readdirSync(folder)
				.filter((file) => file.endsWith('.ts'));
			if (files.length > 0) {
				violations.push({
					type: 'centralized-types-folder',
					path: folder,
					message: `Centralized types/ folder found with ${files.length} file(s). Types should be colocated with their consumers (e.g., {ts-name}.param.ts next to transaction script).`,
				});
			}
		}
	} catch {}
	return violations;
};

/**
 * Checks for .param.ts files that aren't colocated with their consumers.
 * Params should live in the same folder as the TS, service, or aggregator that uses them.
 */
const checkOrphanedParamFiles = (): Violation[] => {
	const violations: Violation[] = [];
	try {
		const result = execSync(
			`find ${DOMAIN_PATH_PATTERN} -type f -name "*.param.ts" 2>/dev/null`,
			{ encoding: 'utf-8' },
		);
		const files = result.trim().split('\n').filter(Boolean);
		for (const file of files) {
			const dir = file.substring(0, file.lastIndexOf('/'));
			const filesInDir = fs.readdirSync(dir);
			// Check if there's a corresponding consumer in the same folder
			const hasTransactionScript = filesInDir.some((f) =>
				f.endsWith('.transaction.script.ts'),
			);
			const hasService = filesInDir.some((f) =>
				f.endsWith('.service.ts'),
			);
			const hasAggregator = filesInDir.some((f) =>
				f.endsWith('.aggregator.ts'),
			);

			if (!hasTransactionScript && !hasService && !hasAggregator) {
				violations.push({
					type: 'orphaned-param-file',
					path: file,
					message: `Param file not colocated with a consumer. Params should live next to their consuming TS, service, or aggregator.`,
				});
			}
		}
	} catch {}
	return violations;
};

/**
 * Checks for generic .type.ts files in the domain layer.
 * These should be renamed to .projection.ts, .param.ts, or inlined.
 */
const checkGenericTypeFiles = (): Violation[] => {
	const violations: Violation[] = [];
	try {
		const result = execSync(
			`find ${DOMAIN_PATH_PATTERN} -type f -name "*.type.ts" 2>/dev/null`,
			{ encoding: 'utf-8' },
		);
		const files = result.trim().split('\n').filter(Boolean);
		for (const file of files) {
			// Exclude files in __specs__ folders
			if (file.includes('__specs__') || file.includes('.spec.ts')) {
				continue;
			}
			violations.push({
				type: 'generic-type-file',
				path: file,
				message: `Generic .type.ts file found. Use .projection.ts for outputs, .param.ts for TS inputs, or .command.ts for service inputs. If only used in tests, inline the type.`,
			});
		}
	} catch {}
	return violations;
};

const main = (): void => {
	console.log('🔍 Checking domain type structure conventions...\n');

	const typesFolderViolations = checkCentralizedTypesFolders();
	const orphanedParamViolations = checkOrphanedParamFiles();
	const genericTypeViolations = checkGenericTypeFiles();

	const allViolations = [
		...typesFolderViolations,
		...orphanedParamViolations,
		...genericTypeViolations,
	];

	if (allViolations.length === 0) {
		console.log('✅ No domain type structure violations found.\n');
		console.log('Domain types correctly follow colocation principle:');
		console.log('  - Params colocated with transaction scripts');
		console.log(
			'  - Projections colocated with producers or in domain/projections/',
		);
		console.log('  - No centralized types/ folders');
		console.log('  - Test-only types are inlined in spec files');
		process.exit(0);
	}

	console.log(
		`❌ Found ${allViolations.length} type structure violation(s):\n`,
	);
	for (const violation of allViolations) {
		console.log(`📂 ${violation.path}`);
		console.log(`   ${violation.message}\n`);
	}

	console.log('\n💡 Colocation principle:');
	console.log('  - Params (.param.ts) → next to transaction script');
	console.log('  - Commands (.command.ts) → next to service');
	console.log(
		'  - Projections (.projection.ts) → next to producing TS or in domain/projections/',
	);
	console.log('  - Test-only types → inline in spec file');
	console.log('  - Shared types → in constants.ts or shared/');
	process.exit(1);
};

main();

