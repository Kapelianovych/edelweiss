let isBrowser = 'window' in globalThis;

export const isServer = (): boolean => !isBrowser;
