import { name as pkgName } from '../package.json';
import { NodePath, PluginObj, PluginPass } from '@babel/core';
import debugFactory from 'debug';
import * as util from '@babel/types';
import template from '@babel/template';

const debug = debugFactory(`${pkgName}:index`);
let globalScope: NodePath['scope'];

function updateExportRefs(
  path: NodePath<util.Identifier>,
  mode: 'named' | 'default',
  transformAssignExpr: boolean
): void;
function updateExportRefs(
  path: { from: NodePath<util.Identifier>; to: string },
  mode: 'named' | 'default',
  transformAssignExpr: boolean
): void;
function updateExportRefs(
  path: NodePath<util.Identifier> | { from: NodePath<util.Identifier>; to: string },
  mode: 'named' | 'default',
  transformAssignExpr: boolean
): void {
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

  const numRefs = refPaths?.length || 0;
  const dbg = debug.extend(`mode-${mode}:updating`);

  if (numRefs) {
    dbg(
      `potentially updating ${numRefs} references to ${mode} export "${localName}"` +
        (exportedName != localName ? ` (exported as "${exportedName}")` : '')
    );
  } else dbg('no references to update');

  refPaths?.forEach((refPath, ndx) => {
    const prefix = `ref-${exportedName}-${(ndx + 1).toString()}`;

    if (
      !!refPath.find(
        (path) =>
          path.isExportSpecifier() ||
          path.isExportNamespaceSpecifier() ||
          path.isExportDefaultSpecifier()
      )
    ) {
      dbg(`[${prefix}] reference skipped: part of an export specifier`);
      return;
    }

    if (!!refPath.find((path) => path.isTSType())) {
      dbg(`[${prefix}] reference skipped: TypeScript type reference`);
      return;
    }

    if (refPath.isIdentifier()) {
      dbg(`[${prefix}] transforming type "identifier"`);
      refPath.replaceWith(
        template.expression.ast`module.exports.${mode == 'default' ? mode : exportedName}`
      );
    } else if (transformAssignExpr && refPath.isAssignmentExpression()) {
      dbg(`[${prefix}] transforming type "assignment expression"`);
      refPath
        .get('left')
        // TODO: needs to be more resilient, but we'll repeat this here for now
        .replaceWith(
          template.expression.ast`module.exports.${
            mode == 'default' ? mode : exportedName
          }`
        );
    } else dbg(`[${prefix}] reference skipped: unsupported type "${refPath.type}"`);
  });
}

export default function (): PluginObj<
  PluginPass & { opts: { transformAssignExpr: boolean } }
> {
  return {
    name: 'explicit-exports-references',
    visitor: {
      Program(programPath) {
        globalScope = programPath.scope;
      },
      ExportDefaultDeclaration(exportPath, state) {
        const declaration = exportPath.get('declaration');
        const transformAssignExpr = state.opts.transformAssignExpr;
        const dbg = debug.extend('mode-default');

        debug(`encountered default export declaration`);

        if (declaration.isFunctionDeclaration() || declaration.isClassDeclaration()) {
          const id = declaration.get('id') as NodePath<util.Identifier>;
          if (id?.node?.name) updateExportRefs(id, 'default', transformAssignExpr);
          else dbg('default declaration is anonymous, ignored');
        } else dbg('default declaration not function or class, ignored');
      },
      ExportNamedDeclaration(exportPath, state) {
        const declaration = exportPath.get('declaration');
        const specifiers = exportPath.get('specifiers');
        const transformAssignExpr = state.opts.transformAssignExpr;
        const dbg = debug.extend('mode-named');

        if (!declaration.node && !specifiers.length) {
          dbg('ignored empty named export declaration');
          return;
        }

        debug(`encountered named export node`);
        dbg(`processing declaration`);

        if (declaration.node) {
          if (declaration.isFunctionDeclaration() || declaration.isClassDeclaration()) {
            updateExportRefs(
              declaration.get('id') as NodePath<util.Identifier>,
              'named',
              transformAssignExpr
            );
          } else if (declaration.isVariableDeclaration()) {
            declaration.get('declarations').forEach((declarator) => {
              const id = declarator.get('id');
              if (id.isIdentifier()) updateExportRefs(id, 'named', transformAssignExpr);
              else if (id.isObjectPattern()) {
                id.get('properties').forEach((propPath) => {
                  if (propPath.isObjectProperty()) {
                    const propId = propPath.get('value');
                    if (propId.isIdentifier())
                      updateExportRefs(propId, 'named', transformAssignExpr);
                  } else if (propPath.isRestElement()) {
                    const arg = propPath.get('argument');
                    if (arg.isIdentifier())
                      updateExportRefs(arg, 'named', transformAssignExpr);
                  }
                });
              }
            });
          } else {
            dbg(
              'named declaration is not a function, class, or variable declaration; ignored'
            );
          }
        }

        specifiers.length && dbg(`processing ${specifiers.length} specifiers`);

        // ? Later exports take precedence over earlier ones
        specifiers.forEach((specifier) => {
          if (!specifier.isExportSpecifier()) {
            dbg(`ignored export specifier type "${specifier.type}"`);
          } else {
            const local = specifier.get('local');
            const exported = specifier.get('exported');

            dbg(`encountered specifier "${local} as ${exported}"`);

            if (exported.isIdentifier()) {
              const exportedName = exported.node.name;
              updateExportRefs(
                {
                  from: local,
                  to: exportedName
                },
                exportedName == 'default' ? 'default' : 'named',
                transformAssignExpr
              );
            } else {
              dbg(
                'ignored export specifier because module string names are not supported'
              );
            }
          }
        });
      }
    }
  };
}
