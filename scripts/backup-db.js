const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const now = new Date();
const stamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupDir = path.join(rootDir, 'backups', stamp);

fs.mkdirSync(backupDir, { recursive: true });

const targets = [
  { src: path.join(rootDir, 'prisma', 'dev.db'), dest: path.join(backupDir, 'dev.db') },
  { src: path.join(rootDir, 'prisma', 'dev.db-wal'), dest: path.join(backupDir, 'dev.db-wal') },
  { src: path.join(rootDir, 'data', 'publication-feedback.json'), dest: path.join(backupDir, 'publication-feedback.json') },
];

let copied = 0;
for (const item of targets) {
  if (fs.existsSync(item.src)) {
    fs.copyFileSync(item.src, item.dest);
    copied += 1;
    console.log('Backed up:', path.basename(item.src));
  }
}

console.log(`Backup complete (${copied} files) -> ${backupDir}`);
