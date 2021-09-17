// @ts-ignore
window.crypto = {
  getRandomValues(array: Uint32Array): Uint32Array {
    // We do not need to polyfill window.crypto,
    // so we just return array with one number.
    return array.map(() => Math.ceil(Math.random() * 1000) << 1);
  },
};
