/* eslint-disable */
// @ts-expect-error non-existent package
export * from 'pkg1'; // @ts-expect-error non-existent package

import * as _name from 'pkg2';
export { _name as name1 }; // @ts-expect-error non-existent package

export { name2, name3 } from 'pkg3'; // @ts-expect-error non-existent package

export { import1 as name4, import2 as name5 } from 'pkg4'; // @ts-expect-error non-existent package

export { default, name6 } from 'pkg5';
