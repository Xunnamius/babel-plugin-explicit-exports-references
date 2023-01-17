/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
// @ts-expect-error non-existent package
export * from 'pkg1';
// @ts-expect-error non-existent package
export * as name1 from 'pkg2';
// @ts-expect-error non-existent package
export { name2, name3 } from 'pkg3';
// @ts-expect-error non-existent package
export { import1 as name4, import2 as name5 } from 'pkg4';
// @ts-expect-error non-existent package
export { default, name6 } from 'pkg5';
//export { name7 as 'name7' } from 'pkg5';
export {} from 'pkg6';
