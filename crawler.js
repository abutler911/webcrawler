const axios = require("axios");
const cheerio = require("cheerio");
const visitedUrls = new Set();
const startUrl = "https://www.wikipedia.org";
const maxDepth = 3;

const fetchPage = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data; // Returns HTML content
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
};

const extractLinks = (html, baseUrl) => {
  const $ = cheerio.load(html);
  const links = [];
  $("a").each((index, element) => {
    let link = $(element).attr("href");
    if (link && link.startsWith("/") && !link.startsWith("//")) {
      link = baseUrl + link; // Convert relative URL to absolute
    }
    if (link && !links.includes(link) && link.startsWith("http")) {
      links.push(link);
    }
  });
  return links;
};

const crawl = async (url, depth = 0) => {
  if (depth > maxDepth || visitedUrls.has(url)) {
    return;
  }
  console.log(`Crawling ${url}`);
  visitedUrls.add(url);

  const html = await fetchPage(url);
  if (html) {
    const links = extractLinks(html, new URL(url).origin);
    for (const link of links) {
      await crawl(link, depth + 1); // Recursively crawl the found links
    }
  }
};

crawl(startUrl);
