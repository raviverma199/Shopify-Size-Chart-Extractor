import puppeteer from 'puppeteer';

export class Crawler {
  constructor(private store: string) {}

  async getProductLinks(): Promise<string[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36');

    const url = `https://${this.store}/collections/kurtas-for-women`;
    console.log(`🌐 Visiting: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // 📜 Scroll to load more products
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

    const links: string[] = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      const productLinks = anchors
        .map((a) => a.getAttribute('href'))
        .filter((href): href is string => !!href && href.includes('/products/'));

      const fullUrls = productLinks.map((href) =>
        href.startsWith('http') ? href : `https://${location.hostname}${href}`
      );

      // Deduplicate
      return Array.from(new Set(fullUrls));
    });

    await browser.close();
    console.log(`🔗 Found ${links.length} product links`);

    return links;
  }
}
