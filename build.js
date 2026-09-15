import { execSync } from 'node:child_process'
import { mkdirSync, existsSync } from 'node:fs'

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

// 1. Host side (Node.js ESM)
execSync(
  `"${esbuildBin}" src/index.ts --outfile=lib/index.js --bundle --format=esm --platform=node --target=node20 --packages=external`,
  { stdio: 'inherit' }
)
console.log('✓ Built lib/index.js')

// 2. Client side (Browser ESM)
execSync(
  `"${esbuildBin}" src/client.ts --outfile=lib/client.js --bundle --format=esm --platform=browser --target=es2022 --external:react --external:react-dom --external:@deepseek-ai/*`,
  { stdio: 'inherit' }
)
console.log('✓ Built lib/client.js')

console.log('Build completed successfully!')
