import { Marker } from './marker';
import { Content } from './content';
import { isServer } from './environment';
import { renderer } from './renderer';
import { fillNodes, fillString } from './processing';

export interface Template {
	readonly markers: Map<string, Marker>;
	readonly isTemplate: boolean;

	readonly build: <T extends string | Node>() => T;
}

export const createTemplate = ({ html, markers }: Content): Template => ({
	markers,
	isTemplate: true,

	build: <T extends string | Node>() =>
		isServer()
			? (fillString(html, markers) as T)
			: (fillNodes(renderer.parse(html), markers) as T),
});
