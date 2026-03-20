export const URL_PRESETS = 'https://raw.githubusercontent.com/openstreetmap/id-tagging-schema/main/dist/presets.json';
export const URL_FIELDS = 'https://raw.githubusercontent.com/openstreetmap/id-tagging-schema/main/dist/fields.json';
export const URL_CATEGORIES = 'https://raw.githubusercontent.com/openstreetmap/id-tagging-schema/main/dist/preset_categories.json';
export const URL_DEFAULTS = 'https://raw.githubusercontent.com/openstreetmap/id-tagging-schema/main/dist/preset_defaults.json';
export const URL_TRANSLATIONS_BASE = 'https://raw.githubusercontent.com/openstreetmap/id-tagging-schema/main/dist/translations/';

export let appData = {
    presets: {},
    fields: {},
    categories: {},
    defaults: {},
    translations: {}
};

export async function fetchSchemaData(currentLang) {
    const fetchPromises = [
        fetch(URL_PRESETS),
        fetch(URL_FIELDS),
        fetch(URL_CATEGORIES),
        fetch(URL_DEFAULTS)
    ];

    if (currentLang !== 'en') {
        fetchPromises.push(fetch(`${URL_TRANSLATIONS_BASE}${currentLang}.json`).catch(() => null));
    }

    const results = await Promise.all(fetchPromises);

    appData.presets = await results[0].json();
    appData.fields = await results[1].json();
    appData.categories = await results[2].json();
    appData.defaults = await results[3].json();

    if (currentLang !== 'en' && results[4] && results[4].ok) {
        const tr = await results[4].json();
        appData.translations[currentLang] = tr[currentLang] ? tr[currentLang].presets : {};
    } else {
        appData.translations[currentLang] = {};
    }
}

export async function fetchTranslation(lang) {
    try {
        const trRes = await fetch(`${URL_TRANSLATIONS_BASE}${lang}.json`);
        if (trRes.ok) {
            const tr = await trRes.json();
            appData.translations[lang] = tr[lang] ? tr[lang].presets : {};
        } else {
            appData.translations[lang] = {};
        }
    } catch(err) {
        appData.translations[lang] = {};
    }
}
