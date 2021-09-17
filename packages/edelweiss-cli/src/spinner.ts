import ora, { Ora } from 'ora';

export const createSpinner = (text: string): Ora =>
	ora({
		text,
		prefixText: '',
	}).start();
