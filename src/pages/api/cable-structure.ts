import { NextApiRequest, NextApiResponse } from "next";
import * as puppeteer from "puppeteer";

let browser: puppeteer.Browser | null = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const data = req.body;
    console.log(data);

    if (!data || !data.processName) {
      return res
        .status(400)
        .json({ error: "Missing required field: processName." });
    }

    const validProcesses = [
      "WireDrawing",
      "Stranding",
      "Laying",
      "Extrusion",
      "Bedding",
      "Sheathing",
      "Armouring",
    ];
    if (!validProcesses.includes(data.processName)) {
      return res.status(400).json({
        error: `Invalid processName: '${data.processName}'. Expected one of: ${validProcesses.join(", ")}.`,
      });
    }

    const browser = await getBrowser(); // Reuse the same browser
    const page = await browser.newPage();

    const url = `http://localhost:3000/svg-render?data=${encodeURIComponent(JSON.stringify(data))}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("svg", { timeout: 5000 });

    const svgContent = await page.evaluate(() => {
      const svg = document.querySelector("svg");
      return svg ? svg.outerHTML : null;
    });

    await page.close(); // Close only the page, not the entire browser

    if (!svgContent) {
      return res.status(500).json({
        error: `Failed to generate SVG for processName: '${data.processName}'. Make sure the corresponding component exists.`,
      });
    }

    // ✅ Return SVG string in JSON
    res.status(200).json({ svg: svgContent });
    
  } catch (err) {
    console.error("Error generating SVG:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
