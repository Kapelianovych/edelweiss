import { Command } from 'commander';

import { version } from '../package.json';
import { createProject } from './create_project';

export const start = (args: Array<string>): Command =>
	new Command()
		.version(version)
		.arguments('[folder]')
		.description('Creates Edelweiss project under specified folder', {
			folder:
				'Name of the directory inside which Edelweiss project needs to be ' +
				'initialized. By default, it is current directory.',
		})
		.action(createProject)
		.parse(args);
