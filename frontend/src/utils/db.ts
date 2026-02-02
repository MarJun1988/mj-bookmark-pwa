import {openDB} from 'idb'

export const db = await openDB('bookmark-pwa', 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('cache')) {
            db.createObjectStore('cache')
        }
    },
})

export const cacheSet = (key: string, value: unknown) =>
    db.put('cache', value, key)

export const cacheGet = <T>(key: string): Promise<T | undefined> =>
    db.get('cache', key)
