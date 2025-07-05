import { Browser, Page } from "puppeteer";
import * as cheerio from "cheerio";
import { parseSizeValue, cleanSizeValue } from "../utils/helper";

/**
 * BrowserExtractor extracts the size chart from a product page using Puppeteer and Cheerio.
 */
export class BrowserExtractor {
  constructor(private browser: Browser) {}

  async extract(productUrl: string, page: Page) {
    try {
      await page.goto(productUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      const productTitle = await page.title();

      let html = await page.content();
      let $ = cheerio.load(html);

      // Click "Size Chart" button or link
      await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll("button, a")).find(
          (e) => e.textContent?.toLowerCase().includes("size chart")
        );
        if (el) (el as HTMLElement).click();
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      html = await page.content();
      $ = cheerio.load(html);

      let size_chart = null;
      const table = $("table");

      if (table.length > 0) {
        const headers: string[] = [];
        const rows: Record<string, string | { inch: string; cm: string }>[] =
          [];

        table
          .first()
          .find("tr")
          .each((i, el) => {
            const cells = $(el).find("th, td");

            if (i === 0) {
              cells.each((_, cell) => {
                headers.push($(cell).text().trim());
              });
            } else {
              const row: Record<string, string | { inch: string; cm: string }> =
                {};

              cells.each((j, cell) => {
                const key = headers[j] || `col_${j}`;
                let rawText = $(cell).text().trim();

                if (/size/i.test(key)) {
                  rawText = cleanSizeValue(rawText); // ✅ clean "XS XS" → "XS"
                }

                row[key] = parseSizeValue(rawText); // Handles inch/cm like "29 74"
              });

              rows.push(row);
            }
          });

        size_chart = {
          type: "table",
          headers,
          rows,
        };
      } else {
        const img = $("img")
          .filter((_, el) => {
            const src = $(el).attr("src") || "";
            const alt = $(el).attr("alt") || "";
            return /size|chart/i.test(src + alt);
          })
          .first();

        if (img.length > 0) {
          size_chart = {
            type: "image",
            image_url: img.attr("src"),
            note: "Size chart is an image",
          };
        }
      }

      return {
        product_title: productTitle,
        product_url: productUrl,
        size_chart,
      };
    } catch (error) {
      console.error(`Failed to extract size chart from ${productUrl}:`, error);
      return {
        product_title: null,
        product_url: productUrl,
        size_chart: null,
      };
    }
  }
}
