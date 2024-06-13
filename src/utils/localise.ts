import { LocalesService, LanguageNames } from "@companieshouse/ch-node-utils";
import { LOCALES_ENABLED, LOCALES_PATH } from "./properties";

export const selectLang = (lang: any): string => {
    switch (lang) {
    case "cy": return "cy";
    case "en":
    default: return "en";
    }
};

export const addLangToUrl = (url: string, lang: string | undefined): string => {
    if (lang === undefined || lang === "") {
        return url;
    }
    if (url.includes("?")) {
        return url + "&lang=" + lang;
    } else {
        return url + "?lang=" + lang;
    }
};

export const getLocaleInfo = (locales: LocalesService, lang: string) => {
    return {
        languageEnabled: locales.enabled,
        languages: LanguageNames.sourceLocales(locales.localesFolder),
        i18n: locales.i18nCh.resolveNamespacesKeys(lang),
        lang
    };
};

const localesSevice = LocalesService.getInstance(LOCALES_PATH, LOCALES_ENABLED === "true");

export const getLocalesService = () => localesSevice;
