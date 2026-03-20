import { appData } from '../data/api.js';

let currentLang = localStorage.getItem('appLang') || navigator.language.split('-')[0] || 'en';

export function getCurrentLang() {
    return currentLang;
}

export function setCurrentLang(lang) {
    currentLang = lang;
}

export function translate(path, fallback) {
    if (currentLang === 'en' || !appData.translations || !appData.translations[currentLang]) return fallback;
    const parts = path.split('.');
    let current = appData.translations[currentLang];
    for (const part of parts) {
        if (!current || typeof current !== 'object') return fallback;
        current = current[part];
    }
    return current !== undefined ? current : fallback;
}

export function resolveSubTranslates(str) {
    if (!str) return str;
    return str.replace(/\{([^}]+)\}/g, (match, fieldId) => {
        const fieldData = appData.fields[fieldId];
        const fallback = fieldData ? (fieldData.label || fieldData.name || fieldId) : fieldId;
        return translate(`fields.${fieldId}.label`, fallback);
    });
}
