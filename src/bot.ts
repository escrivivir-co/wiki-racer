import { Core } from "./core";
import { EntradaEstructura } from "./scraper/engine";
import { Msg } from "./scraper/tipos";
import { RTCache } from "./utils/cache";


export interface BusquedaInfo {
    label: string;
}

export interface Busqueda {

    hacia: EntradaEstructura;
    hacia_info?: BusquedaInfo;

    desde: EntradaEstructura;
    desde_info?: BusquedaInfo;
}

export class Bot extends Core {

    constructor() {
        super()
    }

    async turno(msg: Msg) {

        if (!this.rc) {
            this.rc = new RTCache();
            this.rc.ruta = msg.disco;
            this.rc.archivo = "tree.json";
            this.rc.recuperar();
        }

        msg.busqueda = msg.busqueda || { hacia: null, desde: null };
        if (msg.busqueda.hacia) {

            const nodo = msg.busqueda.hacia.headers[0].text
            const destinos = msg.busqueda.hacia.internos.length;
            msg.busqueda.hacia_info = { label: `Hacia ${nodo} hay: ${destinos} opciones`};

        } else {

            msg.query = msg.inicio;
            msg.busqueda.hacia = await this.getFromCacheOrQuery(msg, "query");
            console.log("RT BOT", "Operando DESDE", msg.busqueda.hacia.headers[0].id);

        }

        if (msg.busqueda.desde) {

            const nodo = msg.busqueda.desde.headers[0];

            const storage = this.rc.leer("reverse") || {};
            const destinos = storage[nodo.id]?.internos.length || [];
            console.log("RT BOT", "Get desde", storage[nodo.id], nodo.id)

            msg.busqueda.desde_info = { label: `Desde ${nodo.text} hay: ${destinos} opciones`};

        } else {
            msg.query = msg.final;
            msg.busqueda.desde = await this.getFromCacheOrQuery(msg, "query");
            console.log("RT BOT", "Operando HASTA", msg.busqueda.desde.headers[0].id);
        }

        return msg;
    }
}