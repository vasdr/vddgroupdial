import './style.css';

export interface Group {
    id: string;
    title: string;
    order: number;
    columns?: number;
    rows?: number;
    layoutType?: 'dynamic' | 'list' | 'grid';
    dynamicWidth?: number;
    dynamicHeight?: number;
    listDirection?: 'horizontal' | 'vertical';
    listWidth?: number;
    gridFill?: boolean;
    gridCenterSlides?: boolean;
    gridAspectWidth?: number;
    gridAspectHeight?: number;
    // --- Fase V15 --- //
    groupIcon?: string;    // Emoji o clase, ej: '⭐'
    textColor?: string;    // Hex color, ej: '#FFFFFF'
    bgType?: 'none' | 'solid' | 'gradient' | 'image' | 'url';
    bgGradientType?: 'linear' | 'radial-ellipse' | 'radial-circle';
    bgColor1?: string;
    bgColor2?: string;
    bgValue?: string;      // para imgs/urls
    bgOnlyTitle?: boolean;
    gapSize?: number;

    openInNewWindow?: boolean;
    openInNewTab?: boolean;
    isDefault?: boolean;
    isLocked?: boolean;
    password?: string;
}

export interface Dial {
    id: string;
    groupId: string;
    title: string;
    url: string;
    order: number;
}

export const StorageArea = chrome.storage.local;

// GROUPS
export async function getGroups(): Promise<Group[]> {
    const result = await StorageArea.get({ groups: [] }) as { groups: Group[] };
    let groups = result.groups;

    // Crear un grupo por defecto si no existe ninguno
    if (groups.length === 0) {
        const defaultGroup: Group = {
            id: 'default-group-home',
            title: 'Inicio',
            order: 0
        };
        groups = [defaultGroup];
        await saveGroups(groups);
    }

    return groups.sort((a, b) => a.order - b.order);
}

export async function saveGroups(groups: Group[]): Promise<void> {
    await StorageArea.set({ groups });
}

export async function addGroup(title: string): Promise<Group> {
    const groups = await getGroups();
    const newGroup: Group = {
        id: crypto.randomUUID(),
        title,
        order: groups.length
    };
    groups.push(newGroup);
    await saveGroups(groups);
    return newGroup;
}

export async function updateGroup(id: string, updates: Partial<Group>): Promise<void> {
    const groups = await getGroups();
    const index = groups.findIndex(g => g.id === id);
    if (index > -1) {
        groups[index] = { ...groups[index], ...updates };
        await saveGroups(groups);
    }
}

export async function removeGroup(id: string): Promise<void> {
    const groups = await getGroups();
    const filtered = groups.filter(g => g.id !== id);
    filtered.forEach((g, i) => g.order = i); // re-order
    await saveGroups(filtered);

    // Borrado en cascada de los dials pertenecientes a ese grupo
    const allDials = await getAllDials();
    const remainingDials = allDials.filter(d => d.groupId !== id);
    await saveDials(remainingDials);
}

// DIALS
export async function getAllDials(): Promise<Dial[]> {
    const result = await StorageArea.get({ dials: [] }) as { dials: Dial[] };
    return result.dials;
}

export async function getDialsByGroup(groupId: string): Promise<Dial[]> {
    const allDials = await getAllDials();
    return allDials.filter(d => d.groupId === groupId).sort((a, b) => a.order - b.order);
}

export async function saveDials(dials: Dial[]): Promise<void> {
    await StorageArea.set({ dials });
}

export async function addDial(dial: Omit<Dial, 'id' | 'order'>): Promise<Dial> {
    const allDials = await getAllDials();
    const groupDials = allDials.filter(d => d.groupId === dial.groupId);

    const newDial: Dial = {
        ...dial,
        id: crypto.randomUUID(),
        order: groupDials.length,
    };
    allDials.push(newDial);
    await saveDials(allDials);
    return newDial;
}

export async function updateDial(id: string, updates: Partial<Dial>): Promise<void> {
    const allDials = await getAllDials();
    const index = allDials.findIndex(d => d.id === id);
    if (index > -1) {
        allDials[index] = { ...allDials[index], ...updates };
        await saveDials(allDials);
    }
}

export async function removeDial(id: string): Promise<void> {
    const allDials = await getAllDials();
    const dialToRemove = allDials.find(d => d.id === id);
    if (!dialToRemove) return;

    // Filtramos
    const filtered = allDials.filter(d => d.id !== id);

    // Reordenamos solo los del mismo grupo
    const groupDials = filtered.filter(d => d.groupId === dialToRemove.groupId);
    groupDials.sort((a, b) => a.order - b.order).forEach((d, i) => d.order = i);

    await saveDials(filtered);
}

// BULK IMPORTS
export async function importNativeBookmarksBulk(): Promise<number> {
    if (!chrome.bookmarks) return 0;
    const tree = await chrome.bookmarks.getTree();

    let allGroups = await getGroups();
    let allDials = await getAllDials();
    let importedCount = 0;

    const processNode = (node: chrome.bookmarks.BookmarkTreeNode, currentGroupId?: string) => {
        if (node.url && currentGroupId) {
            allDials.push({
                id: crypto.randomUUID(),
                groupId: currentGroupId,
                title: node.title || 'Sin título',
                url: node.url,
                order: allDials.filter(d => d.groupId === currentGroupId).length
            });
            importedCount++;
        } else if (node.children && node.children.length > 0) {
            const groupTitle = node.title ? `📁 ${node.title}` : 'Marcadores Importados';
            const newGroupId = crypto.randomUUID();
            allGroups.push({
                id: newGroupId,
                title: groupTitle,
                order: allGroups.length
            });
            for (const child of node.children) {
                processNode(child, newGroupId);
            }
        }
    };

    for (const child of tree[0].children || []) {
        processNode(child);
    }

    await saveGroups(allGroups);
    await saveDials(allDials);
    return importedCount;
}

export async function importHtmlBookmarks(htmlString: string): Promise<number> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    let allGroups = await getGroups();
    let allDials = await getAllDials();
    let importedCount = 0;

    const h3s = doc.querySelectorAll('h3');
    if (h3s.length === 0) {
        // Flat links
        const links = doc.querySelectorAll('a');
        if (links.length > 0) {
            const newGroupId = crypto.randomUUID();
            allGroups.push({ id: newGroupId, title: '📁 HTML File', order: allGroups.length });
            links.forEach(a => {
                allDials.push({
                    id: crypto.randomUUID(),
                    groupId: newGroupId,
                    title: a.textContent || 'Sin título',
                    url: a.href,
                    order: allDials.filter(d => d.groupId === newGroupId).length
                });
                importedCount++;
            });
        }
    } else {
        h3s.forEach(h3 => {
            const dl = h3.nextElementSibling;
            if (dl && dl.tagName.toLowerCase() === 'dl') {
                const links = dl.querySelectorAll('a');
                if (links.length > 0) {
                    const newGroupId = crypto.randomUUID();
                    allGroups.push({ id: newGroupId, title: `📁 ${h3.textContent || 'Carpeta'}`, order: allGroups.length });
                    links.forEach(a => {
                        allDials.push({
                            id: crypto.randomUUID(),
                            groupId: newGroupId,
                            title: a.textContent || 'Sin título',
                            url: a.href,
                            order: allDials.filter(d => d.groupId === newGroupId).length
                        });
                        importedCount++;
                    });
                }
            }
        });
    }

    await saveGroups(allGroups);
    await saveDials(allDials);
    return importedCount;
}
