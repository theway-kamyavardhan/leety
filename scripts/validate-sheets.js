const fs = require('fs');

const payload = JSON.parse(fs.readFileSync('data/sheets.json', 'utf8'));
const problems = payload.problems || [];
const counts = problems.reduce((acc, problem) => {
  acc[problem.sheet] = (acc[problem.sheet] || 0) + 1;
  return acc;
}, {});

const duplicateKeys = problems
  .map(problem => `${problem.sheet}|${String(problem.name).toLowerCase().replace(/[^a-z0-9]/g, '')}`)
  .filter((key, index, keys) => keys.indexOf(key) !== index);

if (duplicateKeys.length) {
  console.error(`Duplicate sheet entries found: ${[...new Set(duplicateKeys)].join(', ')}`);
  process.exit(1);
}

if ((counts['NeetCode 150'] || 0) !== 150) {
  console.error(`NeetCode 150 should contain 150 problems, found ${counts['NeetCode 150'] || 0}.`);
  process.exit(1);
}

if ((counts['Striver SDE Sheet'] || 0) < 60) {
  console.error(`Striver SDE Sheet has too few entries, found ${counts['Striver SDE Sheet'] || 0}.`);
  process.exit(1);
}

console.log(`Sheet data ok: ${problems.length} total, NeetCode=${counts['NeetCode 150']}, Striver=${counts['Striver SDE Sheet']}.`);
