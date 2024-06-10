import { EntradaElemento, EntradaEstructura } from "./engine";

export const WIKIMETA_WORDS_TEXT = [
    "vector-toc-text",
    "<span",
    "<sup>",
    "<img ",
    "https://es.wikipedia.org/w/index.php?"
]

export const WIKIMETA_WORDS_ID = [
    "Wikipedia:Acerca_de",
    "#bodyContent",
    "cite_ref",
    "www.wikidata.org",
    "wikimedia.org",
    "foundation.wikimedia.org",
    "wikimediafoundation",
    "creativecommons.org",
    ".m.wikipedia.org/w/index.php",
    "Especial:",
    "Special:",
    "petscan.wmflabs.org",
    "tools.wmflabs.org",
    "&action=edit",
    "Categor%C3%ADa:"
]

export const WIKIMETA_WORDS_END = [
    "#", // EN POSIICIÓN  FINAL
]

export class WikiParser {

    constructor(public ALMACENAR_DESCARTADOS: boolean) {

    }

    base = "https://es.wikipedia.org/wiki";

    parsear(enlaces: EntradaElemento[]): EntradaEstructura {

        console.log("WIKI PARSE", "Separando enlaces, cantidad:", enlaces.length);

        const hasRescrictedWord = (text: string, list: string[]) => {
            return list.filter(c => 
                text.indexOf(c) > -1
            ).length > 0
        }

        const sort = (a, b) =>  a.text < b.text ? -1 : 1;

        const reduce = (acumulado, elemento, b, c) => {

            acumulado = acumulado || [];
            const existente = acumulado.find(c => c.id == elemento.id);

            if (existente) {
                existente.ocurrencias++;
            } else {
                acumulado.push({
                    ...elemento,
                    ocurrencias: 1
                })
            }

            return acumulado;
        }

        const base = this.base.replace("https://", "").replace("/wiki", "");
        return {
            internos: enlaces.filter(c => c.id.indexOf(base) > -1)
                .filter(c =>
                    !hasRescrictedWord(c.text, WIKIMETA_WORDS_TEXT) &&
                    !hasRescrictedWord(c.id, WIKIMETA_WORDS_ID)
                ).sort((a, b) => sort(a, b)).reduce(reduce, []),
            descartados: this.ALMACENAR_DESCARTADOS ? enlaces.filter(c => c.id.indexOf(base) > -1)
                .filter(c =>
                    hasRescrictedWord(c.text, WIKIMETA_WORDS_TEXT) ||
                    hasRescrictedWord(c.id, WIKIMETA_WORDS_ID)
                ).sort((a, b) => sort(a, b)).reduce(reduce, []) : [],
            externos: enlaces.filter(c => c.id.indexOf(base) == -1)
                .filter(c =>
                    !hasRescrictedWord(c.text, WIKIMETA_WORDS_TEXT) &&
                    !hasRescrictedWord(c.id, WIKIMETA_WORDS_ID)
                ).sort((a, b) => sort(a, b)).reduce(reduce, [])
        }
    }
}