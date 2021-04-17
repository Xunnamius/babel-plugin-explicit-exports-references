import { name as pkgName } from '../package.json';
import { NodePath, PluginObj, PluginPass } from '@babel/core';
import debugFactory from 'debug';

import * as util from '@babel/types';

const debug = debugFactory(`${pkgName}:index`);
let globalScope: NodePath['scope'];

const updateExportRefs = (
  idPath: NodePath<util.Identifier>,
  mode: 'named' | 'default'
) => {
  const exportedName = idPath?.node?.name;
  if (!exportedName)
    throw new Error(`could not retrieve ${mode} export's name from identifier`);

  globalScope = globalScope || idPath.findParent((node) => node.isProgram())?.scope;
  if (!globalScope) throw new Error('could not find program global scope');

  const refPaths = globalScope.getBinding(exportedName)?.referencePaths;
  debug(
    `updating ${refPaths?.length || 0} references to ${mode} export "${exportedName}"`
  );

  refPaths?.forEach((refPath) => {
    if (refPath.isIdentifier()) {
      // TODO:
      refPath.node.name = `CHANGED_${
        mode == 'default' ? 'TO_DEFAULT' : refPath.node.name
      }`;
    } else debug('(non-identifier reference path skipped)');
  });
};

/**
 * 1. Get the name from the identifier of the default export if it is a function
 *    or class declaration
 * 2. Gather names from the identifiers of non-default exports:
 *      - If there is a non-variable declaration, get the name from the function
 *        or class
 *      - If there is a variable declaration, gather n
 */
export default function (): PluginObj<PluginPass> {
  return {
    name: 'explicit-exports-references',
    visitor: {
      ExportDefaultDeclaration(exportPath) {
        const declaration = exportPath.get('declaration');
        const typeStr = `declaration type "${declaration.type}"`;
        debug(`saw ${typeStr}`);

        if (declaration.isFunctionDeclaration() || declaration.isClassDeclaration()) {
          const id = declaration.get('id') as NodePath<util.Identifier>;
          if (id?.node?.name) updateExportRefs(id, 'default');
          else debug('default declaration is anonymous, ignoring');
        }
      },
      ExportNamedDeclaration(exportPath) {
        const declaration = exportPath.get('declaration');
        const specifiers = exportPath.get('specifiers');

        if (!declaration.node && !specifiers.length) {
          debug('ignored empty named export declaration');
          return;
        } else if (declaration.node && specifiers.length) {
          throw new Error(
            'named exports cannot have both a) a declaration and b) specifiers'
          );
        } else debug('(ignored)');

        const typeStr = `declaration type "${declaration.type}"`;
        debug(`saw ${typeStr}`);

        if (declaration.node) {
          if (declaration.isFunctionDeclaration() || declaration.isClassDeclaration()) {
            updateExportRefs(declaration.get('id') as NodePath<util.Identifier>, 'named');
          } else if (declaration.isVariableDeclaration()) {
            declaration.get('declarations').forEach((declarator) => {
              const id = declarator.get('id');
              if (id.isIdentifier()) updateExportRefs(id, 'named');
              else debug('(non-identifier id skipped)');
            });
          } else debug('(ignored)');
        }

        if (specifiers.length) {
        }
      }
}
