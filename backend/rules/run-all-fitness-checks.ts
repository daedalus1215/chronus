import { execSync } from 'child_process';

type Check = {
	name: string;
	command?: string;
	script?: string;
};

const checks: Check[] = [
	{
		name: 'Architecture',
		command: 'depcruise --config load-depcruise-config.js src',
	},
	{
		name: 'Domain Naming',
		script: 'fitness-functions-rules/naming-rules/check-domain-naming.ts',
	},
	{
		name: 'Domain Type Structure',
		script: 'fitness-functions-rules/naming-rules/check-domain-type-structure.ts',
	},
	{
		name: 'DTO Structure',
		script: 'fitness-functions-rules/naming-rules/check-dto-structure.ts',
	},
];

const buildCommand = (check: Check): string => {
	if (check.command) {
		return check.command;
	}
	return `npx ts-node -r tsconfig-paths/register ${check.script}`;
};

const main = (): void => {
	console.log('🔍 Running all fitness function checks...\n');

	let hasErrors = false;

	for (const check of checks) {
		console.log(`\n📋 Running ${check.name} check...`);
		console.log('─'.repeat(50));

		try {
			execSync(buildCommand(check), {
				stdio: 'inherit',
				encoding: 'utf-8',
			});
			console.log(`✅ ${check.name} check passed\n`);
		} catch {
			hasErrors = true;
			console.error(`❌ ${check.name} check failed\n`);
		}
	}

	if (hasErrors) {
		console.error(
			'\n❌ Some fitness function checks failed. Please fix the violations above.\n',
		);
		process.exit(1);
	}

	console.log('\n✅ All fitness function checks passed!\n');
	process.exit(0);
};

main();

