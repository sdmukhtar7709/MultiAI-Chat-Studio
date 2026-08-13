import test from 'node:test';
import assert from 'node:assert/strict';

const loadAssistant = async () => {
  const mod = await import('./googleai.js');
  return mod.Assistant;
};

test('google assistant can be imported without a browser API key', async () => {
  const Assistant = await loadAssistant();
  assert.doesNotThrow(() => new Assistant('gemini-2.0-flash'));
});
