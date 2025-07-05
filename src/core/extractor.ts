import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';

export class BrowserExtractor {
  async extract(productUrl: string, page: Page) {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115 Safari/537.36'
    );

    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const productTitle = await page.title();

    // ✅ Try clicking size chart button
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('button, a'))
        .find(e => e.textContent?.toLowerCase().includes('size chart'));
      if (el) (el as HTMLElement).click();
    });

    await new Promise(res => setTimeout(res, 1500)); // Wait for modal

    const html = await page.content();
    const $ = cheerio.load(html);

    let size_chart = null;
    const table = $('table');

    if (table.length > 0) {
      const headers: string[] = [];
      const rows: Record<string, string>[] = [];

      table.first().find('tr').each((i, el) => {
        const cells = $(el).find('th, td');
        if (i === 0) {
          // cells.each((_, cell) => headers.push($(cell).text().trim()));
          cells.each((_: number, cell: any) => {
  headers.push($(cell).text().trim());
});
        } else {
          const row: Record<string, string> = {};
          cells.each((j, cell) => {
            row[headers[j] || `col_${j}`] = $(cell).text().trim();
          });
          rows.push(row);
        }
      });

      size_chart = { headers, rows };
    } else {
      // ✅ fallback: check for size chart image
const img = $('img').filter((_: number, el: any) => {
  const alt = $(el).attr('alt')?.toLowerCase() || '';
  const src = $(el).attr('src')?.toLowerCase() || '';
  return alt.includes('size') || src.includes('size');
}).first();

      if (img.length > 0) {
        size_chart = {
          image_url: img.attr('src') || null,
          type: 'image'
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
