<!-- prettier-ignore-start -->

<!-- badges-start -->

[![Black Lives Matter!][badge-blm]][link-blm]
[![Maintenance status][badge-maintenance]][link-repo]
[![Last commit timestamp][badge-last-commit]][link-repo]
[![Open issues][badge-issues]][link-issues]
[![Pull requests][badge-pulls]][link-pulls]
[![codecov][badge-codecov]][link-codecov]
[![Source license][badge-license]][link-license]
[![NPM version][badge-npm]][link-npm]
[![semantic-release][badge-semantic-release]][link-semantic-release]

<!-- badges-end -->

<!-- prettier-ignore-end -->

# babel-plugin-explicit-exports-references

Transforms all internal references to a module's exports such that each
reference starts with `module.exports` instead of directly referencing an
internal name. This enables easy mocking of specific (exported) functions in
Jest with Babel/TypeScript, even when the mocked functions call each other in
the same module.

## Installation and Usage

```Bash
npm install --save-dev babel-plugin-explicit-exports-references
```

And in your `babel.config.js`:

```typescript
module.exports = {
  plugins: ['explicit-exports-references']
};
```

**Note**: it is recommended that this plugin only be enabled when `NODE_ENV` is
`test`. Using this plugin elsewhere, such as in production, can lead to
increased build size. For example:

```javascript
module.exports = {
  parserOpts: { ... },
  plugins: [ ... ],
  env: {
      test: {
        plugins: ['explicit-exports-references']
      }
  }
};
```

Finally, run Babel through your toolchain (Webpack, Jest, etc) or manually:

```bash
npx babel src --out-dir dist
```

## AST Algorithm

> To see detailed output on how this plugin transforms your code, enable [debug
> mode][2]:
> `DEBUG='babel-plugin-explicit-exports-references:*' npx jest your-test-file`

The plugin begins by looking for default and named export declarations in a
program.

For default exports, it looks for function declarations and class declarations
that have ids (i.e. variable names), like `export default function main() {}`,
and updates any Identifiers referencing that id.

For named exports, it looks for function and class declarations too, but also
variable declarations like `export const foo = 5;` and
`export { x as default, y, x as z };`. **Enums are explicitly ignored.** Any
Identifiers that reference the declaration's id or specifier are updated.

When updating references, by default only Identifiers are transformed.
Assignment Expressions can also be transformed, but doing so is [currently
unstable][1]. All other reference types are ignored, including TypeScript types
and Identifiers within their own declarations.

The following enables transforming Assignment Expressions along with
Identifiers:

<!-- prettier-ignore-start -->
```javascript
module.exports = {
  plugins: [
    ['explicit-exports-references', { transformAssignExpr: true }]
  ]
};
```
<!-- prettier-ignore-end -->

## Motivation

Suppose we have the following `myModule.ts` TypeScript file:

```typescript
// file: myModule.ts

export function foo() {
  // This function works fine in production but throws on our local test machine
  throw new Error('failed to do expensive network stuff');
  return;
}

export function bar() {
  // ...
  foo();
  return 5;
}

export function baz() {
  // ...
  foo();
  return 50;
}
```

Lets say we want to unit test `myModule.ts`. Specifically, we want to test `bar`
and `baz`. We don't want to unit test `foo` because a) attempting to run it on
our local machine will always fail, which is why b) it is covered by our
integration tests instead. We simply want to ensure `bar` and `baz` work, and
that they both _call_ `foo` without _running_ `foo`.

If we expect a function to be called, and we want an alternative implementation
run when it is called, the easy and obvious solution is to [mock it][3].

So suppose we create the following `myModule.test.ts` Jest test file, mocking
`foo` with a [noop](<https://en.wikipedia.org/wiki/NOP_(code)>):

```typescript
// file: myModule.test.ts

import * as myModule from './myModule';

it('bar does what I want', () => {
  const spy = jest.spyOn(myModule, 'foo').mockImplementation(() => undefined);

  expect(myModule.bar()).toBe(5);
  expect(spy).toBeCalled();

  spy.mockRestore();
});

it('baz does what I want', () => {
  const spy = jest.spyOn(myModule, 'foo').mockImplementation(() => undefined);

  expect(myModule.baz()).toBe(50);
  expect(spy).toBeCalled();

  spy.mockRestore();
});
```

This file tests that `bar` and `baz` do what we want, and whenever they call
`foo` the dummy version is called instead and no error is thrown. Or rather,
that seems like it should be the thing that happens. Unfortunately, if we run
this code, the above tests will fail because `foo` throws
_`failed to do expensive network stuff`_.

Is this a bug?

After encountering this problem over five years ago, someone posed the question
to the Jest project:
[how do you mock a specific function in a module?](https://github.com/facebook/jest/issues/936),
to which a contributor
[responded](https://github.com/facebook/jest/issues/936#issuecomment-214939935):

> Supporting the above by mocking a function after requiring a module is
> impossible in JavaScript – there is (almost) no way to retrieve the binding
> that foo refers to and modify it.
>
> However, if you change your code to this:
>
> ```typescript
> var foo = function foo() {};
> var bar = function bar() {
>   exports.foo();
> };
>
> exports.foo = foo;
> exports.bar = bar;
> ```
>
> and then in your test file you do:
>
> ```typescript
> var module = require('../module');
> module.foo = jest.fn();
> module.bar();
> ```
>
> it will work just as expected. This is what we do at Facebook where we don't
> use ES2015.
>
> While ES2015 modules may have immutable bindings for what they export, the
> underlying compiled code that babel compiles to right now doesn't enforce any
> such constraints. I see no way currently to support exactly what you are
> asking...

Essentially, this plugin aims to automate the suggestion above, allowing you to
mock a specific module function using standard Jest spies by automatically
replacing references to exported identifiers with an explicit reference of the
form `module.exports.${identifier}`. No assembly required.

With this plugin loaded into Babel, the tests in the motivating example above
pass! 🎉

### Prior Art

Prior solutions include:

- [Manually rewrite all refs to exported identifiers as `exports.${identifier}`](https://github.com/facebook/jest/issues/936#issuecomment-611860173)
- [Manually rewrite all function and class declarations as expressions](https://github.com/facebook/jest/issues/936#issuecomment-545080082)
- [Manually place every function and class declaration in a separate file](https://github.com/facebook/jest/issues/936#issuecomment-687632079)
  (yikes)
- [Rewrite your tests to use `rewire` dark magic](https://github.com/facebook/jest/issues/936#issuecomment-611860173)
- [Spend an hour hand-crafting a bespoke nth-level module mock](https://github.com/facebook/jest/issues/936#issuecomment-743688960)

Further reading and additional solutions:

- https://medium.com/@DavideRama/mock-spy-exported-functions-within-a-single-module-in-jest-cdf2b61af642
- https://medium.com/@qjli/how-to-mock-specific-module-function-in-jest-715e39a391f4
- https://kennethteh90.medium.com/jest-how-to-mock-functions-that-reference-each-other-from-the-same-module-9f1d3293ec81
- https://github.com/facebook/jest/issues/936

## Documentation

Further documentation can be found under [`docs/`][docs].

## Contributing and Support

**[New issues][choose-new-issue] and [pull requests][pr-compare] are always
welcome and greatly appreciated! 🤩** Just as well, you can [star 🌟 this
project][link-repo] to let me know you found it useful! ✊🏿 Thank you!

See [CONTRIBUTING.md][contributing] and [SUPPORT.md][support] for more
information.

[badge-blm]: https://api.ergodark.com/badges/blm 'Join the movement!'
[link-blm]: https://secure.actblue.com/donate/ms_blm_homepage_2019
[badge-maintenance]:
  https://img.shields.io/maintenance/active/2022
  'Is this package maintained?'
[link-repo]:
  https://github.com/xunnamius/babel-plugin-explicit-exports-references
[badge-last-commit]:
  https://img.shields.io/github/last-commit/xunnamius/babel-plugin-explicit-exports-references
  'When was the last commit to the official repo?'
[badge-issues]:
  https://isitmaintained.com/badge/open/Xunnamius/babel-plugin-explicit-exports-references.svg
  'Number of known issues with this package'
[link-issues]:
  https://github.com/Xunnamius/babel-plugin-explicit-exports-references/issues?q=
[badge-pulls]:
  https://img.shields.io/github/issues-pr/xunnamius/babel-plugin-explicit-exports-references
  'Number of open pull requests'
[link-pulls]:
  https://github.com/xunnamius/babel-plugin-explicit-exports-references/pulls
[badge-codecov]:
  https://codecov.io/gh/Xunnamius/babel-plugin-explicit-exports-references/branch/main/graph/badge.svg?token=HWRIOBAAPW
  'Is this package well-tested?'
[link-codecov]:
  https://codecov.io/gh/Xunnamius/babel-plugin-explicit-exports-references
[package-json]: package.json
[badge-license]:
  https://img.shields.io/npm/l/babel-plugin-explicit-exports-references
  "This package's source license"
[link-license]:
  https://github.com/Xunnamius/babel-plugin-explicit-exports-references/blob/main/LICENSE
[badge-npm]:
  https://api.ergodark.com/badges/npm-pkg-version/babel-plugin-explicit-exports-references
  'Install this package using npm or yarn!'
[link-npm]:
  https://www.npmjs.com/package/babel-plugin-explicit-exports-references
[badge-semantic-release]:
  https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
  'This repo practices continuous integration and deployment!'
[link-semantic-release]: https://github.com/semantic-release/semantic-release
[side-effects-key]:
  https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
[exports-main-key]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#package-entry-points
[choose-new-issue]:
  https://github.com/Xunnamius/babel-plugin-explicit-exports-references/issues/new/choose
[pr-compare]:
  https://github.com/Xunnamius/babel-plugin-explicit-exports-references/compare
[contributing]: CONTRIBUTING.md
[support]: .github/SUPPORT.md
[docs]: docs
[1]:
  https://github.com/Xunnamius/babel-plugin-explicit-exports-references/issues/2
[2]: https://www.npmjs.com/package/debug
[3]: https://jestjs.io/docs/jest-object#jestspyonobject-methodname
