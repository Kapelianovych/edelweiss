import { Template } from './core/template/entity';
import { createContent } from './core/content';
import { createFragment } from './core/fragment';
import { createTemplate } from './core/template';

/**
 * Creates isolated HTML template.
 *
 * Though it is allowed to define `<style>` element
 * inside template, after adopting it to main `document`
 * these styles will not be scoped by default.
 */
export const html = (
	statics: TemplateStringsArray,
	...values: ReadonlyArray<unknown>
): Template =>
	createTemplate(createFragment(createContent(statics, ...values)));
