import { main1 } from '../../package.json'
import { main2 } from './package.json'
import { main3 } from '../pacakge.json'
import { main4 } from '.././package.json'
import { main5 } from 'package.json'
import { main6 } from '.package.json'
import { main7 } from './package.json'

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
