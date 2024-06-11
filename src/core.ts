import { JUEGO } from "./juego";
import { ES } from "./lang/es";
import { Engine, EntradaEstructura } from "./scraper/engine";
import { Msg } from "./scraper/tipos";
import { RTCache } from "./utils/cache";

export class Core {

    T = ES;

    rc: RTCache;
    scraper: Engine;

    msg = {... JUEGO};

    constructor() {

    }

    async getFromCacheOrQuery(msg: Msg, key: string = "actual", extraerReverseEnlaces: boolean): Promise<EntradaEstructura> {

        if (!this.scraper) {
            this.scraper = new Engine(msg.base);
        }

        const target = msg[key]
        msg.turno.push(this.T.LEYENDO_OBJETIVO.replace("%1", target.replace(msg.base, "")));

        const storage = this.rc.leer("archivo") || {};
        let candidato = storage[target] as unknown as EntradaEstructura;

        if (!candidato || extraerReverseEnlaces) {

            msg.turno.push(this.T.LEYENDO_OBJETIVO_SCRAP);

            candidato = await this.leer(msg, key, extraerReverseEnlaces);

            if (candidato &&
                candidato.headers?.length > 0
            ) {
                storage[target] = candidato;
                this.rc.guardar("archivo", storage);
                this.rc.persistir();
            }
        }

        return candidato;

    }

    async leer(msg: Msg, key: string = "actual", extraerReverseEnlaces: boolean): Promise<EntradaEstructura> {

        const target = msg[key]

        if (extraerReverseEnlaces) { // Force
            const solucion = await this.scraper.extraerReverseEnlaces(target);
            const storage = this.rc.leer("reverse") || {};
            storage[target] = solucion;
            this.rc.guardar("reverse", storage);
            this.rc.persistir();
        }

        return await this.scraper.extraerEnlaces(target, msg.actual_title);

    }

}