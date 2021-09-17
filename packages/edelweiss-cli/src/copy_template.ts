import { promises, readdirSync } from 'fs';
import { join, dirname, resolve } from 'path';

import { mkdir } from './mkdir';
import { createSpinner } from './spinner';

const templateAbsolutePath = resolve(
  dirname(import.meta.url.replace('file://', '')),
  '../templates/standard'
);

const buildPathsFrom = (
  directory: string,
  relativePath: string = ''
): ReadonlyArray<string> =>
  readdirSync(join(directory, relativePath), { withFileTypes: true })
    .map((name) =>
      name.isDirectory()
        ? buildPathsFrom(directory, join(relativePath, name.name))
        : [join(relativePath, name.name)]
    )
    .reduce((all, current) => all.concat(current), []);

export const copyTemplate = async (destinationAbsoluteUrl: string) => {
  const spinner = createSpinner('Start copying files...');

  return Promise.all(
    buildPathsFrom(templateAbsolutePath).map((url) =>
      mkdir(dirname(join(destinationAbsoluteUrl, url))).then(() =>
        promises.copyFile(
          join(templateAbsolutePath, url),
          join(destinationAbsoluteUrl, url)
        )
      )
    )
  ).then(
    () => spinner.succeed('Template is generated.'),
    (error: Error) => spinner.fail(error.toString())
  );
};
