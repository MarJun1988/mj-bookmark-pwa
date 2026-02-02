import {createRouter, createWebHistory} from 'vue-router'
import {mainMenuNames, mainMenuRoutes, managementAreaNames, managementAreaRoutes} from "@/router/default";
import {useTranslationsStore} from "@/stores/translations";
import pinia from "@/stores/store";

// Store - Translations
const storeTranslations = useTranslationsStore(pinia);
const {menus, generals} = storeTranslations;

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: mainMenuRoutes.default,
            name: mainMenuNames.default,
            redirect: {name: mainMenuNames.dashboard},
            component: () => import('../views/HomeView.vue')
        },
        {
            path: mainMenuRoutes.dashboard,
            name: mainMenuNames.dashboard,
            component: () => import('../views/DashboardView.vue')
        },
        {
            path: mainMenuRoutes.managementArea,
            name: mainMenuNames.managementArea,
            meta: {
                label: menus.mainMenu.managementArea.label
            },
            component: () => import('../views/ManagementView.vue'),
            children: [
                {
                    path: managementAreaRoutes.tabArea,
                    name: managementAreaNames.tabArea,
                    meta: {
                        label: menus.mainMenu.managementArea.children.tabArea.label
                    },
                    components: {
                        default: () => import('../views/ManagementView.vue'),
                        tableView: () => import('../views/Management/TabAreaList.vue'),
                    },
                    redirect: {name: managementAreaNames.tabAreaList},
                    children: [
                        {
                            path: managementAreaRoutes.tabAreaList,
                            name: managementAreaNames.tabAreaList,
                            components: {
                                // tableView: () => import('../views/Management/TabAreaList.vue'),
                            },
                            meta: {
                                label: `${menus.mainMenu.managementArea.children.tabArea.children.label} - ${generals.siteTitleListItem}`
                            }
                        },
                        {
                            path: managementAreaRoutes.tabAreaNew,
                            name: managementAreaNames.tabAreaNew,
                            components: {
                                dialogView: () => import('../views/Management/TabAreaDialog.vue'),
                            },
                            meta: {
                                label: `${menus.mainMenu.managementArea.children.tabArea.children.label} - ${generals.siteTitleNewItem}`
                            }
                        },
                        {
                            path: managementAreaRoutes.tabAreaEdit,
                            name: managementAreaNames.tabAreaEdit,
                            components: {
                                dialogView: () => import('../views/Management/TabAreaDialog.vue'),
                            },
                            meta: {
                                label: `${menus.mainMenu.managementArea.children.tabArea.children.label} - ${generals.siteTitleEditItem}`
                            }
                        },
                        {
                            path: managementAreaRoutes.tabAreaDelete,
                            name: managementAreaNames.tabAreaDelete,
                            components: {
                                dialogView: () => import('../views/Management/TabAreaDialog.vue'),
                            },
                            meta: {
                                label: `${menus.mainMenu.managementArea.children.tabArea.children.label} - ${generals.siteTitleDeleteItem}`
                            }
                        }
                    ]
                },
                {
                    path: managementAreaRoutes.bookmarkCategory,
                    name: managementAreaNames.bookmarkCategory,
                    meta: {
                        label: menus.mainMenu.managementArea.children.bookmarkCategory.label
                    },
                    components: {
                        default: () => import('../views/ManagementView.vue'),
                        tableView: () => import('../views/Management/BookmarkCategoryList.vue'),
                    },
                    redirect: {name: managementAreaNames.bookmarkCategoryList},
                    children: [
                        {
                            path: managementAreaRoutes.bookmarkCategoryList,
                            name: managementAreaNames.bookmarkCategoryList,
                            components: {
                                // tableView: () => import('../views/Management/bookmarkCategoryList.vue'),
                            },
                            meta: {
                                label: `${menus.mainMenu.managementArea.children.bookmarkCategory.children.label} - ${generals.siteTitleListItem}`
                            }
                        },
                        {
                            path: managementAreaRoutes.bookmarkCategoryNew,
                            name: managementAreaNames.bookmarkCategoryNew,
                            components: {
                                dialogView: () => import('../views/Management/BookmarkCategoryDialog.vue'),
                            },
                            meta: {
                                label: `${menus.mainMenu.managementArea.children.bookmarkCategory.children.label} - ${generals.siteTitleNewItem}`
                            }
                        },
                        {
                            path: managementAreaRoutes.bookmarkCategoryEdit,
                            name: managementAreaNames.bookmarkCategoryEdit,
                            components: {
                                dialogView: () => import('../views/Management/BookmarkCategoryDialog.vue'),
                            },
                            meta: {
                                label: `${menus.mainMenu.managementArea.children.bookmarkCategory.children.label} - ${generals.siteTitleEditItem}`
                            }
                        },
                        {
                            path: managementAreaRoutes.bookmarkCategoryDelete,
                            name: managementAreaNames.bookmarkCategoryDelete,
                            components: {
                                dialogView: () => import('../views/Management/BookmarkCategoryDialog.vue'),
                            },
                            meta: {
                                label: `${menus.mainMenu.managementArea.children.bookmarkCategory.children.label} - ${generals.siteTitleDeleteItem}`
                            }
                        }
                    ]
                },
                {
                    path: managementAreaRoutes.bookmark,
                    name: managementAreaNames.bookmark,
                    meta: {
                        label: menus.mainMenu.managementArea.children.bookmark.label
                    },
                    components: {
                        default: () => import('../views/ManagementView.vue'),
                        tableView: () => import('../views/Management/BookmarkList.vue'),
                    },
                    redirect: {name: managementAreaNames.bookmarkList},
                    children: [
                        {
                            path: managementAreaRoutes.bookmarkList,
                            name: managementAreaNames.bookmarkList,
                            components: {
                                // tableView: () => import('../views/Management/bookmarkList.vue'),
                            },
                            meta: {
                                label: `${menus.mainMenu.managementArea.children.bookmark.children.label} - ${generals.siteTitleListItem}`
                            }
                        },
                        {
                            path: managementAreaRoutes.bookmarkNew,
                            name: managementAreaNames.bookmarkNew,
                            components: {
                                dialogView: () => import('../views/Management/BookmarkDialog.vue'),
                            },
                            meta: {
                                label: `${menus.mainMenu.managementArea.children.bookmark.children.label} - ${generals.siteTitleNewItem}`
                            }
                        },
                        {
                            path: managementAreaRoutes.bookmarkEdit,
                            name: managementAreaNames.bookmarkEdit,
                            components: {
                                dialogView: () => import('../views/Management/BookmarkDialog.vue'),
                            },
                            meta: {
                                label: `${menus.mainMenu.managementArea.children.bookmark.children.label} - ${generals.siteTitleEditItem}`
                            }
                        },
                        {
                            path: managementAreaRoutes.bookmarkDelete,
                            name: managementAreaNames.bookmarkDelete,
                            components: {
                                dialogView: () => import('../views/Management/BookmarkDialog.vue'),
                            },
                            meta: {
                                label: `${menus.mainMenu.managementArea.children.bookmark.children.label} - ${generals.siteTitleDeleteItem}`
                            }
                        }
                    ]
                }
            ]
        }
    ]
});


router.beforeEach((to, from) => {

    // Festlegung des Seiten Titles
    let siteTitle = generals.siteTitle;
    let siteTitleShort = generals.siteTitleShort;

    // Festlegung der Seiten Titels
    window.document.title = to && to.meta && to.meta.label ? `${siteTitleShort} - ${to.meta.label}` : siteTitle;
});

export default router
