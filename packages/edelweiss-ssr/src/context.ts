import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();

// Add missing implementation for `window.crypto` object.
Object.assign(window, {
  crypto: {
    getRandomValues: (array: Array<number>): Array<number> =>
      array.map(() =>
        Number(((Math.random() * 1000) >> 2) * ((Math.random() * 1000) >> 2))
      ),
  },
});
