import { promises } from 'fs';
import { join, sep } from 'path';

import chalk from 'chalk';
import { sequentially } from '@fluss/core';

import { progress } from './progress';
import { createSpinner } from './spinner';
import { Dependency, install } from './dependency';

const initPackageJson = (cwd: string) => {
	const directories = cwd.split(sep);
	const lastDirectoryName = directories[directories.length - 1];

	const spinner = createSpinner(
		`Initializing ${chalk.bold.yellow('package.json')}`,
	);

	return promises
		.writeFile(
			join(cwd, 'package.json'),
			JSON.stringify(
				{
					name: lastDirectoryName,
					version: '0.1.0',
					private: true,
					scripts: {
						clean: 'rimraf dist',
						prestart: 'npm run clean',
						start: 'parcel serve ./src/index.html',
						prebuild: 'npm run clean',
						build: 'parcel build ./src/index.html',
					},
				},
				null,
				2,
			),
			{ encoding: 'utf-8' },
		)
		.then(
			() => spinner.succeed(`${chalk.bold.yellow('package.json')} is created.`),
			(error: Error) => spinner.fail(error.toString()),
		);
};

const installDependencies = async (cwd: string) => {
	const spinner = createSpinner('Installing dependencies...');

	return sequentially(
		...(
			[
				'@prostory/edelweiss',
				{ type: 'dev', name: 'parcel' },
				{ type: 'dev', name: 'rimraf' },
				{ type: 'dev', name: 'prettier' },
			] as ReadonlyArray<string | Dependency>
		).map((dependency, index, deps) => () => {
			spinner.prefixText = progress(deps.length, index);
			spinner.text =
				'Installing: ' +
				chalk.bold(
					typeof dependency === 'string' ? dependency : dependency.name,
				);

			return install(cwd)(dependency);
		}),
	)()
		.then(() => (spinner.prefixText = ''))
		.then(
			() => spinner.succeed('Dependencies are installed.'),
			(error: Error) => spinner.fail(error.toString()),
		);
};

export const createPackageJson: (values: string) => Promise<unknown> =
	sequentially(initPackageJson, installDependencies);
