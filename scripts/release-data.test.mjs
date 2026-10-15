import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeReleases, fetchAllReleases, changedReleases, validateSnapshotUpdate } from './release-data.mjs';

const item = (tag = 'v1.2.0', body = '## Fixes\n- Keeps saved audio.') => ({
  tag_name: tag, body, html_url: `https://github.com/hellotaotao/typealoud/releases/tag/${tag}`,
  published_at: '2026-09-01T10:00:00Z', updated_at: '2026-09-02T10:00:00Z', draft: false, prerelease: false,
});

test('normalizes published versions, preserves exact source body and filters non-stable releases', () => {
  const source = item();
  const result = normalizeReleases([source, {...item('v1.3.0'), draft: true}, {...item('v2.0.0'), prerelease: true}]);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], {version:'v1.2.0', publishedAt:source.published_at, updatedAt:source.updated_at, url:source.html_url, body:source.body, notesStatus:'available'});
});
test('sorts by publication date with numeric version tie-break, not lexical order', () => {
  assert.deepEqual(normalizeReleases([item('v1.9.0'), item('v1.15.0')]).map(x => x.version), ['v1.15.0','v1.9.0']);
});
test('keeps legacy tags and marks empty/placeholder notes honestly', () => {
  const records = normalizeReleases([item('1.0.67'), item('v1.3.3','下载下方的 .dmg 安装。'), item('v1.3.4','下载对应平台的安装包。'),item('v1.3.5','')]);
  assert.equal(records.filter(x => x.notesStatus === 'missing').length, 3);
  assert.ok(records.some(x => x.version === '1.0.67'));
});
test('rejects malformed metadata and duplicate releases before writing content', () => {
  for (const bad of [{...item(), published_at: null}, {...item(), html_url:'javascript:alert(1)'}, item('not-a-release'), {...item(), body:123}]) {
    assert.throws(() => normalizeReleases([bad]));
  }
  assert.throws(() => normalizeReleases([item(), item()]));
});
test('paginates until empty and propagates an API failure rather than returning partial history', async () => {
  const urls = [];
  const mockFetch = async url => { urls.push(url); return {ok:true,json:async()=>urls.length === 1 ? [item()] : []}; };
  assert.equal((await fetchAllReleases({fetchImpl:mockFetch})).length,1);
  assert.match(urls[1], /page=2/);
  let count = 0;
  await assert.rejects(fetchAllReleases({fetchImpl:async()=> ++count === 1 ? {ok:true,json:async()=>[item()]} : {ok:false,status:503}}), /503/);
});
test('detects body edits even when a version already exists', () => {
  const before = normalizeReleases([item()]);
  const after = normalizeReleases([item('v1.2.0','## Fixes\n- Revised note.')]);
  assert.equal(changedReleases(before,after).length,1);
  assert.equal(changedReleases(before,before).length,0);
});
test('refuses accidental history loss and replacement of good notes by placeholders', () => {
  const before = normalizeReleases([item()]);
  assert.throws(() => validateSnapshotUpdate(before, []), /missing/i);
  assert.throws(() => validateSnapshotUpdate(before, normalizeReleases([item('v1.2.0','')])), /notes/i);
  assert.doesNotThrow(() => validateSnapshotUpdate(before,before));
});
