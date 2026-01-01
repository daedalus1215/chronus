import { execSync } from 'child_process';
import * as fs from 'fs';

type ViolationType = 'centralized-dto-folder' | 'centralized-swagger-folder';

type Violation = {
	type: ViolationType;
	path: string;
	message: string;
};

const APPLICATION_PATH_PATTERN = 'src/*/apps';

const checkCentralizedDtoFolders = (): Violation[] => {
	const violations: Violation[] = [];
	const dtoFolders = [
		'dtos/requests',
		'dtos/responses',
		'dtos/shared',
		'dtos',
	];

	for (const dtoFolder of dtoFolders) {
		try {
			const result = execSync(
				`find ${APPLICATION_PATH_PATTERN} -type d -name "${dtoFolder}" 2>/dev/null`,
				{ encoding: 'utf-8' },
			);
			const folders = result.trim().split('\n').filter(Boolean);
			for (const folder of folders) {
				const files = fs
					.readdirSync(folder)
					.filter((file) => file.endsWith('.ts'));
				if (files.length > 0) {
					violations.push({
						type: 'centralized-dto-folder',
						path: folder,
						message: `Centralized DTO folder found with ${files.length} file(s). DTOs should be co-located with their actions (e.g., actions/my-action/my.request.dto.ts).`,
					});
				}
			}
		} catch {}
	}
	return violations;
};

const checkCentralizedSwaggerFolders = (): Violation[] => {
	const violations: Violation[] = [];
	try {
		const result = execSync(
			`find ${APPLICATION_PATH_PATTERN}/actions -type d -name "swagger" 2>/dev/null`,
			{ encoding: 'utf-8' },
		);
		const folders = result.trim().split('\n').filter(Boolean);
		for (const folder of folders) {
			// Exclude the api-params.ts file from the count if it exists
			const files = fs
				.readdirSync(folder)
				.filter(
					(file) => file.endsWith('.ts') && file !== 'api-params.ts',
				);

			if (files.length > 0) {
				violations.push({
					type: 'centralized-swagger-folder',
					path: folder,
					message: `Centralized swagger folder found with ${files.length} swagger file(s). Swagger files should be co-located with their actions (e.g., actions/my-action/my.action.swagger.ts).`,
				});
			}
		}
	} catch {}
	return violations;
};

const main = (): void => {
	console.log('🔍 Checking DTO structure conventions...\n');
	const dtoViolations = checkCentralizedDtoFolders();
	const swaggerViolations = checkCentralizedSwaggerFolders();
	const allViolations = [...dtoViolations, ...swaggerViolations];

	if (allViolations.length === 0) {
		console.log('✅ No DTO structure violations found.\n');
		console.log(
			'DTOs and swagger files are correctly co-located with actions:',
		);
		console.log(
			'  - DTOs live in: actions/{action-name}/{action}.request.dto.ts',
		);
		console.log(
			'  - Swagger files live in: actions/{action-name}/{action}.action.swagger.ts',
		);
		console.log('  - No centralized application/dtos/ folders');
		process.exit(0);
	}

	console.log(
		`❌ Found ${allViolations.length} DTO structure violation(s):\n`,
	);
	for (const violation of allViolations) {
		console.log(`📂 ${violation.path}`);
		console.log(`   ${violation.message}\n`);
	}

	console.log('\n💡 Fix suggestions:');
	console.log(
		'  - Move DTOs to their action folders: actions/my-action/my.request.dto.ts',
	);
	console.log(
		'  - Move swagger files to action folders: actions/my-action/my.action.swagger.ts',
	);
	console.log('  - Delete empty centralized folders after moving files');
	console.log(
		'  - Use naming: {action}.request.dto.ts for request DTOs, {action}.response.dto.ts for response DTOs',
	);
	process.exit(1);
};

main();

