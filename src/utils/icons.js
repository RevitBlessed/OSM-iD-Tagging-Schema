const FALLBACK_ICON = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2024%2024%22%3E%3Ctext%20x%3D%2212%22%20y%3D%2220%22%20text-anchor%3D%22middle%22%20font-size%3D%2222%22%20fill%3D%22%23000%22%20font-family%3D%22Arial%2C%20sans-serif%22%3EiD%3C%2Ftext%3E%3C%2Fsvg%3E";

export function getIconUrl(icon) {
    if (!icon) return FALLBACK_ICON;
    if (icon.startsWith("maki-")) {
        return `https://unpkg.com/@mapbox/maki/icons/${icon.replace('maki-', '')}.svg`;
    }
    if (icon.startsWith("temaki-")) {
        return `https://cdn.jsdelivr.net/gh/ideditor/temaki@main/icons/${icon.replace('temaki-', '')}.svg`;
    }
    if (icon.startsWith("iD-")) {
        return `https://cdn.jsdelivr.net/gh/openstreetmap/iD@develop/svg/${icon}.svg`;
    }
    return FALLBACK_ICON;
}

export function createIconElement(icon, isLarge = false) {
    if (icon && icon.startsWith('fas-')) {
        const i = document.createElement('i');
        i.className = icon.replace("fas-", "fas fa-") + " preset-icon-fa" + (isLarge ? "-large" : "");
        i.title = 'Icon: ' + icon;
        return i;
    }

    const img = document.createElement('img');
    img.className = isLarge ? 'preset-icon-img-large' : 'preset-icon-img';

    img.alt = icon || 'icon';
    img.title = 'Icon: ' + (icon || 'fallback');

    const url = getIconUrl(icon);

    if (url === FALLBACK_ICON) {
        img.src = FALLBACK_ICON;
    } else {
        img.src = FALLBACK_ICON;
        const loader = new Image();
        loader.onload = function () {
            img.src = url;
        };
        loader.src = url;
        if (loader.complete) {
            img.src = url;
        }
    }

    return img;
}
