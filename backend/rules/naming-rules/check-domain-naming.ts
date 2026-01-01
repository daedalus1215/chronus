/**
 * Domain Naming Convention Fitness Function
 *
 * Checks that domain files do not use "Dto" naming convention.
 * Domain layer should use:
 * - "Command" for inputs (intent to change state)
 * - "Params" for transaction script inputs
 * - "Projection" for outputs
 *
 * Usage: npx ts-node fitness-functions-rules/naming-rules/check-domain-naming.ts
 */

import { execSync } from 'child_process';

type ViolationType = 'filename' | 'content';

type Violation = {
	type: ViolationType;
	path: string;
	line?: number;
	message: string;
};

const DOMAIN_PATH_PATTERN = 'src/*/domain';

const checkDtoInFilenames = (): Violation[] => {
	const violations: Violation[] = [];

	try {
		const result = execSync(
			`find ${DOMAIN_PATH_PATTERN} -type f \\( -iname "*dto*" -o -iname "*Dto*" \\) 2>/dev/null`,
			{ encoding: 'utf-8' },
		);

		const files = result.trim().split('\n').filter(Boolean);
		for (const file of files) {
			violations.push({
				type: 'filename',
				path: file,
				message: `File name contains "Dto". Domain files should use "Projection", "Command", or "Params" instead.`,
			});
		}
	} catch {
		// find returns non-zero if no files found, which is expected
	}

	return violations;
};

const checkDtoInClassNames = (): Violation[] => {
	const violations: Violation[] = [];

	try {
		// Search for class/type/interface names ending with Dto in domain files
		const result = execSync(
			`grep -rn -E "(class|type|interface)\\s+\\w*Dto\\b" ${DOMAIN_PATH_PATTERN} --include="*.ts" 2>/dev/null || true`,
			{ encoding: 'utf-8' },
		);

		const lines = result.trim().split('\n').filter(Boolean);
		for (const line of lines) {
			const match = line.match(/^([^:]+):(\d+):(.+)$/);
			if (match) {
				const [, path, lineNum, content] = match;
				// Skip spec files
				if (path.includes('__specs__') || path.includes('.spec.ts')) {
					continue;
				}
				violations.push({
					type: 'content',
					path,
					line: parseInt(lineNum, 10),
					message: `Class/type/interface name contains "Dto": ${content.trim()}`,
				});
			}
		}
	} catch {
		// grep returns non-zero if no matches found
	}

	return violations;
};

const main = (): void => {
	console.log('🔍 Checking domain naming conventions...\n');

	const filenameViolations = checkDtoInFilenames();
	const classNameViolations = checkDtoInClassNames();
	const allViolations = [...filenameViolations, ...classNameViolations];

	if (allViolations.length === 0) {
		console.log('✅ No domain naming violations found.\n');
		console.log('Domain layer correctly uses:');
		console.log('  - "Command" for inputs (intent to change state)');
		console.log('  - "Params" for transaction script inputs');
		console.log('  - "Projection" for outputs');
		process.exit(0);
	}

	console.log(`❌ Found ${allViolations.length} naming violation(s):\n`);

	for (const violation of allViolations) {
		if (violation.type === 'filename') {
			console.log(`📁 ${violation.path}`);
			console.log(`   ${violation.message}\n`);
		} else {
			console.log(`📄 ${violation.path}:${violation.line}`);
			console.log(`   ${violation.message}\n`);
		}
	}

	console.log('\n💡 Fix suggestions:');
	console.log('  - Rename "Dto" to "Projection" for output types');
	console.log('  - Rename "Dto" to "Command" for service input types');
	console.log(
		'  - Rename "Dto" to "Params" for transaction script input types',
	);

	process.exit(1);
};

main();

