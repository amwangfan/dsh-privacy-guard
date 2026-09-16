import { execSync } from 'node:child_process'
import { mkdirSync, existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs'

mkdirSync('lib', { recursive: true })

const esbuildCandidates = [
  'esbuild',
  './node_modules/.bin/esbuild',
  '/opt/campustrust-demo/mock-releases/20260729-0255-snapshot-20260715/node_modules/.bin/esbuild',
  '/root/grok-remote/node_modules/.bin/esbuild',
]

let esbuildBin = 'esbuild'
for (const cand of esbuildCandidates) {
  if (existsSync(cand)) {
    esbuildBin = cand
    break
  }
}

console.log(`Using esbuild at: ${esbuildBin}`)

// The package name doubles as the client module id DSH's graph resolves.
const PACKAGE_ID = 'dsh-privacy-guard'

// 1. Host half (Node.js ESM).
//
// `@deepseek-ai/*` stays external because DSH provides those at runtime. Small
// ordinary libraries (js-yaml) are bundled instead of declared as dependencies:
// the plugin is consumed as a link, so a bundled dependency is the only way it
// is guaranteed to resolve without the profile installing anything extra.
// NODE_PATH lets esbuild find the profile's copy for resolution.
execSync(
  `"${esbuildBin}" src/index.ts --outfile=lib/index.js --bundle --format=esm --platform=node --target=node20 --external:@deepseek-ai/*`,
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_PATH: [
        process.env.NODE_PATH,
        '/root/.dsh/profiles/web/node_modules',
        `${process.env.HOME || '/root'}/.dsh/profiles/node_modules`,
      ]
        .filter(Boolean)
        .join(':'),
    },
  },
)
console.log('✓ Built lib/index.js')

// 2. Client half.
//
// DSH loads a client plugin as a CLASSIC script that registers its factory:
//
//   window.__ModuleLoader__.load({ id, factory: (require) => { ... } })
//
// The host concatenates every plugin's client entry into ONE classic-script
// batch. A top-level ESM `import`/`export` anywhere in that batch is a
// SyntaxError ("Cannot use import statement outside a module"), which kills
// the ENTIRE batch — every plugin then fails with "loaded without registering
// ... via __ModuleLoader__.load". So the client half must be CJS: esbuild
// rewrites externals to `require(...)`, answered by the factory's `require`
// parameter, and this script wraps the body in the loader's registration
// envelope. Do not switch this back to `--format=esm`.
const rawClient = 'lib/.client.raw.js'
execSync(
  `"${esbuildBin}" src/client.ts --outfile=${rawClient} --bundle --format=cjs --platform=browser --target=es2022 --external:react --external:react-dom --external:@deepseek-ai/*`,
  { stdio: 'inherit' }
)

const body = readFileSync(rawClient, 'utf8')

// Guard the invariant the whole batch depends on.
const esm = body.match(/^(?:import|export)\s.*$/m)
if (esm !== null) {
  throw new Error(
    `refusing to emit lib/client.js: bundle still has top-level ESM syntax (${JSON.stringify(esm[0])}) — ` +
      'it would be concatenated into the shared classic-script batch and break every client plugin.',
  )
}

writeFileSync(
  'lib/client.js',
  [
    'window.__ModuleLoader__.load({',
    `\tid: ${JSON.stringify(PACKAGE_ID)},`,
    '\tfactory: (require) => {',
    '\t\tvar module = { exports: {} };',
    '\t\tvar exports = module.exports;',
    '\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });',
    body,
    '\t\treturn module.exports;',
    '\t}',
    '});',
    '',
  ].join('\n'),
)
rmSync(rawClient, { force: true })
console.log('✓ Built lib/client.js (DSH client-module wrapper)')

console.log('Build completed successfully!')
