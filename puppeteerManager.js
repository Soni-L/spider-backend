import puppeteer from "puppeteer";
import cron from "node-cron";

let browserInstance = null;
const pages = [];

const launchBrowser = async () => {
  if (browserInstance) {
    return browserInstance;
  }

  browserInstance = await puppeteer.launch();

  browserInstance.on("disconnected", () => {
    console.error("Browser disconnected, restarting...");
    browserInstance = null;
    launchBrowser().then(() => console.log("Browser restarted successfully"));
  });

  return browserInstance;
};

const getBrowser = async () => {
  if (!browserInstance) {
    await launchBrowser();
  }
  return browserInstance;
};

async function createNewPage(id, browserInstance) {
  try {
    const browser = browserInstance;
    const page = await browser.newPage();
    const createdAt = new Date();
    pages.push({ id, page, createdAt });
    return page;
  } catch {
    console.log(error);
    return null;
  }
}

function getPageById(id) {
  const now = new Date();
  const pageData = pages.find(
    (p) => p.id === id && now - p.createdAt < 3600000
  ); // 1 hour in ms
  if (pageData) {
    return pageData.page;
  } else {
    return null;
  }
}

function removeOldPages() {
  const now = new Date();
  for (let i = pages.length - 1; i >= 0; i--) {
    if (now - pages[i].createdAt >= 3600000) {
      // 1 hour in ms
      pages.splice(i, 1);
    }
  }
}

// Schedule the cron job to run every hour
cron.schedule("0 * * * *", () => {
  removeOldPages();
});

const closeBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
};

export { getBrowser, closeBrowser, createNewPage, getPageById };
