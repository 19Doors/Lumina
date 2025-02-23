import fg from 'fast-glob';

async function searchFiles(baseDir, query, depth = 5) {
  const pattern = `**/*${query}*`;
  const entriesDir = await fg(pattern, { caseSensitiveMatch: false, onlyDirectories:true, cwd: baseDir, deep: depth });
  const entriesFiles = await fg(pattern, { caseSensitiveMatch: false, onlyFiles:true, cwd: baseDir, deep: depth });
  return [entriesFiles, entriesDir]
}

export default searchFiles;
