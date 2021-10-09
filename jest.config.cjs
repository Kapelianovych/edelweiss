module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	modulePathIgnorePatterns: [
		'<rootDir>/packages/edelweiss/build/',
		'<rootDir>/packages/edelweiss-cli/build/',
		'<rootDir>/packages/edelweiss-ssr/build/',
	],
};
