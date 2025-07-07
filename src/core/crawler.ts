import puppeteer from "puppeteer";
import { retryWithBackoff } from "../utils/helper";

// Crawler is responsible for visiting a Shopify collection page  and extracting product links.
export class Crawler {
  constructor(private store: string) {}

  async getProductLinks(): Promise<string[]> {
    try {
      //Launch a headless browser
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();

      // set user agent to avoid bot detection
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36"
      );

      const url = `https://${this.store}/collections/kurtas-for-women`;
      console.log(`Visiting: ${url}`);

      // Go to the collection page
      await retryWithBackoff(() =>
  page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 30000,
  })
);

      // Scroll down to load more products (infinite scroll support)
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 500;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve(true);
            }
          }, 300);
        });
      });

      // extract product links from the page
      const links: string[] = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("a"));

        // Filter and collect all product links
        const productLinks = anchors
          .map((a) => a.getAttribute("href"))
          .filter(
            (href): href is string => !!href && href.includes("/products/")
          );

        // Convert relative URLs to full URLs
        const fullUrls = productLinks.map((href) =>
          href.startsWith("http") ? href : `https://${location.hostname}${href}`
        );

        // remove duplicates
        return Array.from(new Set(fullUrls));
      });

      // close the browser
      await browser.close();

      console.log(`Found ${links.length} product links`);
      return links;
    } catch (error) {
      console.error("Error while crawling:", error);
      return [];
    }
  }
}
