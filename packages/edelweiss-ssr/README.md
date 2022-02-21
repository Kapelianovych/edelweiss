# Edelweiss SSR

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A set of utilities for Edelweiss SSR.

## Intention

It is a place where useful helpers will live.

### Get started

This package is bundled as ES modules, so it can not be `require`d. If you organize your code as [`CommonJS`](https://en.wikipedia.org/wiki/CommonJS) modules, then you should transpile this package as well.

#### Installation

```sh
npm i @prostory/edelweiss-ssr
```

#### Usage

There is only one function `layout`, for now. It creates an HTML page.

```ts
interface LayoutOptions {
	readonly head?: string;
	readonly body?: string;
	readonly language?: string;
}

function layout(options: LayoutOptions): string;
```

1. The `head` property should contain an HTML that will be inserted between `head` element.
2. The `body` property should contain an HTML that will be inserted between `body` element.
3. The `language` property should contain a language tag that will be set as a value to `lang` attribute of the `html` tag. By default, it has `en` value.

```ts
const page = layout({
	head: '<title>A page title</title>',
	body: '<div>Hello world.</div>',
	language: 'en',
});
```

or you can use `html` function of `@prostory/edelweiss` package:

```ts
import { layout } from '@prostory/edelweiss-ssr';
import { html, language } from '@prostory/edelweiss';

const page = layout({
	head: render(html`<title>A page title</title>`),
	body: render(html`<div>Hello world.</div>`),
	language: language(),
});
```

## Word from author

Have fun ✌️
