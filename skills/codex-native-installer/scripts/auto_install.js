const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const CODEX_STORE_URL =
  process.env.CODEX_STORE_URL ||
  'https://apps.microsoft.com/detail/9plm9xgg6vks?hl=en-us&gl=US&ocid=pdpshare';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function findBrowser() {
  for (const executablePath of [EDGE_PATH, CHROME_PATH]) {
    if (fs.existsSync(executablePath)) {
      return executablePath;
    }
  }

  throw new Error('Microsoft Edge or Google Chrome was not found in the default install paths.');
}

function parseSizeToBytes(sizeText) {
  const match = String(sizeText).match(/^([\d.]+)\s*([KMGT]?B)/i);
  if (!match) {
    return 0;
  }

  const value = Number.parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const multipliers = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };

  return value * (multipliers[unit] || 1);
}

function renderProgress(downloadedBytes, totalBytes) {
  const downloadedMB = (downloadedBytes / (1024 * 1024)).toFixed(2);

  if (!totalBytes) {
    process.stdout.write(`\rDownloaded ${downloadedMB} MB`);
    return;
  }

  const percent = ((downloadedBytes / totalBytes) * 100).toFixed(2);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
  const barLength = 30;
  const filledLength = Math.round((downloadedBytes / totalBytes) * barLength);
  const bar = '#'.repeat(filledLength) + '-'.repeat(barLength - filledLength);

  process.stdout.write(`\r[${bar}] ${percent}% | ${downloadedMB}MB / ${totalMB}MB`);
}

function downloadFile(urlText, savePath) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlText);
    const client = url.protocol === 'https:' ? https : http;
    const request = client.get(
      urlText,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        },
      },
      (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          downloadFile(response.headers.location, savePath).then(resolve, reject);
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`Download failed with HTTP status ${response.statusCode}`));
          return;
        }

        const totalBytes = Number.parseInt(response.headers['content-length'], 10) || 0;
        let downloadedBytes = 0;
        const fileStream = fs.createWriteStream(savePath);

        response.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          renderProgress(downloadedBytes, totalBytes);
        });

        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(() => {
            process.stdout.write('\n');
            resolve();
          });
        });

        fileStream.on('error', reject);
      },
    );

    request.on('error', reject);
  });
}

function installPackage(packagePath) {
  execFileSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      `Add-AppxPackage -Path '${packagePath.replace(/'/g, "''")}' -ForceUpdateFromAnyVersion`,
    ],
    { stdio: 'inherit' },
  );
}

async function extractPackageLinks(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#selectBoxInfo table tr'));

    return rows
      .map((row) => {
        const anchor = row.querySelector('a');
        if (!anchor) {
          return null;
        }

        const cells = row.querySelectorAll('td');
        const size = cells.length > 2 ? cells[cells.length - 1].innerText : '';

        return {
          name: anchor.innerText,
          href: anchor.href,
          size,
        };
      })
      .filter(Boolean);
  });
}

function selectCodexPackage(links) {
  let selected = null;
  let selectedSize = 0;

  for (const link of links) {
    const name = link.name.toLowerCase();
    const isCodexPackage =
      name.includes('codex') && (name.endsWith('.msixbundle') || name.endsWith('.msix'));

    if (!isCodexPackage) {
      continue;
    }

    const size = parseSizeToBytes(link.size);
    if (size > selectedSize) {
      selected = link;
      selectedSize = size;
    }
  }

  return selected;
}

async function main() {
  console.log('==================================================');
  console.log(' Codex Native Package Downloader and Installer');
  console.log('==================================================');
  console.log('Opening a browser. Complete any Cloudflare verification if prompted.');
  console.log(`Target Microsoft Store URL: ${CODEX_STORE_URL}`);
  console.log('--------------------------------------------------');

  const executablePath = findBrowser();
  const browser = await puppeteer.launch({
    executablePath,
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
  });

  let links;

  try {
    const [page] = await browser.pages();
    await page.goto('https://store.rg-adguard.net/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    await page.type('#url', CODEX_STORE_URL);
    await page.click('input[type="button"][onclick="sumbit()"]');
    await page.waitForSelector('#selectBoxInfo table', { timeout: 120000 });
    links = await extractPackageLinks(page);
  } finally {
    await browser.close();
  }

  const target = selectCodexPackage(links);

  if (!target) {
    console.error('No matching Codex .msixbundle or .msix package was found.');
    console.error('Available links:');
    for (const link of links) {
      console.error(`- ${link.name} (${link.size})`);
    }
    process.exit(1);
  }

  console.log(`Selected package: ${target.name}`);
  console.log(`Package size: ${target.size}`);

  const extension = target.name.toLowerCase().endsWith('.msixbundle') ? '.msixbundle' : '.msix';
  const packagePath = path.join(__dirname, `codex_setup${extension}`);

  console.log('Downloading package...');
  await downloadFile(target.href, packagePath);

  console.log('Installing package with Add-AppxPackage...');
  try {
    installPackage(packagePath);
    fs.unlinkSync(packagePath);
    console.log('Codex was installed successfully.');
  } catch (error) {
    console.error('Installation failed.');
    console.error(error.message);
    console.error(`The downloaded package was kept for troubleshooting: ${packagePath}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

