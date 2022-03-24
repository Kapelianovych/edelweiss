import { sanitize } from './sanitizer';
import { isTemplate, Template } from './html';
import { isFunction, isIterable } from './checks';
import { AttributeMark, Container } from './html';

const TOGGLE_ATTRIBUTE_REGEX =
	/\?([\w-]+)\s*=\s*(?<quote>['"]?)({{\w+}})\k<quote>/g;

const REGULAR_ATTRIBUTE_REGEX =
	/\s([\w-]+)\s*=\s*((?<quote>['"])[^'"]*{{\w+}}[^'"]*\k<quote>|{{\w+}})/g;

const NODE_REGEX = /(<!--{{start-(?<id>\w+)}}-->)\s*(<!--{{end-\k<id>}}-->)/g;

const handleToggleAttribute = (
	html: string,
	containers: readonly Container[],
): string =>
	html.replace(TOGGLE_ATTRIBUTE_REGEX, (match, name, _quote, marker) => {
		const container =
			containers.find(
				({ marker: containerMarker }) => containerMarker === marker,
			) ?? null;

		return container === null
			? match
			: Boolean((container.value as Function)())
			? `${match} ${name}=""`
			: match;
	});

const handleRegularAttributes = (
	html: string,
	containers: readonly Container[],
): string =>
	html.replace(REGULAR_ATTRIBUTE_REGEX, (_match, name, value: string) => {
		const attributeContainers = containers.filter(({ marker }) =>
			value.includes(marker),
		);

		const filledValue = attributeContainers.reduce(
			(accumulator, { marker, value }) =>
				accumulator.replace(marker, sanitize(String((value as Function)()))),
			value,
		);

		return ` ${AttributeMark.REGULAR}${name}=${value} ${name}=${filledValue}`;
	});

const packFragment = (fragment: unknown): string =>
	isTemplate(fragment)
		? traverseFragment(fragment)
		: sanitize(String(fragment));

const collectFragments = (fragments: unknown): string =>
	isIterable(fragments)
		? Array.from(fragments)
				.map(packFragment)
				.reduce((accumulator, current) => accumulator + current, '')
		: packFragment(fragments);

const handleNode = (html: string, containers: readonly Container[]): string =>
	html.replace(NODE_REGEX, (match, leftComment, _hash, rightComment) => {
		const container = containers.find(({ marker }) => match === marker) ?? null;

		return container === null
			? match
			: leftComment +
					collectFragments((container.value as Function)()) +
					rightComment;
	});

const traverseFragment = (fragment: Template): string => {
	const containers = Array.from(fragment.markers.values()).filter(({ value }) =>
		isFunction(value),
	);

	const htmlWithToggleAttributes = handleToggleAttribute(
		fragment.html,
		containers,
	);

	const htmlWithRegularAttributes = handleRegularAttributes(
		htmlWithToggleAttributes,
		containers,
	);

	return handleNode(htmlWithRegularAttributes, containers);
};

export const renderToString = (
	fragment: Template | Iterable<Template>,
): string =>
	isTemplate(fragment)
		? traverseFragment(fragment)
		: Array.from(fragment).map(renderToString).join('');
