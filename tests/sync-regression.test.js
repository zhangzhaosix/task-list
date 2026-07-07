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

const setupPlanListeners = html.match(/function setupPlanListeners\(\) \{[\s\S]*?\n  \}/);
assert(setupPlanListeners, 'setupPlanListeners should exist');

assert(
  /let isPlanComposing = false;/.test(html),
  'plan textarea should track IME composition state'
);

assert(
  /addEventListener\('compositionstart'/.test(setupPlanListeners[0])
    && /addEventListener\('compositionend'/.test(setupPlanListeners[0]),
  'plan textarea should listen for IME composition start/end'
);

assert(
  /e\.isComposing \|\| isPlanComposing/.test(setupPlanListeners[0]),
  'plan input handler should skip autosave while IME composition is active'
);

assert(
  /addEventListener\('blur'/.test(setupPlanListeners[0]),
  'plan textarea should flush confirmed edits on blur'
);

assert(
  /document\.activeElement !== planText/.test(html) && /!isPlanComposing/.test(html),
  'Firestore plan snapshot should not rewrite the textarea while it is focused or composing'
);

const autoResize = html.match(/function autoResize\(el\) \{[\s\S]*?\n  \}/);
assert(autoResize, 'autoResize should exist');

assert(
  /const scrollTop = el\.scrollTop;/.test(autoResize[0]) && /el\.scrollTop = scrollTop;/.test(autoResize[0]),
  'autoResize should preserve textarea scroll position'
);
