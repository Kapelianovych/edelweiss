/** Creates a hash from a string with an optional seed. */
export const hash = (text: string, seed = 0): string => {
	// https://stackoverflow.com/a/52171480
	let { first, second } = text.split('').reduce(
		(hashes, character) => ({
			first: Math.imul(hashes.first ^ character.charCodeAt(0), 2654435761),
			second: Math.imul(hashes.second ^ character.charCodeAt(0), 1597334677),
		}),
		{ first: 0xdeadbeef ^ seed, second: 0x41c6ce57 ^ seed },
	);
	first =
		Math.imul(first ^ (first >>> 16), 2246822507) ^
		Math.imul(second ^ (second >>> 13), 3266489909);
	second =
		Math.imul(second ^ (second >>> 16), 2246822507) ^
		Math.imul(first ^ (first >>> 13), 3266489909);
	return (4294967296 * (2097151 & second) + (first >>> 0)).toString(36);
};
