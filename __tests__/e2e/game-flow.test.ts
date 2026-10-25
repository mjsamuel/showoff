import puppeteer, { type Browser, type Page } from "puppeteer";
import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";

let browser: Browser;
let page: Page;

const challengeTitles = () =>
  page.$$eval("[data-card=category] p:first-child", (els) =>
    els.map((el) => el.textContent),
  );

describe("Game flow", () => {
  beforeAll(async () => {
    browser = await puppeteer.connect({
      browserWSEndpoint: inject("wsEndpoint"),
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(inject("baseUrl"));
  });

  afterAll(async () => {
    await page.close();
    await browser.disconnect();
  });

  it("shows the board with a first challenge", async () => {
    await page.waitForSelector("h1::-p-text(Showoff)");
    await page.waitForSelector("[data-card=category]");
    expect(await challengeTitles()).toHaveLength(1);
  });

  it("draws a new challenge each turn", async () => {
    await page.click("button::-p-text(Next turn)");
    await page.waitForFunction(
      () => document.querySelectorAll("[data-card=category]").length === 2,
    );
    const titles = await challengeTitles();
    expect(titles).toHaveLength(2);
  });

  it("adds a player", async () => {
    await page.click("button::-p-text(Add player)");
    await page.waitForSelector('input[value="Player 2"]');
  });

  it("remembers settings across reloads", async () => {
    await page.click("::-p-text(Repeat categories/modifiers)");
    await page.reload();
    await page.waitForSelector("#repeat[data-state=checked]");
  });

  it("opens the create room dialog", async () => {
    await page.click("button::-p-text(Create room)");
    await page.waitForSelector("h2::-p-text(Create a room)");
  });
});
