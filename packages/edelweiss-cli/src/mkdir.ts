import { existsSync, promises } from 'fs';

export const mkdir = async (url: string): Promise<void> =>
	void (!existsSync(url) && (await promises.mkdir(url, { recursive: true })));
