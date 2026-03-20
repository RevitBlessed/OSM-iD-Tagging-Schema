import { appData } from '../data/api.js';
import { translate } from '../i18n/translate.js';
import { renderPresetList } from './presets.js';

export function renderCategories() {
    const tree = document.getElementById('category-tree');
    tree.innerHTML = '';

    // Sort categories alphabetically by translated name or ID
    const catKeys = Object.keys(appData.categories).sort((a, b) => {
        const nameA = translate(`categories.${a}.name`, appData.categories[a].name || a);
        const nameB = translate(`categories.${b}.name`, appData.categories[b].name || b);
        return nameA.localeCompare(nameB);
    });

    const fragment = document.createDocumentFragment();
    catKeys.forEach(catId => {
        const cat = appData.categories[catId];
        const catName = translate(`categories.${catId}.name`, cat.name || catId);
        
        const li = document.createElement('li');
        li.textContent = catName;
        li.title = catId;

        li.addEventListener('click', () => {
            document.querySelectorAll('#category-tree li').forEach(el => el.classList.remove('selected'));
            li.classList.add('selected');
            renderPresetList(cat.members, catName, catId);
        });

        fragment.appendChild(li);
    });

    tree.appendChild(fragment);
}
