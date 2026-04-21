/**
 * SLAMZ DRACO COMPRESSION PIPELINE [SYS-AST-300]
 * 
 * Compresses all GLB assets using gltf-pipeline with Draco geometry compression.
 * Run: node 300_ASSET_PIPELINE/compress-glbs.mjs
 * 
 * Before: ~75MB total across 8 GLBs
 * After:  ~10-15MB projected (typical 60-80% reduction)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, stat, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const glbDir = path.join(projectRoot, 'public', 'assets', 'glbs');
const backupDir = path.join(projectRoot, 'public', 'assets', 'glbs_backup');

const MB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

async function compressAll() {
  console.log('\n🗜  SLAMZ DRACO COMPRESSION PIPELINE\n');

  // 1. Backup originals if not already done
  if (!existsSync(backupDir)) {
    await mkdir(backupDir, { recursive: true });
    console.log('📦 Created backup directory:', backupDir);
  }

  // 2. Find all GLBs
  const files = (await readdir(glbDir)).filter(f => f.endsWith('.glb'));
  console.log(`📂 Found ${files.length} GLB files:\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const inputPath = path.join(glbDir, file);
    const backupPath = path.join(backupDir, file);
    const outputPath = inputPath; // overwrite in place

    const beforeStat = await stat(inputPath);
    const beforeSize = beforeStat.size;
    totalBefore += beforeSize;

    console.log(`  ⚙️  ${file} (${MB(beforeSize)} MB)`);

    // Backup original if not already backed up
    if (!existsSync(backupPath)) {
      await execAsync(`copy "${inputPath}" "${backupPath}"`);
    }

    try {
      // Run gltf-pipeline with Draco compression
      await execAsync(
        `npx gltf-pipeline -i "${inputPath}" -o "${outputPath}" --draco.compressionLevel 7 --draco.quantizePositionBits 14 --draco.quantizeNormalBits 10 --draco.quantizeTexcoordBits 12`,
        { cwd: projectRoot }
      );

      const afterStat = await stat(outputPath);
      const afterSize = afterStat.size;
      totalAfter += afterSize;
      const reduction = (((beforeSize - afterSize) / beforeSize) * 100).toFixed(1);

      console.log(`     ✅ ${MB(beforeSize)} MB → ${MB(afterSize)} MB (${reduction}% smaller)\n`);
    } catch (err) {
      totalAfter += beforeSize; // count as unchanged on error
      console.error(`     ❌ FAILED: ${err.message}\n`);
    }
  }

  // 3. Summary
  const totalReduction = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1);
  console.log('─'.repeat(50));
  console.log(`📊 TOTAL: ${MB(totalBefore)} MB → ${MB(totalAfter)} MB`);
  console.log(`💾 SAVED: ${MB(totalBefore - totalAfter)} MB (${totalReduction}% reduction)`);
  console.log('\n✅ Originals backed up to: public/assets/glbs_backup/');
  console.log('🚀 Compressed files written to: public/assets/glbs/\n');
}

compressAll().catch(console.error);
