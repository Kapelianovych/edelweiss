# Edelweiss SSR

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Builds Edelweiss templates on a server.

## Intention

There is still a need to create web pages as in "good old days" 🙂.

### Get started

This package is bundled as ES modules, so it can not be `require`d. If you organize your code as [`CommonJS`](https://en.wikipedia.org/wiki/CommonJS) modules, then you should transpile this package as well.

#### Installation

```sh
npm i @prostory/edelweiss-ssr
```

And then import it to your server's entry point.

```js
import '@prostory/edelweiss-ssr';

// Useful code.
```

> You should import SSR package before main `@prostory/edelweiss`.

#### Usage

The main goal of this package is to setup DOM environment on server. So, mostly you will just need to import package.

```js
// Now DOM context for server is created.
import '@prostory/edelweiss-ssr';
```

Along with `renderToString` function from `@prostory/edelweiss`, you can create static HTML.

```ts
import '@prostory/edelweiss-ssr';
import { html, renderToString } from '@prostory/edelweiss';

// Unfortunately, html function cannot create <html> element, so
// top-level layout should be organized as raw string;
const htmlLayout = (content: string): string => `
  <html>
    <head>
      <title>Title</title>
    </head>
    <body>
      ${content}
    </body>
  </html>
`;

const template = html`<p>Hello world!</p>`;

const page = htmlLayout(renderToString(template));
// And you can send page to client or write to disk, or do with this variable what you want.
```

Also if you want to mimic browser's behavior, package exports two functions:

- `layout` - used to create basic DOM structure in global `document` object.

  ```ts
  interface LayoutOptions {
  	isPath?: boolean;
  	sanitize?: (html: string) => string;
  }

  function layout(value: string, options?: LayoutOptions): void;
  ```

  This function can accept HTML layout as `string`(like _htmlLayout_ function defined above) or path to `.html` file, that contains basic page structure.

  By default, _value_ means to be HTML string. If you want pass a path to the file, then you should provide a second parameter with _isPath_ property to be `true`.

  > Node, that HTML passed to `layout` are not sanitized by default. If you do not trust source of _value_, then you can sanitize it by providing _sanitize_ property function in second parameter.

  ```ts
  import { layout } from '@prostory/edelweiss-ssr';
  import { html, render } from '@prostory/edelweiss';

  const basicLayout = `
    <html>
      <head>
        <title>Title</title>
      </head>
      <body></body>
    </html>
  `;

  // layout function need to be called only once.
  layout(basicLayout);

  const template = html`<p>Hello world!</p>`;

  // Render paragraph with Hello world to server's DOM.
  render(document.body, template);
  ```

- `page` - returns the whole current DOM as string. So given above example, we can get stringified page's HTML as:

  ```ts
  import { page, layout } from '@prostory/edelweiss-ssr';

  // ...

  const stringifiedPage = page();
  // This variable will hold:
  // `<html>
  //   <head>
  //     <title>Title</title>
  //   </head>
  //   <body><p>Hello world!</p></body>
  // </html>`
  ```

## Word from author

Have fun ✌️
