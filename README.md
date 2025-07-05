# Shopify-Size-Chart-Extractor
A scalable Node.js + TypeScript-based service that extracts size chart information from **Shopify stores**. Designed with clean architecture principles, concurrency handling, and extensibility in mind, this tool aims to process product data from thousands of Shopify stores with minimal friction.

> ⚠️ **Note:** This is a foundational version built for demonstration and can be expanded into a full-scale production-ready service.

---

## 📌 Project Goals

- ✅ Extract accurate **size chart** data (tables, text, images, etc.) from Shopify product/collection pages.
- ✅ Handle dynamic rendering using **Puppeteer** and static scraping with **Cheerio**.
- ✅ Support concurrent processing for multiple stores.
- ✅ Build with a **modular**, testable, and clean architecture.
- ✅ Add retry, delay, and error-handling strategies.
- ✅ Maintain extensibility for future growth — APIs, CLI, DB storage, UI, etc.

---

---

## 📦 How to Use

1. Inside the project, there's a folder named `input`.
2. Inside `input`, you’ll find a file called `store.json`.

### ✅ Add Your Store URLs

Edit `input/store.json` and put your Shopify store collection or product URLs in the array. Example:

```json
[
  "https://freakins.com",
  "https://westside.com"
]
```

### 📤 Check the Output
- Once the script finishes, the results will be saved to:
```json
[
 data/result.json
]
```
- That file will contain all the extracted size chart data in structured JSON format.

### 💻 Local Environment Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/raviverma199/Shopify-Size-Chart-Extractor.git
   cd Shopify-Size-Chart-Extractor

   ```

2. **Install Dependencies:**

   ```bash
   npm install

   ```

3. **Run the following command:**

   ```bash
   npm start

   ```

4. **Check the output:**

   ```bash
   data/result.json

    ```

### 📌 Note:
- In the file src/crawler.ts, the URL pattern is currently set to a default collection path like:

  ```bash
  const url = `https://${this.store}/collections/kurtas-for-women`;

    ```
- This is used to ensure consistent scraping, since not all product or homepage URLs work reliably across different Shopify stores.
If you want to extract the size chart from a different collection or page, you can simply change the path segment (kurtas-for-women) to any valid page on that store, such as co-ord-sets, dresses, or tops.
