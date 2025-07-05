import puppeteer from "puppeteer";
import { Crawler } from "./crawler";
import { BrowserExtractor } from "./browser";
import { chunkArray, sleep } from "../utils/helper";

export class Processor {
  private crawler: Crawler;

  constructor(private store: string) {
    this.crawler = new Crawler(store);
  }

  async process() {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const extractor = new BrowserExtractor(browser);

      const productLinks = await this.crawler.getProductLinks();

      // Use first 20 links for example
      const links = productLinks.slice(0, 20);

      const concurrencyLimit = 5;
      const chunks = chunkArray(links, concurrencyLimit);

      const results: any[] = [];

      for (const group of chunks) {
        const pages = await Promise.all(
          Array.from({ length: group.length }, () => browser.newPage())
        );

        const groupResults = await Promise.all(
          group.map((url, idx) =>
            extractor.extract(url, pages[idx]).catch((e) => {
              console.warn(`Failed for ${url}:`, e);
              return null;
            })
          )
        );

        results.push(...groupResults.filter(Boolean));

        // Close pages to free memory
        await Promise.all(pages.map((p) => p.close()));

        // Optional delay between chunks to prevent getting blocked
        await sleep(1000);
      }

      await browser.close();

      return {
        store_name: this.store,
        products: results,
      };
    } catch (error) {
      console.error("⚠️ Error during processing:", error);
      return {
        store_name: this.store,
        products: [],
      };
    }
  }
}
