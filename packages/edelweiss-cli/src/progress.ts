/** Shows progress of process. */
export const progress = (count: number, current: number): string =>
  `[ ${new Array(current).fill('>').join('')}${new Array(count - current - 1)
    .fill(' ')
    .join('')} ] ${Math.floor((current / count) * 100)}%`;
