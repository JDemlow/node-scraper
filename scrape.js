import puppeteer from "puppeteer";
import * as fs from "node:fs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scrapeYahooFinance = async (ticker) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const url = `https://finance.yahoo.com/quote/${ticker}`;

  try {
    await page.goto(url, { waitUntil: "networkidle2" });
  } catch (error) {
    console.error(`Error loading the page for ${ticker}: ${error}`);
    await browser.close();
    return null;
  }

  const stockData = await page.evaluate(() => {
    const priceElement = document.querySelector(
      "fin-streamer[data-field='regularMarketPrice']"
    );
    const changeElement = document.querySelector(
      "fin-streamer[data-field='regularMarketChangePercent']"
    );
    const marketCapElement = document.querySelector(
      "fin-streamer[data-field='marketCap']"
    );
    const peRatioElement = document.querySelector(
      "fin-streamer[data-field='forwardPE']"
    );
    const dividendYieldElement = document.querySelector(
      "fin-streamer[data-field='dividendYield']"
    );

    return {
      price: priceElement ? priceElement.innerText.trim() : "N/A",
      change: changeElement ? changeElement.innerText.trim() : "N/A",
      marketCap: marketCapElement ? marketCapElement.innerText.trim() : "N/A",
      peRatio: peRatioElement ? peRatioElement.innerText.trim() : "N/A",
      dividendYield: dividendYieldElement
        ? dividendYieldElement.innerText.trim()
        : "N/A",
    };
  });

  await browser.close();
  return { ticker, ...stockData };
};

const scrapeMultipleTickers = async (tickers) => {
  const allStockData = [];

  for (const ticker of tickers) {
    const stockData = await scrapeYahooFinance(ticker);
    if (stockData) {
      allStockData.push(stockData);
    }
    await delay(2000);
  }

  fs.writeFileSync("stock_data.json", JSON.stringify(allStockData, null, 2));
};

const tickers = ["AAPL", "GOOGL", "MSFT"];
scrapeMultipleTickers(tickers);
