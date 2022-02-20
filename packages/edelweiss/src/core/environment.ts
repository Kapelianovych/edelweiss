const isBrowser = 'window' in globalThis;
let isDomHydrated = !isBrowser;

export const isServer = (): boolean => !isBrowser;

export const hydrated = (value?: boolean): boolean =>
	value === undefined ? isDomHydrated : (isDomHydrated = value);
