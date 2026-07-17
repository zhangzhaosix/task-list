const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert(
  /async function migrateLocalData\([^)]*\)/.test(html),
  'migrateLocalData should exist for old localStorage data'
);

const subscribeFirestore = html.match(/function subscribeFirestore\(\) \{[\s\S]*?function migrateLocalData/);
assert(subscribeFirestore, 'subscribeFirestore should exist');

assert(
  /migrateLocalData\([^)]*\)/.test(subscribeFirestore[0]),
  'missing Firestore docs should migrate legacy local data'
);

assert(
  !/localStorage\.removeItem\('daily_tasks'\)/.test(subscribeFirestore[0]),
  'missing Firestore docs must not delete legacy local task data'
);

assert(
  /let firestoreSaveQueue = Promise\.resolve\(\);/.test(html),
  'Firestore writes should be serialized to prevent stale writes from winning'
);

assert(
  /function buildBackup\(data\)/.test(html)
    && /db\.runTransaction/.test(html)
    && /function hasRecoverableData\(data\)/.test(html)
    && /writeData\.backup = buildBackup\(nextData\)/.test(html),
  'each cloud write should preserve the latest valid server version as a backup'
);

assert(
  /enqueueFirestoreWrite\(uid, sessionId, payload, backupCurrent = true\)/.test(html)
    && /latestBackup\.mindsets,[\s\S]*\}, false\);/.test(html),
  'restoring a backup must not replace the safe backup with the bad current state'
);

assert(
  /id="restoreBackupBtn"/.test(html)
    && /async function restoreLatestBackup\(\)/.test(html)
    && /showConfirmDialog\([\s\S]*恢复备份/.test(html),
  'users should have a confirmed recovery path for the latest backup'
);

assert(
  /let syncSession = 0;/.test(html)
    && /syncSession !== sessionId/.test(html),
  'writes from a previous login session must be ignored'
);

assert(
  /transaction\.set\(docRef, writeData, \{ merge: true \}\)/.test(html),
  'partial saves should merge only the changed field into the user document'
);

assert(
  /saveToFirestore\(\['tasks'\]\)/.test(html)
    && /saveToFirestore\(\['plan'\]\)/.test(html)
    && /saveToFirestore\(\['mindsets'\]\)/.test(html),
  'tasks, plan, and mindsets should save independently'
);

assert(
  !/catch \{\s*tasks = \[\];/.test(html),
  'invalid Firestore task data must not silently replace tasks with an empty array'
);

assert(
  /subscribeFirestore\(\)\.then\(ready =>/.test(html)
    && /if \(ready && user && user\.uid === u\.uid && syncSession === sessionId\)/.test(html),
  'editing listeners should wait until the initial Firestore snapshot is ready'
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
