import { Marker } from '../marker';
import { EVENT_ATTRIBUTE_PREFIX } from '../constants';

export const processEventListener = (
	currentNode: Element,
	name: string,
	value: string,
	markers: Map<string, Marker>,
): void => {
	const eventMarker = markers.get(value);

	if (eventMarker !== undefined) {
		// Events are not allowed to be attached/detached
		// on state changes, so bridge is not need to be
		// created.
		currentNode.addEventListener(
			name.replace(EVENT_ATTRIBUTE_PREFIX, ''),
			eventMarker.value as EventListenerOrEventListenerObject,
		);

		currentNode.removeAttribute(name);
	}
};
