import { RawDOMFragment } from '../fragment';
import { HOOK_ATTRIBUTE_PREFIX } from '../constants';
import { Hooks, registerHook, Hook } from '../hooks';

export const processHook = (
	node: Element,
	attributeName: string,
	attributeValue: string,
	markers: RawDOMFragment['markers']
): void => {
	const hookMarker = markers.get(attributeValue);

	if (hookMarker !== undefined) {
		const hookName = attributeName.replace(HOOK_ATTRIBUTE_PREFIX, '');

		switch (hookName) {
			case Hooks.MOUNTED:
			case Hooks.UPDATED:
			case Hooks['WILL_UNMOUNT']:
				registerHook(hookName, node, hookMarker.value as Hook);
				break;
			default:
				console.warn(`Unknown hook name: ${hookName}.`);
		}

		node.removeAttribute(attributeName);
	}
};
