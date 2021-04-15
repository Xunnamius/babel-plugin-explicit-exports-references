import { ApolloServer, gql } from 'apollo-server'
import { Button } from 'ui-library/es'
import { parse as parseUrl } from 'url'
import lib, * as libNamespace from 'cjs-component-library'
import lib2, { item1, item2 } from 'cjs2-component2-library2'
import lib3 from 'cjs3-component3-library3'
import * as lib4 from 'cjs4-component4-library4'
import { util } from '../lib/module-utils.mjs'
import { default as util2, util as smUtil, cliUtil } from 'some-package/dist/utils.js'

let result1 = lib.a(true);
result1 += 2;
const result2 = lib2.a(true);
const result3 = async () => lib3.a(true);

export { ApolloServer as A, gql as B };

export default Button.create(parseUrl(lib4.merge(util.lib, util2(smUtil, cliUtil))));

export {
    result1,
    result2,
    result3,
    libNamespace,
    item1,
    item2
};
