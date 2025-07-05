import fs from 'fs';
import path from 'path';
import { Processor } from './core/processor';

// const fileName = `result.json`;
(async () => {
  const inputPath = path.join(__dirname, '..', 'input', 'stores.json');
  const outputPath = path.join(__dirname, '..', 'data');
  const fileName = 'result.json'; // ✅ fixed file name
  const outputFile = path.join(outputPath, fileName);

  if (!fs.existsSync(inputPath)) {
    console.error('❌ input/stores.json not found!');
    process.exit(1);
  }

  const stores: string[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const results = [];

  for (const store of stores) {
    try {
      const processor = new Processor(store);
      const result = await processor.process();
      console.log(`✅ ${store}: ${result.products.length} product(s) scraped.`);
      results.push(result);
    } catch (e) {
      console.warn(`⚠️ Failed to process ${store}:`, e);
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2)); // ✅ overwrite file

  console.log(`📦 Output saved to: data/${fileName}`);
})();
