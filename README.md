[![Black Lives Matter!](https://api.ergodark.com/badges/blm 'Join the movement!')](https://secure.actblue.com/donate/ms_blm_homepage_2019)
[![Maintenance status](https://img.shields.io/maintenance/active/2021 'Is this package maintained?')](https://www.npmjs.com/package/babel-plugin-explicit-exports-references)
[![Last commit timestamp](https://img.shields.io/github/last-commit/xunnamius/babel-plugin-explicit-exports-references 'When was the last commit to the official repo?')](https://www.npmjs.com/package/babel-plugin-explicit-exports-references)
[![Open issues](https://img.shields.io/github/issues/xunnamius/babel-plugin-explicit-exports-references 'Number of known issues with this package')](https://www.npmjs.com/package/babel-plugin-explicit-exports-references)
[![Pull requests](https://img.shields.io/github/issues-pr/xunnamius/babel-plugin-explicit-exports-references 'Number of open pull requests')](https://www.npmjs.com/package/babel-plugin-explicit-exports-references)
[![Source license](https://img.shields.io/npm/l/babel-plugin-explicit-exports-references "This package's source license")](https://www.npmjs.com/package/babel-plugin-explicit-exports-references)
[![NPM version](https://api.ergodark.com/badges/npm-pkg-version/babel-plugin-explicit-exports-references 'Install this package using npm or yarn!')](https://www.npmjs.com/package/babel-plugin-explicit-exports-references)

# babel-plugin-explicit-exports-references

Patterns like the following are commonplace throughout the JavaScript ecosystem:

```typescript
// file: src/index.js
const { name: pkgName } = require('../package.json');
```

With TypeScript and more modern JavaScript, we'd achieve the same with the
following:

```typescript
// file: src/index.ts
import { name as pkgName } from '../package.json';
```

However, running this through Webpack 5 will trigger warnings like
`WARNING in ./src/index.ts 6:30-37 Should not import the named export 'name' (imported as 'pkgName') default-exporting module (only default export is available soon)`.
Worse, running this snippet through Webpack 4 can cause bundling errors.

This simple Babel plugin makes these warnings and errors go away by transforming
named import declarations of CJS and JSON modules into
[default import declarations with constant destructuring assignments](#motivation).
The goal is to make named import sugar _forward-compatible_ by allowing imports
of named CJS exports to remain consistent across CJS and ESM source, and to
prevent some versions of Webpack, Node, browsers, et cetera from
[choking](https://github.com/formatjs/formatjs/issues/1395) when encountering
it.

## Installation and Usage

```Bash
npm install --save-dev babel-plugin-explicit-exports-references
```

And in your `babel.config.js`:

```typescript
module.exports = {
  plugins: ['transform-default-named-imports']
};
```

And finally, run Babel through your toolchain (Webpack, Jest, etc) or manually.
For example:

```Bash
npx babel src --out-dir dist
```

By default, this plugin will transform named imports for Node's built-in
packages (e.g. `http`, `url`, `path`), for sources that end in `.json`, and for
any CJS package under `node_modules` (determined by
[`webpack-node-module-types`](https://www.npmjs.com/package/webpack-node-module-types)).
**All other imports, including local imports, are left untouched.**

### Importing JSON Modules

As of version 5.18, Webpack does not properly tree-shake constant destructuring
assignments of JSON imports without a little help. Until Webpack's handling of
JSON modules stabilizes,
[externalize all JSON imports as commonjs](https://webpack.js.org/configuration/externals):

```typescript
// file: webpack.config.js
module.exports = {
...
  externals: [
    ...
    ({ request }, cb) =>
      // ? Externalize all .json imports (required as commonjs modules)
      /\.json$/.test(request) ? cb(null, `commonjs ${request}`) : cb()
  ]
};
```

If you do not externalize your JSON imports, you risk bloating your bundle size!

### Custom Configuration

Out of the box with zero configuration, the default settings this plugin uses
look something like the following:

```typescript
const { determineModuleTypes } = require('webpack-node-module-types/sync');

module.exports = {
  plugins: [
    [
      'transform-default-named-imports',
      {
        test: [...determineModuleTypes().cjs], // ◄ match all CJS modules
        exclude: [], // ◄ never excludes modules by default
        transformBuiltins: true, // ◄ match all built-in modules
        silent: true, // ◄ output results to stdout if silent == false
        verbose: false // ◄ output detailed results if silent == false
      }
    ]
  ]
};
```

You can manually specify which import sources are CJS using the `test` and
`exclude` configuration options, which accept an array of strings/RegExp items
to match sources against. If a string begins and ends with a `/` (e.g.
`/^apollo/`), it will be evaluated as a case-insensitive RegExp item. Named
imports with sources that match any item in `test` _and fail to match all items
in `exclude`_ will be transformed. You can also skip transforming built-ins by
default (unless they match in `test`) using `transformBuiltins: false`.

For instance, to exclusively transform any imports (bare or deep) of
`apollo-server` and any built-ins like `url` from the above example,
`babel.config.js` would include:

```typescript
module.exports = {
  plugins: [
    [
      'transform-default-named-imports',
      {
        // ▼ regex matches any import that starts with 'apollo-server'
        test: [/^apollo-server/]
      }
    ]
  ]
};
```

Replacing the `test` array like this also replaces the default list of CJS
modules from `node_modules`. To append rather than replace, you can do something
like:

```Bash
npm install --save-dev webpack-node-module-types
```

```typescript
const { determineModuleTypes } = require('webpack-node-module-types/sync');

module.exports = {
  plugins: [
    [
      'transform-default-named-imports',
      {
        // ▼ extend, rather than override, the default settings
        test: [
          // ▼ prevent `next` and any deep import like `next/dist/next-server`
          // ▼ from being misclassified as CJS
          ...determineModuleTypes().cjs.filter(
            (p) => !/^next([/?#].+)?/.test(p)
          ),
          // ▼ add CJS package `something-special` misclassified as ESM
          'something-special'
        ]
      }
    ]
  ]
};
```

### Troubleshooting

If all you want to do is ignore a misclassified module like `next` in the
previous section, it's easier to just _exclude_ it:

```typescript
module.exports = {
  plugins: [
    [
      'transform-default-named-imports',
      {
        exclude: [/^next([/?#].+)?/]
      }
    ]
  ]
};
```

This is useful when
[`webpack-node-module-types`](https://www.npmjs.com/package/webpack-node-module-types)
misclassifies a package or you want to more easily override the defaults.

A clue that a package is being misclassified is when you encounter errors like
`TypeError: Cannot destructure property 'X' of '_X.default' as it is undefined.`
For example, in the case of the following deep `next` import:

```typescript
import { apiResolver } from 'next/dist/next-server/server/api-utils.js';
```

Without adding the `exclude` configuration key above, Webpack 5.20 reports the
following error:
`TypeError: Cannot destructure property 'apiResolver' of '_apiUtils.default' as it is undefined.`
After adding the `exclude` key, this error disappears.

## Motivation

As of Node 14, there are at least two "gotcha" rules when writing ESM modules
(files that end in `.mjs`):

1. All import sources that are
   [not bare](https://nodejs.org/api/esm.html#esm_import_specifiers) and not
   found in [the package's `imports`/`exports` key][exports-main-key] **must
   include a file extension**. This includes imports on directories e.g.
   `import { Button} from './component/button'`, which should appear in an
   `.mjs` file as `import { Button } from './component/button/index.mjs'`.

2. CJS modules can only be imported using **default import syntax**. As far as
   Webpack is concerned, this includes built-ins too. For example,
   `import { parse } from 'url'` is illegal because `url` is considered a CJS
   module.

Node 14 is lax with the second rule, going so far as to use
[static analysis](https://nodejs.org/api/esm.html#esm_import_statements) to
allow CJS modules to be imported using the "technically illegal" named import
syntax. However, Webpack and other bundlers are much stricter about this and
using named import syntax on a CJS module can cause bundling to fail outright.

For instance, suppose one uses Babel to transpile this TypeScript file into the
ESM entry point **`my-package.mjs`** for a
[dual CJS2/ESM](https://nodejs.org/api/packages.html#packages_dual_commonjs_es_module_packages)
package:

```TypeScript
/* my-package.ts */

// ▼ #1: an "illegal" named bare CJS import
import { ApolloServer, gql } from 'apollo-server'
// ▼ #2: a legal named deep ESM import
import { Button } from 'ui-library/es'
// ▼ #3: an "illegal" named built-in import
import { parse as parseUrl } from 'url'
// ▼ #4: a legal default bare CJS import and a legal namespace bare CJS import
import lib, * as libNamespace from 'cjs-component-library'
// ▼ #5: a legal default bare CJS import and an "illegal" named bare CJS import
import lib2, { item1, item2 } from 'cjs2-component2-library2'
// ▼ #6: a legal default bare CJS import
import lib3 from 'cjs3-component3-library3'
// ▼ #7: a legal namespace bare CJS import
import * as lib4 from 'cjs4-component4-library4'
// ▼ #8: a legal named relative ESM import using .mjs (.ts is not allowed here!)
import { util } from '../lib/module-utils.mjs'
// ▼ #9: an "illegal" named deep CJS import
import { default as util2, util as smUtil, cliUtil } from 'some-package/dist/utils.js'

// ...
```

The above syntax, which is all legal in Node 14 and TypeScript, will survive
transpilation when emitting `my-package.mjs`. Running this with
`node my-package.mjs` works. Further, after running this file as an entry point
through Webpack (with babel-loader) and emitting CJS bundle file
**`my-package.js`**, running `node my-package.js` also works. Everything works,
and `my-package.mjs` \+ `my-package.js` can be distributed as a dual CJS2/ESM
package!

Problem: when Webpack attempts to process this as a tree-shakable ESM package
(using our `.mjs` entry point), at worst it'll
[choke and die](https://github.com/formatjs/formatjs/issues/1395) encountering
the "illegal" CJS named imports. This manifests as strange errors like
`ERROR in ./my-package.mjs Can't import the named export 'ApolloServer' from non EcmaScript module (only default export is available)`
or
`ERROR in ./node_modules/my-package/dist/my-package.mjs Can't import the named export 'parse' from non EcmaScript module (only default export is available)`.
In more recent versions of Webpack, this can lead to similar warnings when
transpiling TypeScript source.

`babel-plugin-explicit-exports-references` remedies this and similar issues by
transforming each named import of a CJS module into a default CJS import with a
constant destructuring assignment of the named imports:

```typescript
/* my-package.mjs (using babel-plugin-explicit-exports-references) */

// ▼ #1: named CJS import (transformed)
import _$apollo_server from 'apollo-server'; // ◄ default import
const { ApolloServer, gql } = _$apollo_server; // ◄ destructuring assignment
// ▼ #2: named ESM import (preserved)
import { Button } from 'ui-library/es';
// ▼ #3: named built-in import (transformed)
import _$url from 'url'; // ◄ default import
const { parse: parseUrl } = _$url; // ◄ destructuring assignment
// ▼ #4: default and namespace CJS import (preserved)
import lib, * as libNamespace from 'cjs-component-library';
// ▼ #5: default CJS import (preserved); named CJS import (transformed)
import lib2 from 'cjs2-component2-library2'; // ◄ default import (preserved)
const { item1, item2 } = lib2; // ◄ destructuring assignment
// ▼ #6: default CJS import (preserved)
import lib3 from 'cjs3-component3-library3';
// ▼ #7: namespace CJS import (preserved)
import * as lib4 from 'cjs4-component4-library4';
// ▼ #8: named ESM import (preserved) (eliminated by Webpack through bundling)
import { util } from '../lib/module-utils.mjs';
// ▼ #9: named CJS import (default alias is preserved, rest is transformed)
import util2 from 'some-package/dist/utils.js'; // ◄ default import (preserved)
const { util: smUtil, cliUtil } = util2; // ◄ destructuring assignment
```

Now, having `my-package` import CJS modules as if they were ESM causes no
warnings or errors! 🎉

Hence, this transformation is mainly useful for library authors shipping
packages with ESM entry points as it prevents various bundlers from choking on
delicious sugar like named imports of CJS modules. It's a solution to a
different symptom of [this problem](https://github.com/babel/babel/issues/7294).

This plugin is somewhat similar to
[babel-plugin-transform-default-import](https://www.npmjs.com/package/babel-plugin-transform-default-import)
and
[babel-plugin-transform-named-imports](https://github.com/SectorLabs/babel-plugin-transform-named-imports).
You could say this plugin is the functional intersection of the aforementioned.

## Contributing

**New issues and pull requests are always welcome and greatly appreciated!** If
you submit a pull request, take care to maintain the existing coding style and
add unit tests for any new or changed functionality. Please lint and test your
code, of course!

### NPM Scripts

Run `npm run list-tasks` to see which of the following scripts are available for
this project.

> Using these scripts requires a linux-like development environment. None of the
> scripts are likely to work on non-POSIX environments. If you're on Windows,
> use [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

#### Development

- `npm run repl` to run a buffered TypeScript-Babel REPL
- `npm test` to run the unit tests and gather test coverage data
  - Look for HTML files under `coverage/`
- `npm run check-build` to run the integration tests
- `npm run check-types` to run a project-wide type check
- `npm run test-repeat` to run the entire test suite 100 times
  - Good for spotting bad async code and heisenbugs
  - Uses `__test-repeat` NPM script under the hood
- `npm run dev` to start a development server or instance
- `npm run generate` to transpile config files (under `config/`) from scratch
- `npm run regenerate` to quickly re-transpile config files (under `config/`)

#### Building

- `npm run clean` to delete all build process artifacts
- `npm run build` to compile `src/` into `dist/`, which is what makes it into
  the published package
- `npm run build-docs` to re-build the documentation
- `npm run build-externals` to compile `external-scripts/` into
  `external-scripts/bin/`
- `npm run build-stats` to gather statistics about Webpack (look for
  `bundle-stats.json`)

#### Publishing

- `npm run start` to start a production instance
- `npm run fixup` to run pre-publication tests, rebuilds (like documentation),
  and validations
  - Triggered automatically by
    [publish-please](https://www.npmjs.com/package/publish-please)

#### NPX

- `npx publish-please` to publish the package
- `npx sort-package-json` to consistently sort `package.json`
- `npx npm-force-resolutions` to forcefully patch security audit problems

## Package Details

> You don't need to read this section to use this package, everything should
> "just work"!

This is a simple [CJS2](https://github.com/webpack/webpack/issues/1114) package
with a default export.

[`package.json`](package.json) includes the [`exports` and
`main`][exports-main-key] keys, which point to the CJS2 entry point, the
[`type`][local-pkg] key, which is `commonjs`, and the
[`sideEffects`][side-effects-key] key, which is `false` for [optimal tree
shaking][tree-shaking], and the `types` key, which points to a TypeScript
declarations file.

## Release History

See [CHANGELOG.md](CHANGELOG.md).

[side-effects-key]:
  https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
[exports-main-key]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#package-entry-points
[tree-shaking]: https://webpack.js.org/guides/tree-shaking
[local-pkg]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#type
