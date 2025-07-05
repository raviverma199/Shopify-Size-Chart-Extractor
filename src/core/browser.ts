import { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';

export class BrowserExtractor {
  constructor(private browser: Browser) {}

  async extract(productUrl: string, page: Page) {
    await page.goto(productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    const productTitle = await page.title();
    let html = await page.content();
    let $ = cheerio.load(html);

    // ✅ Click "Size Chart" if found
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('button, a'))
        .find(e => e.textContent?.toLowerCase().includes('size chart'));
      if (el) (el as HTMLElement).click();
    });

    // ✅ Wait for modal (basic delay)
    await new Promise(resolve => setTimeout(resolve, 1500));

    html = await page.content();
    $ = cheerio.load(html);

    const table = $('table');
    let size_chart = null;

    if (table.length > 0) {
      const headers: string[] = [];
      const rows: Record<string, string | { inch: string; cm: string }>[]
        = [];

      table.first().find('tr').each((i, el) => {
        const cells = $(el).find('th, td');

        if (i === 0) {
          cells.each((_, cell) => {
            headers.push($(cell).text().trim());
          });
        } else {
          const row: Record<string, string | { inch: string; cm: string }> = {};

          cells.each((j, cell) => {
            const key = headers[j] || `col_${j}`;
            const rawText = $(cell).text().trim();
            const parts = rawText.split(/\s+/);

            if (
              parts.length === 2 &&
              /^\d+$/.test(parts[0]) &&
              /^\d+$/.test(parts[1])
            ) {
              row[key] = {
                inch: parts[0],
                cm: parts[1]
              };
            } else {
              row[key] = rawText;
            }
          });

          rows.push(row);
        }
      });

      size_chart = { headers, rows };
    } else {
      // ✅ Check if chart is an image
      const img = $('img')
        .filter((_, el) => {
          const src = $(el).attr('src') || '';
          const alt = $(el).attr('alt') || '';
          return /size|chart/i.test(src + alt);
        })
        .first();

      if (img.length > 0) {
        size_chart = {
          image_url: img.attr('src'),
          note: 'Size chart is an image'
        };
      }
    }

    return {
      product_title: productTitle,
      product_url: productUrl,
      size_chart
    };
  }
}
