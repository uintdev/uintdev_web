console.log("---------- Blog Entry Collector ----------");

import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

// Configuration constants
const BLOG_URL: string = "https://blog.uint.dev";
const SELECTOR: string = ".listing .card";
const POST_LIMIT: number = 5;
const BLOG_TITLE: string = "Recent Posts";
const BLOG_DESCRIPTION: string = `See all <a href="${BLOG_URL}">here</a>.`;

// Data structures
interface Post {
  link: string;
  title: string;
  description: string;
  metadata: string;
}

interface BlogEntryMetadata {
  title: string;
  description: string;
  base: string;
}

interface BlogEntry {
  metadata: BlogEntryMetadata;
  posts: Post[];
}

// Initialize blog entry object
const blogEntryObject: BlogEntry = {
  metadata: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    base: BLOG_URL,
  },
  posts: [],
};

// Fetch and parse blog data
async function fetchData(
  url: string,
  selector: string,
  limit: number,
): Promise<void> {
  try {
    const { data } = await axios.get(url);
    const $: cheerio.CheerioAPI = cheerio.load(data);
    const elements = $(selector);

    if (elements.length === 0) {
      console.log(`No elements found with selector '${selector}'`);
      process.exit(1);
    }

    elements.each((index, element): void => {
      if (index >= limit) return;

      const card = $(element);
      const link: string = card.attr("href") ?? "#";
      const title: string = card.find(".title").eq(0).text();
      const description: string = card.find(".description").eq(0).text();
      const metadata: string = card.find(".metadata").eq(0).html() ?? "";

      console.log(`--- Index ${index} ---`);
      console.log({ link, title, description, metadata });
      console.log(`----------------------`);

      blogEntryObject.posts.push({ link, title, description, metadata });
    });
  } catch (error) {
    console.error("Error fetching or parsing the page:", error);
    process.exit(1);
  }
}

// Write data to JSON file
async function writeJsonToFile(
  directory: string,
  filename: string,
  data: BlogEntry,
): Promise<void> {
  try {
    const filePath: string = path.join(directory, filename);
    console.log(`Writing to ${filePath}...`);
    await Bun.write(filePath, JSON.stringify(data, null, 2));
    console.log(`Successfully wrote to ${filePath}`);
  } catch (error) {
    console.error("Error writing to JSON file:", error);
    process.exit(1);
  }
}

// Execution flow
console.log("Stage 1: fetch blog posts");
await fetchData(BLOG_URL, SELECTOR, POST_LIMIT);
console.log(blogEntryObject);

console.log("Stage 2: write blog posts to file");
await writeJsonToFile("./src/data", "blog.json", blogEntryObject);

console.log("Done! Proceeding with build.");
console.log("------------------------------------------");
console.log("Creating build...");
