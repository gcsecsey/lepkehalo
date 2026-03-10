#!/usr/bin/env node

/**
 * Seed the app's AsyncStorage with dummy book data for UI testing.
 *
 * Usage:
 *   node scripts/seed-books.mjs android   # seed Android emulator
 *   node scripts/seed-books.mjs ios       # seed iOS simulator
 *   node scripts/seed-books.mjs --clear android  # clear all books
 *
 * The app will be force-restarted after seeding.
 */

import { execSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const APP_ID = "hu.lepkehalo.app";
const STORAGE_KEY = "books";
const BOOK_COUNT = 100;

// --- Book data generation ---

const AUTHORS = [
  "Márai Sándor", "Móricz Zsigmond", "Jókai Mór", "Mikszáth Kálmán",
  "Kosztolányi Dezső", "Szabó Magda", "Gárdonyi Géza", "Ady Endre",
  "Babits Mihály", "Radnóti Miklós", "József Attila", "Arany János",
  "Petőfi Sándor", "Molnár Ferenc", "Krúdy Gyula", "Örkény István",
  "Karinthy Frigyes", "Nádas Péter", "Esterházy Péter", "Kertész Imre",
  "Dragomán György", "Spiró György", "Závada Pál", "Térey János",
  "Parti Nagy Lajos", "Lackfi János", "Grecsó Krisztián", "Tóth Krisztina",
  "Háy János", "Barnás Ferenc",
];

const TITLES = [
  "A gyertyák csonkig égnek", "Légy jó mindhalálig", "Az arany ember",
  "Szent Péter esernyője", "Édes Anna", "Az ajtó", "Egri csillagok",
  "Vér és arany", "Jónás könyve", "Bori notesz",
  "Nincsen apám, se anyám", "Toldi", "János vitéz",
  "A Pál utcai fiúk", "Szindbád ifjúsága", "Tóték", "Így írtok ti",
  "Emlékiratok könyve", "Harmonia caelestis", "Sorstalanság",
  "A fehér király", "Az ikszek", "Jadviga párnája", "Átkelés",
  "Grafitnesz", "Miért hagytsatisfied itt", "Mellettem elférsz",
  "Porhó", "A gyerek", "Az ellenállás melankóliája",
  "Abigél", "A láthatatlan ember", "Fekete gyémántok",
  "Két krajcáros posta", "Pacsirta", "Aranysárkány",
  "Iskola a határon", "Rozsdatemető", "A pendragon legenda",
  "Utas és holdvilág", "Esti Kornél", "A Dunánál",
  "Szeptember végén", "A walesi bárdok", "Előhang",
  "Egyperces novellák", "Utazás a koponyám körül",
  "Párhuzamos történetek", "Javított kiadás", "A kudarc",
  "Máglya", "Fogság", "Természetes fény", "Asztalizene",
  "A test angyala", "Minden megvan", "Hajnali háztetők",
  "Az ellopott ló", "Szegény Dzsoni és Árnika",
  "A kőszívű ember fiai", "Egy magyar nábob", "Kárpáthy Zoltán",
  "A beszélő köntös", "A vén gazember", "Nosztradamusz",
  "Beszterce ostroma", "A Noszty fiú esete Tóth Marival",
  "Különös házasság", "A két koldusdiák", "Nosztalgia",
  "A bor", "Pillangó", "Tündérkert", "Erdély", "A fáklya",
  "Sárarany", "Rokonok", "Úri muri", "Barbárok", "Árvácska",
  "Szindbád megtérése", "A vörös postakocsi",
  "Boldogult úrfikoromban", "Francia kastély", "Napraforgó",
  "Álmok álmodója", "Boldogság",
  "Az utolsó szivar az Arabs Szürkénél", "Próza",
  "A régiséggyűjtő", "Csáth Géza összegyűjtött novellái",
  "Ópium", "A varázsló kertje", "Mesék az írógépről",
  "Hajnali részegség", "A szegény kisgyermek panaszai",
  "Nero, a véres költő", "Bácska", "Puszták népe", "Prae",
];

function generateBooks(count) {
  const books = [];
  const seen = {};

  for (let i = 0; i < count; i++) {
    let title = TITLES[i % TITLES.length];
    if (seen[title] != null) {
      seen[title]++;
      title = `${title} (${seen[title]})`;
    } else {
      seen[title] = 0;
    }

    const isbn = `978963${String(Math.floor(1000000 + Math.random() * 9000000))}`;
    books.push({
      id: String(10000 + i),
      title,
      author: AUTHORS[i % AUTHORS.length],
      thumbnailUrl: `https://moly.hu/system/covers/big/covers_${10000 + i}.jpg`,
      isbn,
      addedAt: 1709000000000 - i * 86400000,
    });
  }
  return books;
}

// --- Platform injection ---

function run(cmd) {
  return execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
}

function seedAndroid(books) {
  const devices = run("adb devices");
  if (!devices.includes("emulator")) {
    console.error("No Android emulator found. Start one first.");
    process.exit(1);
  }

  const tmpFile = join(tmpdir(), "seed_books.json");
  writeFileSync(tmpFile, JSON.stringify(books));

  run(`adb push ${tmpFile} /data/local/tmp/seed_books.json`);
  run(
    `adb shell "BOOKS=\\$(cat /data/local/tmp/seed_books.json); run-as ${APP_ID} sqlite3 databases/RKStorage \\"DELETE FROM catalystLocalStorage WHERE key='${STORAGE_KEY}';\\""`
  );
  run(
    `adb shell "BOOKS=\\$(cat /data/local/tmp/seed_books.json); run-as ${APP_ID} sqlite3 databases/RKStorage \\"INSERT INTO catalystLocalStorage (key, value) VALUES ('${STORAGE_KEY}', '\\$BOOKS');\\""`
  );
  run(`adb shell "am force-stop ${APP_ID} && am start -n ${APP_ID}/.MainActivity"`);
  run("adb shell rm /data/local/tmp/seed_books.json");

  unlinkSync(tmpFile);
  console.log(`Seeded ${books.length} books on Android emulator.`);
}

function seedIos(books) {
  // Find the booted simulator
  let booted;
  try {
    const simJson = run("xcrun simctl list devices booted -j");
    const simData = JSON.parse(simJson);
    for (const runtime of Object.values(simData.devices)) {
      for (const device of runtime) {
        if (device.state === "Booted") {
          booted = device;
          break;
        }
      }
      if (booted) break;
    }
  } catch {
    // ignore parse errors
  }

  if (!booted) {
    console.error("No booted iOS simulator found. Start one first.");
    process.exit(1);
  }

  console.log(`Found simulator: ${booted.name} (${booted.udid})`);

  // Find the AsyncStorage database in the simulator's app data
  const appDataRoot = join(
    process.env.HOME,
    "Library/Developer/CoreSimulator/Devices",
    booted.udid,
    "data/Containers/Data/Application"
  );

  let dbPath;
  try {
    // Search for the RKStorage database
    dbPath = run(
      `find "${appDataRoot}" -name RKStorage -path "*/Documents/RKStorage" 2>/dev/null | head -1`
    );
  } catch {
    // ignore
  }

  if (!dbPath) {
    console.error(
      "Could not find AsyncStorage database. Make sure the app has been launched at least once on the simulator."
    );
    process.exit(1);
  }

  const json = JSON.stringify(books).replace(/'/g, "''");
  run(
    `sqlite3 "${dbPath}" "DELETE FROM catalystLocalStorage WHERE key='${STORAGE_KEY}';"`
  );
  run(
    `sqlite3 "${dbPath}" "INSERT INTO catalystLocalStorage (key, value) VALUES ('${STORAGE_KEY}', '${json}');"`
  );

  // Restart the app on the simulator
  run(`xcrun simctl terminate ${booted.udid} ${APP_ID} 2>/dev/null || true`);
  run(`xcrun simctl launch ${booted.udid} ${APP_ID}`);

  console.log(`Seeded ${books.length} books on iOS simulator (${booted.name}).`);
}

function clearAndroid() {
  run(
    `adb shell "run-as ${APP_ID} sqlite3 databases/RKStorage \\"DELETE FROM catalystLocalStorage WHERE key='${STORAGE_KEY}';\\""`
  );
  run(`adb shell "am force-stop ${APP_ID} && am start -n ${APP_ID}/.MainActivity"`);
  console.log("Cleared books on Android emulator.");
}

function clearIos() {
  // Reuse the same simulator discovery logic
  let booted;
  try {
    const simJson = run("xcrun simctl list devices booted -j");
    const simData = JSON.parse(simJson);
    for (const runtime of Object.values(simData.devices)) {
      for (const device of runtime) {
        if (device.state === "Booted") {
          booted = device;
          break;
        }
      }
      if (booted) break;
    }
  } catch {
    // ignore
  }

  if (!booted) {
    console.error("No booted iOS simulator found.");
    process.exit(1);
  }

  const appDataRoot = join(
    process.env.HOME,
    "Library/Developer/CoreSimulator/Devices",
    booted.udid,
    "data/Containers/Data/Application"
  );

  let dbPath;
  try {
    dbPath = run(
      `find "${appDataRoot}" -name RKStorage -path "*/Documents/RKStorage" 2>/dev/null | head -1`
    );
  } catch {
    // ignore
  }

  if (!dbPath) {
    console.error("Could not find AsyncStorage database.");
    process.exit(1);
  }

  run(
    `sqlite3 "${dbPath}" "DELETE FROM catalystLocalStorage WHERE key='${STORAGE_KEY}';"`
  );
  run(`xcrun simctl terminate ${booted.udid} ${APP_ID} 2>/dev/null || true`);
  run(`xcrun simctl launch ${booted.udid} ${APP_ID}`);
  console.log(`Cleared books on iOS simulator (${booted.name}).`);
}

// --- Auto-detection ---

function hasAndroidEmulator() {
  try {
    return run("adb devices").includes("emulator");
  } catch {
    return false;
  }
}

function hasIosSimulator() {
  try {
    const simJson = run("xcrun simctl list devices booted -j");
    const simData = JSON.parse(simJson);
    for (const runtime of Object.values(simData.devices)) {
      for (const device of runtime) {
        if (device.state === "Booted") return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
}

function detectPlatforms() {
  const platforms = [];
  if (hasAndroidEmulator()) platforms.push("android");
  if (hasIosSimulator()) platforms.push("ios");
  return platforms;
}

// --- CLI ---

const args = process.argv.slice(2);
const clear = args.includes("--clear");
const platform = args.find((a) => !a.startsWith("-"));

let targets;

if (platform) {
  if (!["android", "ios"].includes(platform)) {
    console.log("Usage: node scripts/seed-books.mjs [--clear] [android|ios]");
    process.exit(1);
  }
  targets = [platform];
} else {
  targets = detectPlatforms();
  if (targets.length === 0) {
    console.error("No running emulator or simulator found. Start one first.");
    process.exit(1);
  }
}

for (const target of targets) {
  if (clear) {
    if (target === "android") clearAndroid();
    else clearIos();
  } else {
    const books = generateBooks(BOOK_COUNT);
    if (target === "android") seedAndroid(books);
    else seedIos(books);
  }
}
