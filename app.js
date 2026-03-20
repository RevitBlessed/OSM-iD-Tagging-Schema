import { fetchSchemaData, fetchTranslation, appData } from './src/data/api.js';
import { getCurrentLang, setCurrentLang } from './src/i18n/translate.js';
import { renderCategories } from './src/ui/categories.js';
import { handleFilterInput, toggleAllPresets, filterAndRenderPresets } from './src/ui/presets.js';
import { renderPresetDetails } from './src/ui/details.js';

async function initializeApp() {
    try {
        await fetchSchemaData(getCurrentLang());

        const langSelect = document.getElementById('lang-select');
        if (langSelect) {
            langSelect.value = getCurrentLang();
            langSelect.addEventListener('change', async (e) => {
                const newLang = e.target.value;
                localStorage.setItem('appLang', newLang);
                setCurrentLang(newLang);
                
                if (newLang !== 'en' && !appData.translations[newLang]) {
                    document.getElementById('loading').classList.remove('hidden');
                    await fetchTranslation(newLang);
                    document.getElementById('loading').classList.add('hidden');
                }
                
                renderCategories();
                const filterInput = document.getElementById('preset-filter');
                filterAndRenderPresets(filterInput ? filterInput.value.toLowerCase() : '');
                
                if (window.currentPresetId) {
                    renderPresetDetails(window.currentPresetId);
                }
            });
        }

        document.getElementById('loading').classList.add('hidden');
        renderCategories();

        const filterInput = document.getElementById('preset-filter');
        const clearBtn = document.getElementById('clear-search');

        filterInput.disabled = false;
        filterInput.addEventListener('input', handleFilterInput);

        clearBtn.addEventListener('click', () => {
            filterInput.value = '';
            clearBtn.style.display = 'none';
            filterAndRenderPresets('');
        });

        const toggleBtn = document.getElementById('toggle-all-presets');
        toggleBtn.addEventListener('click', () => {
            const currentFilter = filterInput.value.toLowerCase();
            toggleAllPresets(currentFilter);
        });

    } catch (err) {
        document.getElementById('loading').textContent = 'Error loading data: ' + err.message;
        console.error(err);
    }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', initializeApp);
