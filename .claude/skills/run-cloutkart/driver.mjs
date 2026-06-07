#!/usr/bin/env node
/**
 * CloutKart Playwright driver
 * Usage: node driver.mjs [command] [args...]
 *
 * Commands:
 *   screenshot [path]        - Take a screenshot (default: /tmp/ck-screenshot.png)
 *   screenshot-route <route> [path] - Navigate to route and screenshot
 *   smoke                    - Full smoke test: landing + login page
 *   interact <repl>          - Drop into interactive REPL loop (stdin)
 *
 * Env vars (read from .env.local if present):
 *   PORT  - dev server port (default: 5173)
 */

import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

const __dir = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dir, '../../..');
const PORT = process.env.PORT || 5173;
const BASE = `http://localhost:${PORT}`;

const SCREENSHOT_DIR = '/tmp/ck-screenshots';
import { mkdirSync } from 'fs';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

function screenshotPath(name) {
  return `${SCREENSHOT_DIR}/${name || 'screenshot'}.png`;
}

async function launchBrowser() {
  return chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
}

async function cmd_screenshot(route, outName) {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  const url = route ? `${BASE}${route}` : BASE;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  const path = screenshotPath(outName || 'screenshot');
  await page.screenshot({ path, fullPage: false });
  console.log(`Screenshot: ${path}`);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await browser.close();
  return path;
}

async function cmd_smoke() {
  const browser = await launchBrowser();
  const results = [];

  async function check(label, route, waitFor) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    const url = `${BASE}${route}`;
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', e => consoleErrors.push(e.message));

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      if (waitFor) {
        await page.waitForSelector(waitFor, { timeout: 10000 });
      }
      const slug = label.toLowerCase().replace(/\s+/g, '-');
      const ss = screenshotPath(slug);
      await page.screenshot({ path: ss, fullPage: false });
      const title = await page.title();
      results.push({ label, route, ok: true, screenshot: ss, title, consoleErrors });
      console.log(`  ✓ ${label} → ${ss}`);
    } catch (e) {
      results.push({ label, route, ok: false, error: e.message, consoleErrors });
      console.log(`  ✗ ${label}: ${e.message}`);
    } finally {
      await page.close();
    }
  }

  console.log('=== CloutKart smoke test ===');
  await check('Landing page', '/', 'nav');
  await check('Login page', '/login', 'form');
  await check('Signup page', '/signup', 'form');
  await check('Forgot password', '/forgot-password', 'form');

  await browser.close();

  const failed = results.filter(r => !r.ok);
  if (failed.length) {
    console.log(`\n${failed.length} route(s) failed.`);
    process.exit(1);
  } else {
    console.log(`\nAll ${results.length} routes OK.`);
    console.log(`Screenshots in ${SCREENSHOT_DIR}/`);
  }
  return results;
}

async function cmd_repl() {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });

  console.log('CloutKart REPL — commands: nav <url>, ss [name], click <sel>, fill <sel> <text>, eval <js>, title, quit');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });
  rl.prompt();

  rl.on('line', async (line) => {
    const [cmd, ...rest] = line.trim().split(' ');
    try {
      if (cmd === 'nav') {
        const url = rest[0].startsWith('http') ? rest[0] : `${BASE}${rest[0]}`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        console.log(`Navigated to ${url}`);
      } else if (cmd === 'ss') {
        const p = screenshotPath(rest[0] || 'repl');
        await page.screenshot({ path: p });
        console.log(p);
      } else if (cmd === 'click') {
        await page.click(rest.join(' '));
        console.log('clicked');
      } else if (cmd === 'fill') {
        const sel = rest[0];
        const val = rest.slice(1).join(' ');
        await page.fill(sel, val);
        console.log('filled');
      } else if (cmd === 'eval') {
        const result = await page.evaluate(rest.join(' '));
        console.log(JSON.stringify(result));
      } else if (cmd === 'title') {
        console.log(await page.title());
      } else if (cmd === 'quit' || cmd === 'exit') {
        await browser.close();
        process.exit(0);
      } else if (cmd) {
        console.log('Unknown command. Try: nav, ss, click, fill, eval, title, quit');
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
    rl.prompt();
  });
}

// Main
const [,, command, ...args] = process.argv;
if (command === 'smoke' || !command) {
  cmd_smoke().catch(e => { console.error(e); process.exit(1); });
} else if (command === 'screenshot') {
  cmd_screenshot(args[0] || '/', args[1]).catch(e => { console.error(e); process.exit(1); });
} else if (command === 'screenshot-route') {
  cmd_screenshot(args[0] || '/', args[1]).catch(e => { console.error(e); process.exit(1); });
} else if (command === 'repl') {
  cmd_repl().catch(e => { console.error(e); process.exit(1); });
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
