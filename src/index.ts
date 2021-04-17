import { name as pkgName } from '../package.json';
import { NodePath, PluginObj, PluginPass } from '@babel/core';
import debugFactory from 'debug';
import * as util from '@babel/types';
import template from '@babel/template';

const debug = debugFactory(`${pkgName}:index`);
let globalScope: NodePath['scope'];

function updateExportRefs(
  path: NodePath<util.Identifier>,
  mode: 'named' | 'default'
): void;
function updateExportRefs(
  path: { from: NodePath<util.Identifier>; to: string },
  mode: 'named' | 'default'
): void;
function updateExportRefs(
  path: NodePath<util.Identifier> | { from: NodePath<util.Identifier>; to: string },
  mode: 'named' | 'default'
): void {
  debug(`mode: ${mode}`);

  // @ts-expect-error: need to discriminate between input types
  const idPath = (path.isIdentifier?.() ? path : path.from) as NodePath<util.Identifier>;
  const localName = idPath.node.name;
  // @ts-expect-error: need to discriminate between input types
  const exportedName = (path.to as string) || localName;
  const globalBinding = globalScope.getBinding(localName);
  const refPaths = [
    ...(globalBinding?.referencePaths || []),
    ...(globalBinding?.constantViolations || [])
  ];

  debug(
    `updating ${refPaths?.length || 0} references to ${mode} export "${localName}"` +
      (exportedName != localName ? ` (exported as "${exportedName}")` : '')
  );

  refPaths?.forEach((refPath) => {
    if (
      !!refPath.find(
        (path) =>
          path.isExportSpecifier() ||
          path.isExportNamespaceSpecifier() ||
          path.isExportDefaultSpecifier()
      )
    ) {
      debug('(an export specifier reference was skipped)');
      return;
    }

    if (!!refPath.find((path) => path.isTSType())) {
      debug('(an TypeScript type reference was skipped)');
      return;
    }

    const wasReplaced = !!(refPath.isIdentifier()
      ? refPath
      : refPath.isAssignmentExpression()
      ? refPath.get('left')
      : undefined
    )?.replaceWith(
      template.expression.ast`module.exports.${mode == 'default' ? mode : exportedName}`
    );

    if (!wasReplaced) debug(`(unsupported reference type "${refPath.type}" was skipped)`);
  });
}

export default function (): PluginObj<PluginPass> {
  return {
    name: 'explicit-exports-references',
    visitor: {
      Program(programPath) {
        globalScope = programPath.scope;
      },
      ExportDefaultDeclaration(exportPath) {
        const declaration = exportPath.get('declaration');
        debug(`encountered default export`);

        if (declaration.isFunctionDeclaration() || declaration.isClassDeclaration()) {
          const id = declaration.get('id') as NodePath<util.Identifier>;
          if (id?.node?.name) updateExportRefs(id, 'default');
          else debug('default declaration is anonymous, ignoring');
        } else debug('(ignored)');
      },
      ExportNamedDeclaration(exportPath) {
        const declaration = exportPath.get('declaration');
        const specifiers = exportPath.get('specifiers');

        if (!declaration.node && !specifiers.length) {
          debug('ignored empty named export declaration');
          return;
        }

        debug(`encountered named export`);

        if (declaration.node) {
          if (declaration.isFunctionDeclaration() || declaration.isClassDeclaration()) {
            updateExportRefs(declaration.get('id') as NodePath<util.Identifier>, 'named');
          } else if (declaration.isVariableDeclaration()) {
            declaration.get('declarations').forEach((declarator) => {
              const id = declarator.get('id');
              if (id.isIdentifier()) updateExportRefs(id, 'named');
              else if (id.isObjectPattern()) {
                id.get('properties').forEach((propPath) => {
                  if (propPath.isObjectProperty()) {
                    const propId = propPath.get('value');
                    if (propId.isIdentifier()) updateExportRefs(propId, 'named');
                  } else if (propPath.isRestElement()) {
                    const arg = propPath.get('argument');
                    if (arg.isIdentifier()) updateExportRefs(arg, 'named');
                  }
                });
              }
            });
          } else debug('(ignored)');
        }

        // ? Later exports take precedence over earlier ones
        specifiers.forEach((specifier) => {
          if (!specifier.isExportSpecifier()) {
            debug(`(ignored export specifier type "${specifier.type}")`);
          } else {
            const local = specifier.get('local');
            const exported = specifier.get('exported');

            debug(`encountered specifier "${local} as ${exported}"`);

            if (exported.isIdentifier()) {
              const exportedName = exported.node.name;
              updateExportRefs(
                {
                  from: local,
                  to: exportedName
                },
                exportedName == 'default' ? 'default' : 'named'
              );
            } else {
              debug(
                '(ignored export specifier because module string names are not supported)'
              );
            }
          }
        });
      }
    }
  };
}
