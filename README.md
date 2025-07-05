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
