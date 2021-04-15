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

(description incoming)

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

And finally, run Babel through your toolchain (Webpack, Jest, etc) or manually.
For example:

```Bash
npx babel src --out-dir dist
```

## Motivation

(motivation incoming)

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
  https://img.shields.io/maintenance/active/2021
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
[tree-shaking]: https://webpack.js.org/guides/tree-shaking
[local-pkg]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#type
[choose-new-issue]:
  https://github.com/Xunnamius/babel-plugin-explicit-exports-references/issues/new/choose
[pr-compare]:
  https://github.com/Xunnamius/babel-plugin-explicit-exports-references/compare
[contributing]: CONTRIBUTING.md
[support]: .github/SUPPORT.md
[docs]: docs
