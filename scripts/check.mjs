import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { buildSite } from './build.mjs';

const root = await buildSite();
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) files.push(...(entry.isDirectory() ? await walk(join(directory, entry.name)) : [join(directory, entry.name)]));
  return files;
}

const htmlFiles = (await walk(root)).filter((file) => file.endsWith('.html'));
const errors = [];
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  for (const pattern of [/<title>[^<]+<\/title>/, /<meta name="description" content="[^"]+">/, /<h1[ >]/, /<main id="main">/]) {
    if (!pattern.test(html)) errors.push(`${file}: missing ${pattern}`);
  }
  const links = [...html.matchAll(/href="(\/[^"]*)"/g)].map((match) => match[1]).filter((href) => !href.startsWith('//'));
  for (const href of links) {
    const pathname = href.split('#')[0].split('?')[0];
    if (!pathname || pathname.startsWith('/api/')) continue;
    let target = join(root, pathname);
    const targetInfo = await stat(target).catch(() => null);
    if (targetInfo?.isDirectory() || !targetInfo) target = join(target, 'index.html');
    if (!(await stat(target).catch(() => null))) errors.push(`${file}: broken link ${href}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked ${htmlFiles.length} HTML pages: metadata, landmarks, and internal links are valid.`);
}
