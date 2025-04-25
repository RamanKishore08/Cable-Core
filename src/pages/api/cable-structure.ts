import { NextApiRequest, NextApiResponse } from "next";
import { chromium, Browser } from "playwright";

let browser: Browser | null = null;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
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

    if (!data || !data.processName) {
      return res
        .status(400)
        .json({ error: "Missing required field: processName" });
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

    const browser = await getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const url = `https://cablecoreapi.vercel.app/svg-render?data=${encodeURIComponent(JSON.stringify(data))}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
      await page.waitForSelector("svg", { timeout: 5000 });

      const svgContent = await page.evaluate(() => {
        const svg = document.querySelector("svg");
        return svg ? svg.outerHTML : null;
      });

      if (!svgContent) {
        throw new Error("SVG not found");
      }

      // ✅ Return the SVG string inside a JSON response body
      res.status(200).json({ svg: svgContent });

    } catch (error) {
      console.error("Error capturing SVG:", error);
      res.status(500).json({ error: "Failed to generate SVG" });
    } finally {
      await page.close();
      await context.close();
    }

  } catch (err) {
    console.error("Error handling request:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
