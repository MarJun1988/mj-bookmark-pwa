// Hauptmenü
const mainMenuRoutes = {
    default: '/',
    dashboard: '/dashboard',
    managementArea: '/management-area',
};
const mainMenuNames = {
    default: 'default',
    dashboard: 'dashboard',
    managementArea: 'management-area',
};
// Verwaltung
const managementAreaRoutes = {
    // Abschnitte - Tab Areas
    tabArea: `tab-area`,
    tabAreaList: `list`,
    tabAreaNew: `new`,
    tabAreaEdit: `edit/:id`,
    tabAreaDelete: `delete/:id`,
    // Lesezeichen Kategorien
    bookmarkCategory: `bookmark-category`,
    bookmarkCategoryList: `list`,
    bookmarkCategoryNew: `new`,
    bookmarkCategoryEdit: `edit/:id`,
    bookmarkCategoryDelete: `delete/:id`,
    // Lesezeichen
    bookmark: `bookmark`,
    bookmarkList: `list`,
    bookmarkNew: `new`,
    bookmarkEdit: `edit/:id`,
    bookmarkDelete: `delete/:id`,
};
const managementAreaNames = {
    // Abschnitte - Tab Areas
    tabArea: `${mainMenuNames.managementArea}-tab-area`,
    tabAreaList: `${mainMenuNames.managementArea}-tab-area-list`,
    tabAreaNew: `${mainMenuNames.managementArea}-tab-area-new`,
    tabAreaEdit: `${mainMenuNames.managementArea}-tab-area-edit`,
    tabAreaDelete: `${mainMenuNames.managementArea}-tab-area-delete`,
    // Lesezeichen Kategorien
    bookmarkCategory: `${mainMenuNames.managementArea}-bookmark-category`,
    bookmarkCategoryList: `${mainMenuNames.managementArea}-bookmark-category-list`,
    bookmarkCategoryNew: `${mainMenuNames.managementArea}-bookmark-category-new`,
    bookmarkCategoryEdit: `${mainMenuNames.managementArea}-bookmark-category-edit`,
    bookmarkCategoryDelete: `${mainMenuNames.managementArea}-bookmark-category-delete`,
    // Lesezeichen
    bookmark: `${mainMenuNames.managementArea}-bookmark`,
    bookmarkList: `${mainMenuNames.managementArea}-bookmark-list`,
    bookmarkNew: `${mainMenuNames.managementArea}-bookmark-new`,
    bookmarkEdit: `${mainMenuNames.managementArea}-bookmark-edit`,
    bookmarkDelete: `${mainMenuNames.managementArea}-bookmark-delete`,
};

export {
    mainMenuRoutes,
    mainMenuNames,
    managementAreaRoutes,
    managementAreaNames
};