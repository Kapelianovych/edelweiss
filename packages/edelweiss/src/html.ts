import { createContent } from './core/content';
import { createTemplate, Template } from './core/template';

/** Creates processing of HTML components. */
export const html = (
	statics: TemplateStringsArray,
	...values: ReadonlyArray<unknown>
): Template => createTemplate(createContent(statics, values));
