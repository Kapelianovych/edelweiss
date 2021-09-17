const base = require('../../jest.config');

module.exports = {
	...base,
	// We intentionally set this value to node
	// in order to prevent attaching `jsdom`'s window
	// and document objects to globalThis.
	nodeEnvironment: 'node',
};
