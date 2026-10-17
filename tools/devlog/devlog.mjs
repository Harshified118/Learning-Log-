#!/usr/bin/env node
/**
 * DevLog CLI (JavaScript ESM edition)
 * A lightweight command-line tool to record and view daily learning logs.
 * Compatible with Node.js 20+ using built-in standard library modules only.
 */

import { existsSync } from 'node:fs';
import { appendFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import process from 'node:process';

// Compute the directory of this ESM module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default file where logs are stored (same directory as this script)
const DEFAULT_LOG_PATH = resolve(__dirname, 'LOG.md');

/**
 * Formats a log entry into Markdown with a date header, tags, and content.
 * Matches the format produced by devlog.py for seamless interoperability.
 *
 * @param {string} entryDate - ISO date string (YYYY-MM-DD)
 * @param {string} message - Content of the log entry
 * @param {string[]} tags - Array of tag names
 * @returns {string} Formatted markdown block
 */
function formatEntry(entryDate, message, tags = []) {
  const cleanedTags = tags
    .filter((t) => typeof t === 'string' && t.trim().length > 0)
    .map((t) => `#${t.replace(/^#+/, '').toLowerCase()}`);

  const tagStr = cleanedTags.length > 0 ? cleanedTags.join(' ') : '#general';
  return `## ${entryDate} | ${tagStr}\n${message.trim()}\n\n---\n\n`;
}

/**
 * Appends a new learning log entry to LOG.md.
 */
async function handleAdd(subArgs, globalFile) {
  const { values, positionals } = parseArgs({
    args: subArgs,
    options: {
      tag: {
        type: 'string',
        short: 't',
        multiple: true,
        default: [],
      },
    },
    allowPositionals: true,
    strict: true,
  });

  const message = positionals.join(' ').trim();
  if (!message) {
    console.error('Error: Log message cannot be empty.');
    console.error('Usage: node devlog.mjs add "<message>" [-t <tag>]');
    return 1;
  }

  const logPath = resolve(globalFile || DEFAULT_LOG_PATH);
  const todayStr = new Date().toISOString().slice(0, 10);
  const entryText = formatEntry(todayStr, message, values.tag);

  try {
    // Ensure parent directory exists
    await mkdir(dirname(logPath), { recursive: true });
    // Append entry using UTF-8 encoding
    await appendFile(logPath, entryText, { encoding: 'utf8' });

    console.log(`Log entry saved to ${logPath} for ${todayStr}`);
    return 0;
  } catch (err) {
    console.error(`File system error writing to '${logPath}':`, err.message);
    return 1;
  }
}

/**
 * Displays recent log entries from LOG.md.
 */
async function handleList(subArgs, globalFile) {
  const { values } = parseArgs({
    args: subArgs,
    options: {
      limit: {
        type: 'string',
        short: 'n',
        default: '5',
      },
    },
    strict: true,
  });

  const limitNum = parseInt(values.limit, 10) || 5;
  const logPath = resolve(globalFile || DEFAULT_LOG_PATH);

  if (!existsSync(logPath)) {
    console.log(`No log file found at '${logPath}'. Use 'add' to create your first entry.`);
    return 0;
  }

  try {
    const content = (await readFile(logPath, { encoding: 'utf8' })).trim();
    if (!content) {
      console.log(`Log file '${logPath}' is currently empty.`);
      return 0;
    }

    // Split on the '---' markdown divider
    const rawEntries = content
      .split('---')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const selectedEntries = rawEntries.slice(-limitNum);

    console.log(`\n--- DevLog Entries (${selectedEntries.length} shown) ---\n`);
    for (const entry of selectedEntries) {
      console.log(entry);
      console.log('\n' + '-'.repeat(40) + '\n');
    }

    return 0;
  } catch (err) {
    console.error(`File system error reading '${logPath}':`, err.message);
    return 1;
  }
}

/**
 * Prints usage guidance.
 */
function printHelp() {
  console.log(`
DevLog CLI (JavaScript ESM edition)
Track daily learning entries in Markdown format.

Usage:
  node devlog.mjs <command> [options] [arguments]

Commands:
  add <message>       Append a new learning entry
                      Options:
                        -t, --tag <name>   Category tag (can be repeated)

  list                View recent learning entries
                      Options:
                        -n, --limit <num>  Number of recent entries to show (default: 5)

Global Options:
  -f, --file <path>   Custom path to log file (default: LOG.md in tool directory)
  -h, --help          Show this help message

Examples:
  node devlog.mjs add "Learned node:util.parseArgs" -t js -t cli
  node devlog.mjs list -n 3
`);
}

async function main() {
  const rawArgs = process.argv.slice(2);

  if (rawArgs.length === 0 || rawArgs.includes('-h') || rawArgs.includes('--help')) {
    printHelp();
    return 0;
  }

  // Check for custom file flag (-f / --file) in global args
  let customFile = null;
  const filteredArgs = [];
  for (let i = 0; i < rawArgs.length; i++) {
    if (rawArgs[i] === '-f' || rawArgs[i] === '--file') {
      customFile = rawArgs[++i];
    } else if (rawArgs[i].startsWith('--file=')) {
      customFile = rawArgs[i].slice(7);
    } else {
      filteredArgs.push(rawArgs[i]);
    }
  }

  const [command, ...subArgs] = filteredArgs;

  switch (command) {
    case 'add':
      return await handleAdd(subArgs, customFile);
    case 'list':
      return await handleList(subArgs, customFile);
    default:
      console.error(`Unknown command: '${command}'. Available commands: 'add', 'list'.`);
      printHelp();
      return 1;
  }
}

main().then((code) => {
  if (code !== 0) {
    process.exit(code);
  }
});
