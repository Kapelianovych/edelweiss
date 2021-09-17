import { exec } from 'child_process';
import { promisify } from 'util';

export interface Dependency {
  name: string;
  type?: 'dev' | 'peer' | 'regular';
}

export const install = (cwd: string) => (dependency: string | Dependency) => {
  const packageNameWithType =
    typeof dependency === 'string'
      ? dependency
      : dependency.type === 'dev'
      ? '-D ' + dependency.name
      : dependency.name;

  return promisify(exec)('npm i ' + packageNameWithType, { cwd });
};
