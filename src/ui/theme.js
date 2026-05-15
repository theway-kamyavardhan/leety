import { byId } from '../utils.js';
import { state, save } from '../state.js';
import { renderAll } from '../dispatcher.js';

export function toggleTheme() {
  state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', state.settings.theme !== 'light');
  document.documentElement.classList.toggle('light', state.settings.theme === 'light');
  save();
  updateThemeButton();
  renderAll();
}

export function updateThemeButton() {
  const isLight = state.settings.theme === 'light';
  byId('themeToggle').innerHTML = `<i class="fa-solid ${isLight ? 'fa-sun' : 'fa-moon'} mr-2"></i><span>${isLight ? 'Light' : 'Dark'}</span>`;
}
