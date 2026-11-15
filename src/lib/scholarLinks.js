import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'scholar-links.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({}), 'utf-8');
  }
}

export function getScholarSocialLinks(scholarId) {
  try {
    ensureStore();
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    const all = JSON.parse(raw || '{}');
    return (
      all[scholarId] || {
        position: '',
        scientificActivity: '',
        linkedin: '',
        telegram: '',
        researchGate: '',
        wos: '',
        website: '',
        custom: [],
      }
    );
  } catch {
    return {
      position: '',
      scientificActivity: '',
      linkedin: '',
      telegram: '',
      researchGate: '',
      wos: '',
      website: '',
      custom: [],
    };
  }
}

export function saveScholarSocialLinks(scholarId, links) {
  ensureStore();
  const raw = fs.readFileSync(FILE_PATH, 'utf-8');
  const all = JSON.parse(raw || '{}');
  all[scholarId] = {
    position: String(links?.position || '').trim(),
    scientificActivity: String(links?.scientificActivity || '').trim(),
    linkedin: String(links?.linkedin || '').trim(),
    telegram: String(links?.telegram || '').trim(),
    researchGate: String(links?.researchGate || '').trim(),
    wos: String(links?.wos || '').trim(),
    website: String(links?.website || '').trim(),
    custom: Array.isArray(links?.custom)
      ? links.custom
          .filter((item) => item && (item.label || item.url))
          .map((item) => ({
            label: String(item.label || '').trim(),
            url: String(item.url || '').trim(),
          }))
      : [],
  };
  fs.writeFileSync(FILE_PATH, JSON.stringify(all, null, 2), 'utf-8');
  return all[scholarId];
}
