# Edelweiss CLI - for creating [edelweiss](https://github.com/YevhenKap/edelweiss) powered apps

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Quickly bootstraps a simple environment for creating SPAs with Edelweiss.

> Documentation for old version of CLI is [here](https://yevhenkap.github.io/docs-cli).

## Intention

It is boring to start new project. You need to initialize it, add basic dependencies, create directory structures. This CLI helps to create simple environment for developing apps with Edelweiss. So you don't need to do basic stuff by yourself 🕺 .

## Get started

I do not recommend to install CLI globally. Instead use [npx](https://docs.npmjs.com/cli/v7/commands/npx) to initialize project.

### Using

`@prostory/edelweiss` is a simple command that can accept name of the project and it will be place, where your code will live. If you already have one, then you can invoke command from inside and get your environment.

```sh
npx @prostory/edelweiss-cli my-project
```

or

```sh
mkdir my-project
cd my-project
npx @prostory/edelweiss-cli
```

### After

There are two commands available:

- `npm start` - starts development server on `http://localhost:1234`
- `npm build` - builds project.

## About

It is recommended to read about [parcel](https://v2.parceljs.org) first, as this package use it. In short it can process [TypeScript](https://typescriptlang.org), [Sass](https://sass-lang.com) files and much more without necessity to install plugins manually.

Entry point to an app is a `src/index.html` file.

## Word from author

Have fun ✌️
