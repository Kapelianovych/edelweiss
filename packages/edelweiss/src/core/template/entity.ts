import { isObject } from '../utilities/checks';
import { RawDOMFragment } from '../fragment';

export const templateSymbol: unique symbol = Symbol('Template');

export interface Template {
	readonly _id: typeof templateSymbol;
	readonly markers: RawDOMFragment['markers'];
	readonly fragment: DocumentFragment;

	clone: () => Template;
	build: () => DocumentFragment;
}

export const isTemplate = (value: unknown): value is Template =>
	isObject(value) && (value as Template)._id === templateSymbol;
