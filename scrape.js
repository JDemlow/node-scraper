import puppeteer from "puppeteer";
import * as fs from "node:fs/promises";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scrape = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const allBooks = [];
  let currentPage = 1;
  const maxPages = 10;

  try {
    while (currentPage <= maxPages) {
      const url = `https://books.toscrape.com/catalogue/page-${currentPage}.html`;

      await page.goto(url);

      const books = await page.evaluate(() => {
        const bookElements = document.querySelectorAll(".product_pod");
        return Array.from(bookElements).map((book) => {
          const title = book.querySelector("h3 a").getAttribute("title");
          const price = book.querySelector(".price_color").textContent;
          const stock = book.querySelector(".instock.availability")
            ? "In Stock"
            : "Out of Stock";
          const rating = book
            .querySelector(".star-rating")
            .className.split(" ")[1];
          const link = book.querySelector("h3 a").getAttribute("href");

          return {
            title,
            price,
            stock,
            rating,
            link,
          };
        });
      });

      allBooks.push(...books);
      console.log(`Books on page ${currentPage}: `, books);

      // Use the custom delay function
      await delay(1000); // Wait for 1 second

      currentPage++;
    }

    await fs.writeFile("books.json", JSON.stringify(allBooks, null, 2));
    console.log("Data saved to books.json");
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await browser.close();
  }
};

scrape();
