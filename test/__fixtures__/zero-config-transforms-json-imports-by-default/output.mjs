import _$______package_json from "../../package.json";
const { main1 } = _$______package_json;
import _$__package_json from "./package.json";
const { main2 } = _$__package_json;
import _$___pacakge_json from "../pacakge.json";
const { main3 } = _$___pacakge_json;
import _$_____package_json from ".././package.json";
const { main4 } = _$_____package_json;
import { main5 } from "package.json";
import { main6 } from ".package.json";
import _$__package_json from "./package.json";
const { main7 } = _$__package_json;
const result = `
${main1}
${main2}
${main3}
${main4}
${main5}
${main6}
${main7}
`;
export default result;
