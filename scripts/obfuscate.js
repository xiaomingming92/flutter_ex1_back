import JavaScriptObfuscator from 'javascript-obfuscator';
import { readdir, readFile, writeFile, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '../dist');

const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false, // 设置为 false，避免影响运行时
  debugProtectionInterval: 0,
  disableConsoleOutput: false, // 保留 console，方便调试生产问题
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
};

async function obfuscateFile(filePath) {
  try {
    const code = await readFile(filePath, 'utf-8');
    const obfuscationResult = JavaScriptObfuscator.obfuscate(
      code,
      obfuscatorOptions
    );
    await writeFile(filePath, obfuscationResult.getObfuscatedCode(), 'utf-8');
    console.log(`✓ Obfuscated: ${filePath.replace(distDir, 'dist')}`);
  } catch (error) {
    console.error(`✗ Error obfuscating ${filePath}:`, error.message);
  }
}

async function removeMapFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await removeMapFiles(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith('.map') || entry.name.endsWith('.d.ts'))
      ) {
        await unlink(fullPath);
        console.log(`✓ Removed: ${fullPath.replace(distDir, 'dist')}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${dir}:`, error.message);
  }
}

async function processDirectory(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.endsWith('.js') &&
        !entry.name.includes('node_modules')
      ) {
        await obfuscateFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
}

async function main() {
  console.log('🔒 Starting code obfuscation...\n');

  // 先混淆所有 JS 文件
  await processDirectory(distDir);

  // 然后删除所有 map 和 d.ts 文件
  console.log('\n🗑️  Removing source maps and type declarations...\n');
  await removeMapFiles(distDir);

  console.log('\n✅ Obfuscation complete!');
}

main().catch(console.error);
