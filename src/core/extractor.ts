import { Page } from "puppeteer";
import * as cheerio from "cheerio";
import { retryWithBackoff, sleep, parseSizeValue } from "../utils/helper";

export class BrowserExtractor {
  static async extract(productUrl: string, page: Page) {
    try {
      // Set a realistic user-agent to avoid bot detection
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115 Safari/537.36"
      );

      // Navigate to the product page
      await page.goto(productUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Get the product title
      const productTitle = await page.title();

      // Try clicking on the size chart button/link
      await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll("button, a")).find(
          (e) => e.textContent?.toLowerCase().includes("size chart")
        );
        if (el) (el as HTMLElement).click();
      });

      // Wait a bit to let modal or content load
      await new Promise((res) => setTimeout(res, 1500));

      // Load page content into Cheerio for parsing
      const html = await retryWithBackoff(() => page.content(), 3, 1000);
      const $ = cheerio.load(html);

      let size_chart: any = null;

      // try to find a table
      const table = $("table");

      if (table.length > 0) {
        const headers: string[] = [];
        const rows: Record<string, string>[] = [];

        // Parse the first table found
        table
          .first()
          .find("tr")
          .each((i, el) => {
            const cells = $(el).find("th, td");
            if (i === 0) {
              // Extract header cells
              cells.each((j, cell) => {
                headers.push($(cell).text().trim());
              });
            } else {
              // Extract row values based on headers
              // const row: Record<string, string> = {};
              const rows: Record<string, string | { inch: string; cm: string }>[] = [];
              const row: Record<string, string | { inch: string; cm: string }> ={};

              cells.each((j, cell) => {
                // row[headers[j] || `col_${j}`] = $(cell).text().trim();
                const key = headers[j] || `col_${j}`;
                let rawText = $(cell).text().trim();

                // If it's the Size column, remove duplicate sizes (e.g., "xxs xxs" → "XXS")
                if (/size/i.test(key)) {
                  const parts = rawText.split(/\s+/);
                  const unique = Array.from(
                    new Set(parts.map((p) => p.toUpperCase()))
                  );
                  rawText = unique.join(" ");
                }

                row[key] = parseSizeValue(rawText);
              });
              rows.push(row);
            }
          });

        size_chart = { type: "table", headers, rows };
      } else {
        // Fallback: Look for a size chart image (if no table is found)
        const img = $("img")
          .filter((_, el) => {
            const alt = $(el).attr("alt")?.toLowerCase() || "";
            const src = $(el).attr("src")?.toLowerCase() || "";
            return alt.includes("size") || src.includes("size");
          })
          .first();

        if (img.length > 0) {
          size_chart = {
            type: "image",
            image_url: img.attr("src") || null,
          };
        }
      }

      // Final result
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
