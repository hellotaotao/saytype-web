export const repository = 'hellotaotao/typealoud';
const releaseBase = `https://github.com/${repository}/releases/tag/`;
const placeholder = /^(?:下载下方的\s*\.dmg\s*安装。?|下载对应平台的安装包。?|Download the installer for your platform\.?)$/i;

export function normalizeReleases(records) {
  if (!Array.isArray(records)) throw new Error('GitHub releases response must be an array');
  const seen = new Set();
  return records.filter(record => !record.draft && !record.prerelease).map(record => {
    const version = record.tag_name;
    if (typeof version !== 'string' || !/^v?\d+\.\d+\.\d+$/.test(version)) throw new Error(`Invalid release version: ${version}`);
    if (seen.has(version)) throw new Error(`Duplicate release: ${version}`);
    seen.add(version);
    for (const name of ['published_at', 'updated_at']) {
      if (typeof record[name] !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(record[name]) || !Number.isFinite(Date.parse(record[name]))) {
        throw new Error(`Invalid ${name} for ${version}`);
      }
    }
    if (record.html_url !== `${releaseBase}${version}`) throw new Error(`Unexpected release URL for ${version}`);
    if (record.body != null && typeof record.body !== 'string') throw new Error(`Invalid notes for ${version}`);
    const body = record.body ?? '';
    return { version, publishedAt: record.published_at, updatedAt: record.updated_at, url: record.html_url, body,
      notesStatus: !body.trim() || placeholder.test(body.trim()) ? 'missing' : 'available' };
  }).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || b.version.localeCompare(a.version, 'en', {numeric:true}));
}

export async function fetchAllReleases({fetchImpl = fetch, token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN} = {}) {
  const releases = [];
  for (let page = 1; page <= 100; page++) {
    const response = await fetchImpl(`https://api.github.com/repos/${repository}/releases?per_page=100&page=${page}`, {
      headers: { Accept:'application/vnd.github+json', 'X-GitHub-Api-Version':'2022-11-28', ...(token ? {Authorization:`Bearer ${token}`} : {}) },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`GitHub releases HTTP ${response.status}; existing snapshot left unchanged`);
    const records = await response.json();
    if (!Array.isArray(records)) throw new Error('Invalid GitHub releases response');
    if (records.length === 0) return releases;
    releases.push(...records);
  }
  throw new Error('Release pagination exceeded 100 pages; refusing a partial snapshot');
}

export function changedReleases(before, after) {
  const previous = new Map(before.map(record => [record.version, record]));
  return after.filter(record => JSON.stringify(record) !== JSON.stringify(previous.get(record.version)));
}

export function validateSnapshotUpdate(before, after) {
  const current = new Map(after.map(record => [record.version,record]));
  for (const record of before) {
    const next = current.get(record.version);
    if (!next) throw new Error(`Previously published release ${record.version} is missing; review removal manually`);
    if (record.notesStatus === 'available' && next.notesStatus !== 'available') throw new Error(`Published notes regressed for ${record.version}; keeping the previous snapshot`);
  }
}
