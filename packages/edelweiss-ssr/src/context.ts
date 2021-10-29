import { webcrypto } from 'crypto';

import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();

// Add missing implementation for `window.crypto` object.
Object.assign(window, {
	crypto: webcrypto,
});
