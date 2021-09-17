/** Generates unique id. */
export const uid = (): string =>
	window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
