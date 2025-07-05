import puppeteer from 'puppeteer';
import { Crawler } from './crawler';
import { BrowserExtractor } from './browser';

export class Processor {
  private crawler: Crawler;

  constructor(private store: string) {
    this.crawler = new Crawler(store);
  }

  async process() {
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const extractor = new BrowserExtractor(browser);
    const products: any[] = [];

    const links = await this.crawler.getProductLinks();

    const page = await browser.newPage(); // ✅ You created page here

    for (const url of links.slice(0, 5)) {
      try {
        const product = await extractor.extract(url, page); // ❌ You are NOT passing `page`
        products.push(product);
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        console.warn(`⚠️ Failed to extract product: ${url}`);
        console.error(e);
      }
    }

    await page.close(); // ✅ Closing the page
    await browser.close(); // ✅ Closing the browser

    return {
      store_name: this.store,
      products
    };
  }
}
