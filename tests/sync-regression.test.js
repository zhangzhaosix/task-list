const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert(
  /async function migrateLocalData\(\)/.test(html),
  'migrateLocalData should exist for old localStorage data'
);

const subscribeFirestore = html.match(/function subscribeFirestore\(\) \{[\s\S]*?\n  \}/);
assert(subscribeFirestore, 'subscribeFirestore should exist');

assert(
  /migrateLocalData\(\)/.test(subscribeFirestore[0]),
  'missing Firestore docs should migrate legacy local data'
);

assert(
  !/localStorage\.removeItem\('daily_tasks'\)/.test(subscribeFirestore[0]),
  'missing Firestore docs must not delete legacy local task data'
);
