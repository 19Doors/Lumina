import fg from 'fast-glob';

async function searchFiles(baseDir, query, depth = 3) {
  // The 'deep' option controls the maximum directory depth.
  const pattern = `**/*${query}*`;
  const entriesDir = await fg(pattern, { onlyDirectories:true, cwd: baseDir, deep: depth });
  const entriesFiles = await fg(pattern, { onlyFiles:true, cwd: baseDir, deep: depth });
  return [entriesFiles, entriesDir]
}

export default searchFiles;
