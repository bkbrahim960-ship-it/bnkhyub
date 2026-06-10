const fs = require('fs');
const path = require('path');

const DATA_DIR = __dirname;

function loadJSON(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function find(collection, filter = {}) {
  let data = loadJSON(`football.${collection}.json`);
  const keys = Object.keys(filter);
  if (keys.length > 0) {
    data = data.filter(item => keys.every(k => item[k] === filter[k]));
  }
  return data.map(d => ({ ...d, _id: d.id }));
}

function findOne(collection, filter) {
  const results = find(collection, filter);
  return results[0] || null;
}

module.exports = { find, findOne, loadJSON };
