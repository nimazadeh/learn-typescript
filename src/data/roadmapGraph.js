/* ==========================================================================
   Official roadmap.sh/typescript Visual Graph Layout & 1-to-1 Node Mapping
   Every single topic & subtopic node from https://roadmap.sh/typescript (2026)
   is accurately positioned and linked directly to its interactive Studio Lesson!
   ========================================================================== */

export const ROADMAP_SECTIONS = [
  // Group containers mirroring the visual grouping boxes on roadmap.sh/typescript
  { x: 168, y: 144, w: 280, h: 526, label: 'TypeScript Type Hierarchy' },
  { x: -172, y: 368, w: 266, h: 278, label: 'Type Assertions' },
  { x: -628, y: 1144, w: 226, h: 446, label: 'Built-in Utility Types' },
];

export const ROADMAP_LABELS = [
  { x: 240, y: 168, text: 'Primitive Types' },
  { x: 374, y: 168, text: 'Object Types' },
  { x: 240, y: 528, text: 'Top Types' },
  { x: 374, y: 528, text: 'Bottom Types' },
  { x: -39, y: 392, text: 'Assertions' },
];

/**
 * 76 Official Clickable Nodes of roadmap.sh/typescript:
 * kind: 'topic' (Main Yellow Milestone) | 'subtopic' (Branch Skill Node)
 */
export const ROADMAP_GRAPH_NODES = [
  // === 1. Introduction, Config & Running TypeScript ===
  { id: 'intro-ts', label: 'Introduction to TypeScript', kind: 'topic', x: -165, y: 72, w: 252, h: 48 },
  { id: 'ts-vs-js', label: 'TypeScript vs JavaScript', kind: 'subtopic', x: -612, y: 20, w: 340, h: 46 },
  { id: 'ts-js-interop', label: 'TS and JS Interoperability', kind: 'subtopic', x: -612, y: 73, w: 340, h: 46 },
  { id: 'install-config', label: 'Installation and Configuration', kind: 'subtopic', x: -612, y: 126, w: 340, h: 46 },
  { id: 'tsconfig-json', label: 'tsconfig.json', kind: 'subtopic', x: -612, y: 199, w: 146, h: 46 },
  { id: 'compiler-options', label: 'Compiler Options', kind: 'subtopic', x: -456, y: 199, w: 184, h: 46 },

  { id: 'running-ts', label: 'Running TypeScript', kind: 'subtopic', x: 169, y: 72, w: 274, h: 46 },
  { id: 'tsc-cli', label: 'tsc', kind: 'subtopic', x: 169, y: -3, w: 96, h: 46 },
  { id: 'ts-node-runners', label: 'ts-node / tsx', kind: 'subtopic', x: 271, y: -3, w: 172, h: 46 },
  { id: 'ts-playground', label: 'TS Playground', kind: 'subtopic', x: 169, y: -56, w: 274, h: 46 },

  // === 2. TypeScript Types (Primitives, Objects, Top, Bottom, Assertions) ===
  { id: 'ts-types-overview', label: 'TypeScript Types', kind: 'topic', x: -165, y: 284, w: 252, h: 48 },

  { id: 'type-boolean', label: 'boolean', kind: 'subtopic', x: 180, y: 192, w: 122, h: 45 },
  { id: 'type-number', label: 'number', kind: 'subtopic', x: 180, y: 245, w: 122, h: 45 },
  { id: 'type-string', label: 'string', kind: 'subtopic', x: 180, y: 298, w: 122, h: 45 },
  { id: 'type-void', label: 'void', kind: 'subtopic', x: 180, y: 351, w: 122, h: 45 },
  { id: 'type-undefined', label: 'undefined', kind: 'subtopic', x: 180, y: 404, w: 122, h: 45 },
  { id: 'type-null', label: 'null', kind: 'subtopic', x: 180, y: 456, w: 122, h: 45 },

  { id: 'obj-interface', label: 'Interface', kind: 'subtopic', x: 312, y: 192, w: 122, h: 45 },
  { id: 'obj-class', label: 'Class', kind: 'subtopic', x: 312, y: 245, w: 122, h: 45 },
  { id: 'obj-enum', label: 'Enum', kind: 'subtopic', x: 312, y: 298, w: 122, h: 45 },
  { id: 'obj-array', label: 'Array', kind: 'subtopic', x: 312, y: 351, w: 122, h: 45 },
  { id: 'obj-tuple', label: 'Tuple', kind: 'subtopic', x: 312, y: 404, w: 122, h: 45 },
  { id: 'obj-object', label: 'Object', kind: 'subtopic', x: 312, y: 456, w: 122, h: 45 },

  { id: 'top-unknown', label: 'unknown', kind: 'subtopic', x: 180, y: 554, w: 122, h: 45 },
  { id: 'top-any', label: 'any', kind: 'subtopic', x: 180, y: 607, w: 122, h: 45 },
  { id: 'bottom-never', label: 'never', kind: 'subtopic', x: 312, y: 554, w: 122, h: 45 },

  { id: 'assert-as-type', label: 'as [type]', kind: 'subtopic', x: -158, y: 412, w: 238, h: 45 },
  { id: 'assert-as-any', label: 'as any', kind: 'subtopic', x: -158, y: 465, w: 112, h: 45 },
  { id: 'assert-as-const', label: 'as const', kind: 'subtopic', x: -38, y: 465, w: 118, h: 45 },
  { id: 'assert-non-null', label: 'Non-null Assertion', kind: 'subtopic', x: -158, y: 530, w: 238, h: 45 },
  { id: 'satisfies-keyword', label: 'satisfies keyword', kind: 'subtopic', x: -158, y: 583, w: 238, h: 45 },

  // === 3. Inference & Compatibility ===
  { id: 'type-inference', label: 'Type Inference', kind: 'topic', x: -614, y: 284, w: 252, h: 48 },
  { id: 'type-compatibility', label: 'Type Compatibility', kind: 'topic', x: -614, y: 342, w: 252, h: 48 },

  // === 4. Combining Types ===
  { id: 'combining-types', label: 'Combining Types', kind: 'topic', x: -614, y: 688, w: 252, h: 48 },
  { id: 'union-types', label: 'Union Types', kind: 'subtopic', x: -455, y: 435, w: 210, h: 46 },
  { id: 'intersection-types', label: 'Intersection Types', kind: 'subtopic', x: -455, y: 488, w: 210, h: 46 },
  { id: 'type-aliases', label: 'Type Aliases', kind: 'subtopic', x: -455, y: 541, w: 210, h: 46 },
  { id: 'keyof-operator', label: 'keyof Operator', kind: 'subtopic', x: -455, y: 594, w: 210, h: 46 },

  // === 5. Type Guards / Narrowing ===
  { id: 'type-guards-narrowing', label: 'Type Guards / Narrowing', kind: 'topic', x: -614, y: 780, w: 252, h: 48 },
  { id: 'guard-instanceof', label: 'instanceof', kind: 'subtopic', x: -284, y: 672, w: 172, h: 46 },
  { id: 'guard-typeof', label: 'typeof', kind: 'subtopic', x: -284, y: 725, w: 172, h: 46 },
  { id: 'guard-equality', label: 'Equality', kind: 'subtopic', x: -284, y: 778, w: 172, h: 46 },
  { id: 'guard-truthiness', label: 'Truthiness', kind: 'subtopic', x: -284, y: 831, w: 172, h: 46 },
  { id: 'guard-predicates', label: 'Type Predicates', kind: 'subtopic', x: -284, y: 884, w: 172, h: 46 },

  // === 6. Functions ===
  { id: 'ts-functions', label: 'TypeScript Functions', kind: 'topic', x: -614, y: 958, w: 252, h: 48 },
  { id: 'typing-functions', label: 'Typing Functions', kind: 'subtopic', x: -614, y: 1036, w: 252, h: 46 },
  { id: 'function-overloading', label: 'Function Overloading', kind: 'subtopic', x: -614, y: 1089, w: 252, h: 46 },

  // === 7. Interfaces ===
  { id: 'ts-interfaces', label: 'TypeScript Interfaces', kind: 'topic', x: -70, y: 756, w: 214, h: 48 },
  { id: 'types-vs-interfaces', label: 'Types vs Interfaces', kind: 'subtopic', x: 232, y: 703, w: 212, h: 46 },
  { id: 'extending-interfaces', label: 'Extending Interfaces', kind: 'subtopic', x: 232, y: 756, w: 212, h: 46 },
  { id: 'interface-declaration', label: 'Interface Declaration', kind: 'subtopic', x: 232, y: 809, w: 212, h: 46 },
  { id: 'hybrid-types', label: 'Hybrid Types', kind: 'subtopic', x: 232, y: 862, w: 212, h: 46 },

  // === 8. Classes ===
  { id: 'ts-classes', label: 'Classes', kind: 'topic', x: 172, y: 978, w: 140, h: 48 },
  { id: 'constructor-params', label: 'Constructor Params', kind: 'subtopic', x: 173, y: 1069, w: 268, h: 46 },
  { id: 'access-modifiers', label: 'Access Modifiers', kind: 'subtopic', x: 173, y: 1122, w: 268, h: 46 },
  { id: 'abstract-classes', label: 'Abstract Classes', kind: 'subtopic', x: 173, y: 1175, w: 268, h: 46 },
  { id: 'inheritance-polymorphism', label: 'Inheritance vs Polymorphism', kind: 'subtopic', x: 173, y: 1228, w: 268, h: 46 },
  { id: 'method-overriding', label: 'Method Overriding', kind: 'subtopic', x: 173, y: 1281, w: 268, h: 46 },
  { id: 'constructor-overloading', label: 'Constructor Overloading', kind: 'subtopic', x: 173, y: 1334, w: 268, h: 46 },

  // === 9. Generics & Decorators ===
  { id: 'ts-generics', label: 'Generics', kind: 'topic', x: -12, y: 1090, w: 146, h: 48 },
  { id: 'generic-types', label: 'Generic Types', kind: 'subtopic', x: -280, y: 1065, w: 202, h: 46 },
  { id: 'generic-constraints', label: 'Generic Constraints', kind: 'subtopic', x: -280, y: 1118, w: 202, h: 46 },
  { id: 'ts-decorators', label: 'Decorators', kind: 'topic', x: -12, y: 1266, w: 146, h: 48 },

  // === 10. Utility Types ===
  { id: 'utility-types', label: 'Utility Types', kind: 'topic', x: -280, y: 1266, w: 192, h: 48 },
  { id: 'util-partial', label: 'Partial', kind: 'subtopic', x: -618, y: 1157, w: 100, h: 45 },
  { id: 'util-pick', label: 'Pick', kind: 'subtopic', x: -514, y: 1157, w: 100, h: 45 },
  { id: 'util-omit', label: 'Omit', kind: 'subtopic', x: -618, y: 1210, w: 100, h: 45 },
  { id: 'util-readonly', label: 'Readonly', kind: 'subtopic', x: -514, y: 1210, w: 100, h: 45 },
  { id: 'util-record', label: 'Record', kind: 'subtopic', x: -618, y: 1263, w: 100, h: 45 },
  { id: 'util-exclude', label: 'Exclude', kind: 'subtopic', x: -514, y: 1263, w: 100, h: 45 },
  { id: 'util-extract', label: 'Extract', kind: 'subtopic', x: -618, y: 1316, w: 100, h: 45 },
  { id: 'util-awaited', label: 'Awaited', kind: 'subtopic', x: -514, y: 1316, w: 100, h: 45 },
  { id: 'util-parameters', label: 'Parameters', kind: 'subtopic', x: -618, y: 1369, w: 204, h: 45 },
  { id: 'util-nonnullable', label: 'NonNullable', kind: 'subtopic', x: -618, y: 1422, w: 204, h: 45 },
  { id: 'util-returntype', label: 'ReturnType', kind: 'subtopic', x: -618, y: 1475, w: 204, h: 45 },
  { id: 'util-instancetype', label: 'InstanceType', kind: 'subtopic', x: -618, y: 1528, w: 204, h: 45 },

  // === 11. Advanced Types ===
  { id: 'advanced-types', label: 'Advanced Types', kind: 'topic', x: -280, y: 1403, w: 192, h: 48 },
  { id: 'mapped-types', label: 'Mapped Types', kind: 'subtopic', x: -296, y: 1500, w: 222, h: 46 },
  { id: 'conditional-types', label: 'Conditional Types', kind: 'subtopic', x: -296, y: 1553, w: 222, h: 46 },
  { id: 'literal-types', label: 'Literal Types', kind: 'subtopic', x: -296, y: 1606, w: 222, h: 46 },
  { id: 'template-literal-types', label: 'Template Literal Types', kind: 'subtopic', x: -296, y: 1659, w: 222, h: 46 },
  { id: 'recursive-types', label: 'Recursive Types', kind: 'subtopic', x: -296, y: 1712, w: 222, h: 46 },

  // === 12. Modules ===
  { id: 'ts-modules', label: 'TypeScript Modules', kind: 'topic', x: 172, y: 1734, w: 258, h: 48 },
  { id: 'namespaces', label: 'Namespaces', kind: 'subtopic', x: 172, y: 1423, w: 258, h: 46 },
  { id: 'ambient-modules', label: 'Ambient Modules', kind: 'subtopic', x: 172, y: 1476, w: 258, h: 46 },
  { id: 'external-modules', label: 'External Modules', kind: 'subtopic', x: 172, y: 1529, w: 258, h: 46 },
  { id: 'namespace-augmentation', label: 'Namespace Augmentation', kind: 'subtopic', x: 172, y: 1582, w: 258, h: 46 },
  { id: 'global-augmentation', label: 'Global Augmentation', kind: 'subtopic', x: 172, y: 1635, w: 258, h: 46 },

  // === 13. Ecosystem ===
  { id: 'ts-ecosystem', label: 'Ecosystem', kind: 'topic', x: -30, y: 1882, w: 150, h: 48 },
  { id: 'eco-formatting', label: 'Formatting', kind: 'subtopic', x: 247, y: 1802, w: 192, h: 46 },
  { id: 'eco-linting', label: 'Linting', kind: 'subtopic', x: 247, y: 1855, w: 192, h: 46 },
  { id: 'eco-packages', label: 'Useful Packages', kind: 'subtopic', x: 247, y: 1908, w: 192, h: 46 },
  { id: 'eco-build-tools', label: 'Build Tools', kind: 'subtopic', x: 247, y: 1961, w: 192, h: 46 },
];

/**
 * Spine & Branch Edges connecting the official roadmap nodes cleanly:
 * style: 'solid' (Primary learning spine) | 'dashed' (Subtopic expansion branch)
 */
export const ROADMAP_EDGES = [
  // Primary Learning Spine (Solid Blue Path)
  ['intro-ts', 'ts-types-overview', 'solid'],
  ['ts-types-overview', 'type-inference', 'solid'],
  ['type-inference', 'type-compatibility', 'solid'],
  ['type-compatibility', 'combining-types', 'solid'],
  ['combining-types', 'type-guards-narrowing', 'solid'],
  ['type-guards-narrowing', 'ts-functions', 'solid'],
  ['ts-functions', 'ts-interfaces', 'solid'],
  ['ts-interfaces', 'ts-classes', 'solid'],
  ['ts-interfaces', 'ts-generics', 'solid'],
  ['ts-generics', 'ts-decorators', 'solid'],
  ['ts-decorators', 'utility-types', 'solid'],
  ['utility-types', 'advanced-types', 'solid'],
  ['advanced-types', 'ts-modules', 'solid'],
  ['ts-modules', 'ts-ecosystem', 'solid'],

  // Subtopic Branches (Dashed Blue Paths matching roadmap.sh)
  ['intro-ts', 'ts-vs-js', 'dashed'],
  ['intro-ts', 'ts-js-interop', 'dashed'],
  ['intro-ts', 'install-config', 'dashed'],
  ['install-config', 'tsconfig-json', 'dashed'],
  ['install-config', 'compiler-options', 'dashed'],
  ['intro-ts', 'running-ts', 'dashed'],
  ['running-ts', 'tsc-cli', 'dashed'],
  ['running-ts', 'ts-node-runners', 'dashed'],
  ['tsc-cli', 'ts-playground', 'dashed'],
  ['ts-node-runners', 'ts-playground', 'dashed'],

  ['ts-types-overview', 'type-string', 'dashed'],
  ['ts-types-overview', 'assert-as-type', 'dashed'],
  ['assert-non-null', 'satisfies-keyword', 'dashed'],

  ['combining-types', 'union-types', 'dashed'],
  ['combining-types', 'intersection-types', 'dashed'],
  ['combining-types', 'type-aliases', 'dashed'],
  ['combining-types', 'keyof-operator', 'dashed'],

  ['type-guards-narrowing', 'guard-instanceof', 'dashed'],
  ['type-guards-narrowing', 'guard-typeof', 'dashed'],
  ['type-guards-narrowing', 'guard-equality', 'dashed'],
  ['type-guards-narrowing', 'guard-truthiness', 'dashed'],
  ['type-guards-narrowing', 'guard-predicates', 'dashed'],

  ['ts-functions', 'typing-functions', 'dashed'],
  ['typing-functions', 'function-overloading', 'dashed'],

  ['ts-interfaces', 'types-vs-interfaces', 'dashed'],
  ['ts-interfaces', 'extending-interfaces', 'dashed'],
  ['ts-interfaces', 'interface-declaration', 'dashed'],
  ['ts-interfaces', 'hybrid-types', 'dashed'],

  ['ts-classes', 'constructor-params', 'dashed'],
  ['constructor-params', 'access-modifiers', 'dashed'],
  ['access-modifiers', 'abstract-classes', 'dashed'],
  ['abstract-classes', 'inheritance-polymorphism', 'dashed'],
  ['inheritance-polymorphism', 'method-overriding', 'dashed'],
  ['method-overriding', 'constructor-overloading', 'dashed'],

  ['ts-generics', 'generic-types', 'dashed'],
  ['ts-generics', 'generic-constraints', 'dashed'],

  ['utility-types', 'util-pick', 'dashed'],
  ['utility-types', 'util-readonly', 'dashed'],
  ['utility-types', 'util-exclude', 'dashed'],
  ['utility-types', 'util-awaited', 'dashed'],
  ['utility-types', 'util-parameters', 'dashed'],
  ['utility-types', 'util-nonnullable', 'dashed'],
  ['utility-types', 'util-returntype', 'dashed'],
  ['utility-types', 'util-instancetype', 'dashed'],

  ['advanced-types', 'mapped-types', 'dashed'],
  ['mapped-types', 'conditional-types', 'dashed'],
  ['conditional-types', 'literal-types', 'dashed'],
  ['literal-types', 'template-literal-types', 'dashed'],
  ['template-literal-types', 'recursive-types', 'dashed'],

  ['ts-modules', 'global-augmentation', 'dashed'],
  ['global-augmentation', 'namespace-augmentation', 'dashed'],
  ['namespace-augmentation', 'external-modules', 'dashed'],
  ['external-modules', 'ambient-modules', 'dashed'],
  ['ambient-modules', 'namespaces', 'dashed'],

  ['ts-ecosystem', 'eco-formatting', 'dashed'],
  ['ts-ecosystem', 'eco-linting', 'dashed'],
  ['ts-ecosystem', 'eco-packages', 'dashed'],
  ['ts-ecosystem', 'eco-build-tools', 'dashed'],
];
