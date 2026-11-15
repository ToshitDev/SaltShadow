import { mountProveIt } from './prove-it.js';

const loading = document.querySelector('#loading');
try {
  const response = await fetch(new URL('./data/case_study.json', import.meta.url));
  if (!response.ok) throw new Error(`Case file returned HTTP ${response.status}.`);
  mountProveIt(document, await response.json());
  loading.hidden = true;
  document.querySelector('#workspace').hidden = false;
} catch (error) {
  loading.classList.add('error');
  loading.textContent = `The case could not be loaded. ${error.message} Serve this folder over HTTP; see README.md.`;
  const retry = document.createElement('button');
  retry.className = 'secondary retry'; retry.textContent = 'Retry loading case';
  retry.addEventListener('click', () => location.reload()); loading.append(retry);
}
