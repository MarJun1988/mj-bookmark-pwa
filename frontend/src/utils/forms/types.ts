// types/form.ts
export type FormMode = "create" | "edit" | "view" | "delete";

export type FieldType =
    | 'text'
    | 'number'
    | 'date'
    | 'datetime'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'password'
    | 'url'
    | 'email'
    | 'img'
    | 'autocomplete'

export interface FormField<T = any> {
    /**
     * Kann ein echtes Feld ODER ein Dot-Path sein
     * z. B. "groupId" | "group.id" | "config.url"
     */
    // name: keyof T & string
    name: string
    label: string
    type: FieldType

    class?: string // Tailwind Grid
    readonly?: (model: T) => boolean
    disabled?: (model: T) => boolean
    required?: (model: T) => boolean

    defaultValue?: any

    // Validation (später erweiterbar)
    validate?: (value: any, model: T) => string | null

    /** 🔗 Abhängigkeiten */
    // dependsOn?: keyof T & string
    dependsOn?: string[]
    visible?: (model: T) => boolean

    /** 🔽 Select */
    options?:
    | SelectOption[]
    | ((model: T) => SelectOption[])

    /** 🔁 Reset bei Abhängigkeitsänderung */
    resetOnDependencyChange?: boolean

    componentProps?: Record<string, any>

    /** 🔥 NEU */
    onBlurAction?: 'previewLinkMeta'

    /** 🔥 Ziel-Felder */
    affects?: {
        url?: string
        title?: string
        favicon?: string
    }

    /** nur für autocomplete */
    autocomplete?: {
        multiple?: boolean;
        optionLabel?: string;
        optionValue?: string;
        allowCreate?: boolean;
        fetch: (query: string) => Promise<any[]>;
        create?: (label: string) => Promise<any>;
    };
}

export interface SelectOption {
    label: string
    value: string | number
}

// src/utils/path.ts
export function getValueByPath(
    obj: Record<string, any>,
    path: string
) {
    return path.split('.').reduce(
        (acc, key) => (acc ? acc[key] : undefined),
        obj
    )
}

export function setValueByPath(
    obj: Record<string, any>,
    path: string,
    value: unknown,
): void {
    const keys = path.split('.') as string[]
    let cursor: Record<string, any> = obj

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]!

        if (
            cursor[key] === undefined ||
            typeof cursor[key] !== 'object' ||
            cursor[key] === null
        ) {
            cursor[key] = {}
        }

        cursor = cursor[key]
    }

    cursor[keys[keys.length - 1]!] = value
}
