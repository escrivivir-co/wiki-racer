import puppeteer from 'puppeteer';
import { WikiParser } from './wiki-parser';
import wiki from 'wikipedia';

export const API_URL = "action=query&prop=revisions&rvprop=content&format=json&titles=%1";

export interface Dom {

}

export interface EntradaEstructura {
    externos: EntradaElemento[];
    internos: EntradaElemento[];
    headers?: EntradaElemento[];
}

export interface EntradaElemento {
    id: string;
    text: string;
    ocurrencias: number;
    data?: any;
}

export class Engine {

    // Método asincrónico para extraer enlaces de una URL dada
    async extraerEnlaces(url: string, title: string): Promise<EntradaEstructura> {

        console.log("RT ENGINE:", "Llamada remota con ruta (enlaces)", url);

        try {
            // Inicia Puppeteer
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            });
            const page = await browser.newPage();

            // Navega a la URL
            await page.goto(url);

            const enlaces = await page.evaluate(() => {

                const anchors = Array.from(document.querySelectorAll('a'));
                return anchors
                    .map(anchor => { return { id: anchor.href, text: anchor.innerHTML}});

            });

            const headers = await this.searchWikipedia(title, url);

            // Cierra el navegador
            await browser.close();

            const anchors = new WikiParser().parsear(enlaces);

            return {
                ...anchors,
                headers
            }
        } catch(ex) {
            console.log("RT ENGINE", "Error llamada remota", ex.message, "url:", url);
            return {
                externos: [],
                internos: [],
                headers: []
            }
        }
    }

    async searchWikipedia(keyword: string, url: string): Promise<EntradaElemento[]> {

        try {

            keyword = keyword || url.split("/").pop();

            const newUrl = wiki.setLang('es');
            console.log("RT ENGINE", "Llamada remota con ruta (info)", keyword, url);

            let search = (await wiki.page(keyword));
            // console.log("RT ENGINE", "Search", search);

            let page = search;

            if (!page) {
                return [];
            }

            //Response of type @Page object
            const summary = await page.summary();
            const intro = await page.intro();

            let re = /\"/gi;
            const html = (await page.html()).replace(re, "'");

            return [{
                id: page.canonicalurl,
                text: page.title,
                data: {
                    intro,
                    summary,
                    html
                },
                ocurrencias: 0
            }];

        } catch (error) {
            console.error('Error searching Wikipedia:', error, keyword);
            let search = (await wiki.search(url));
            console.log("RT ENGINE", "Search", search);
            return [];
        }
    }
}