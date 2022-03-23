import { data } from './reactive/data';
import { Computed } from './reactive/global';

/** Describes common shape of user-provided texts. */
export interface Texts {
	readonly [key: string]: string | Texts;
}

export interface Translation {
	readonly code: string;
	readonly texts: Texts;
	readonly namespace?: string;
}

const DEFAULT_NAMESPACE = '__default';

const KEY_SEPARATOR = '###';

const createKey = (
	code: string,
	namespace: string = DEFAULT_NAMESPACE,
): string => `${code}${KEY_SEPARATOR}${namespace}`;

/**
 * Function that if called without arguments returns
 * current language's code. Otherwise, it changes
 * the language of the application.
 */
export const language = data(globalThis.navigator?.language ?? '');

const translationsCache = new Map<string, Texts>();

/**
 * Add every translation object as supported language.
 * If there will be previously added _translation_
 * object bound with _language_ code then next
 * assigning any translations to the same _language_
 * will overwrite previous one.
 */
export const translations = (...args: ReadonlyArray<Translation>): void =>
	args.forEach(({ code, texts, namespace }) =>
		translationsCache.set(createKey(code, namespace), texts),
	);

const insertVariables = (to: string, variable: string, value: string): string =>
	to.replace(new RegExp(`{\\s*${variable}\\s*}`, 'g'), value);

type Delimiter = '.';

type KeysToPath<T extends string | object> = T extends string
	? []
	: {
			[K in keyof T]: [K, ...KeysToPath<Extract<T[K], string | object>>];
	  }[keyof T];

type Join<T extends ReadonlyArray<string>, D extends string> = T extends []
	? never
	: T extends [infer F]
	? F
	: T extends [infer F, ...infer R]
	? F extends string
		? `${F}${D}${Join<Extract<R, ReadonlyArray<string>>, D>}`
		: never
	: string;

type Trim<A extends string> = A extends ` ${infer B}`
	? Trim<B>
	: A extends `${infer C} `
	? Trim<C>
	: A;

type VariableName<A extends string> =
	A extends `${infer A}{${infer B}}${infer C}`
		? VariableName<A> | Trim<B> | VariableName<C>
		: never;

type Variables<
	T extends string | object,
	P extends string,
	Delimiter extends string,
> = P extends `${infer A}${Delimiter}${infer O}`
	? A extends keyof T
		? Variables<Extract<T[A], string | object>, O, Delimiter>
		: never
	: P extends `${infer A}`
	? A extends keyof T
		? VariableName<Extract<T[A], string>>
		: never
	: never;

/**
 * Get translated text based on _path_ parts.
 * Parts must be joined with points. Example: `foo.baz`.
 *
 * Translated text can be provided with variables within.
 * For that define translation endpoint with `{ variableName }` syntax
 * and pass second argument to this method like: `{ variableName: 'some value' }`.
 */
export const translate =
	<
		T extends Texts,
		Namespace extends string = typeof DEFAULT_NAMESPACE,
		Path extends Join<KeysToPath<T>, Delimiter> = Join<
			KeysToPath<T>,
			Delimiter
		>,
	>(
		path: Path | `${Namespace}${Delimiter}${Path}`,
		variables: Record<Variables<T, Path, Delimiter>, string> = {},
	): Computed<undefined | string | Texts> =>
	() => {
		const code = language();

		const pathParts = path.split('.');

		const possibleNamespace = pathParts[0];

		const key = createKey(code, possibleNamespace);

		const containsNamespace = translationsCache.has(key);

		const partsToSearch = containsNamespace ? pathParts.slice(1) : pathParts;

		return Object.entries(variables).reduce<undefined | string | Texts>(
			(translated, [name, value]) =>
				typeof translated === 'string'
					? insertVariables(translated, name, String(value))
					: translated,
			partsToSearch.reduce<undefined | string | Texts>(
				(translated, current) =>
					!translated || typeof translated === 'string'
						? translated
						: translated[current],
				translationsCache.get(containsNamespace ? key : createKey(code)),
			),
		);
	};

/** Return codes of all supported languages. */
export const languages = (): ReadonlyArray<string> =>
	Array.from(translationsCache.keys()).map(
		(key) => key.split(KEY_SEPARATOR)[0],
	);
