import _$apollo_server from "apollo-server";
const { ApolloServer, gql } = _$apollo_server;
import { Button } from "ui-library/es";
import _$url from "url";
const { parse: parseUrl } = _$url;
import lib, * as libNamespace from "cjs-component-library";
import lib2 from "cjs2-component2-library2";
const { item1, item2 } = lib2;
import lib3 from "cjs3-component3-library3";
import * as lib4 from "cjs4-component4-library4";
import { util } from "../lib/module-utils.mjs";
import util2 from "some-package/dist/utils.js";
const { util: smUtil, cliUtil } = util2;
let result1 = lib.a(true);
result1 += 2;
const result2 = lib2.a(true);

const result3 = async () => lib3.a(true);

export { ApolloServer as A, gql as B };
export default Button.create(
  parseUrl(lib4.merge(util.lib, util2(smUtil, cliUtil)))
);
export { result1, result2, result3, libNamespace, item1, item2 };
