import puppeteer from "puppeteer";

let browserInstance = null;

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

const closeBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
};

export { getBrowser, closeBrowser };
