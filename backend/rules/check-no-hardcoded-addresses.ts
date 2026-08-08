import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Fitness function: no private network address may appear in tracked source.
 *
 * Deployment addresses belong in environment variables and the Ansible inventory,
 * not in the repository. A hardcoded LAN address is two problems at once: it
 * publishes internal topology to anyone who reads the code, and it goes stale
 * silently the moment a host moves — which is exactly how the frontend ended up
 * dialing a thoth box that had already been retired.
 *
 * Loopback and wildcard binds are allowed: they name no host and leak nothing.
 */

type Violation = {
	path: string;
	line: number;
	address: string;
	text: string;
};

// RFC 1918 only. Deliberately not "any dotted quad" — four-part version numbers
// are common in dependency metadata and would drown the signal in false alarms.
const PRIVATE_ADDRESS =
	/\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g;

const SCANNED_EXTENSIONS = [
	'.ts',
	'.tsx',
	'.js',
	'.mjs',
	'.cjs',
	'.json',
	'.md',
	'.yml',
	'.yaml',
	'.sh',
	'.sample',
	'.example',
];

const EXCLUDED_PATHS = [
	'package-lock.json',
	// This file describes the pattern it forbids.
	'backend/rules/check-no-hardcoded-addresses.ts',
];

const repoRoot = path.resolve(__dirname, '..', '..');

const trackedFiles = (): string[] =>
	execSync('git ls-files', { cwd: repoRoot, encoding: 'utf-8' })
		.split('\n')
		.filter(Boolean)
		.filter((file) => SCANNED_EXTENSIONS.includes(path.extname(file)))
		.filter((file) => !EXCLUDED_PATHS.some((excluded) => file.endsWith(excluded)));

const scan = (file: string): Violation[] => {
	const absolute = path.join(repoRoot, file);
	let contents: string;
	try {
		contents = fs.readFileSync(absolute, 'utf-8');
	} catch {
		// Tracked but absent locally (sparse checkout, deleted-not-committed).
		return [];
	}

	const violations: Violation[] = [];
	contents.split('\n').forEach((text, index) => {
		for (const address of text.match(PRIVATE_ADDRESS) ?? []) {
			violations.push({
				path: file,
				line: index + 1,
				address,
				text: text.trim(),
			});
		}
	});
	return violations;
};

const main = (): void => {
	const violations = trackedFiles().flatMap(scan);

	if (violations.length === 0) {
		console.log('✅ No hardcoded private network addresses found');
		process.exit(0);
	}

	console.error(
		`❌ Found ${violations.length} hardcoded private network address(es):\n`,
	);
	for (const violation of violations) {
		console.error(`  ${violation.path}:${violation.line}  ${violation.address}`);
		console.error(`    ${violation.text}\n`);
	}
	console.error(
		'Move the address into an environment variable (and document it in ' +
			'.env.sample), or into the deployment inventory. In prose and comments, ' +
			'use a placeholder such as <thoth-host>.\n',
	);
	process.exit(1);
};

main();
