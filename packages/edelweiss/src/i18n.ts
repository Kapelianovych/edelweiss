import { data } from './core/reactive/data';
import { Computed } from './core/reactive/global';

/** Describes common shape of user-provided texts. */
export interface Texts {
	readonly [key: string]: string | Texts;
}

export interface Translation {
	readonly code: string;
	readonly texts: Texts;
}

const languageCode = data(window.navigator.language);
const translationsCache = new Map<string, Texts>();

/**
 * Function that if called without arguments returns
 * current language's code. Otherwise, it changes
 * the language of the application.
 */
export const language = languageCode;

/**
 * Add every translation object as supported language.
 * If there will be previously added _translation_
 * object bound with _language_ code then next
 * assigning any translations to the same _language_
 * will overwrite previous one.
 */
export const translations = (...args: ReadonlyArray<Translation>): void =>
	args.forEach(({ code, texts }) => translationsCache.set(code, texts));

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
	D extends string,
> = P extends `${infer A}${D}${infer O}`
	? A extends keyof T
		? Variables<Extract<T[A], string | object>, O, D>
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
		P extends Join<KeysToPath<T>, Delimiter> = Join<KeysToPath<T>, Delimiter>,
	>(
		path: P,
		variables: Record<Variables<T, P, Delimiter>, string> = {},
	): Computed<undefined | string | Texts> =>
	() => {
		const code = languageCode();

		return Object.entries(variables).reduce<undefined | string | Texts>(
			(translated, [name, value]) =>
				typeof translated === 'string'
					? insertVariables(translated, name, String(value))
					: translated,
			path
				.split('.')
				.reduce<undefined | string | Texts>(
					(translated, current) =>
						!translated || typeof translated === 'string'
							? translated
							: translated[current],
					translationsCache.get(code),
				),
		);
	};

/** Return codes of all supported languages. */
export const languages = (): ReadonlyArray<string> =>
	Array.from(translationsCache.keys());
