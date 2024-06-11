import { Core } from "./core";
import { EntradaEstructura } from "./scraper/engine";
import { Msg } from "./scraper/tipos";
import { RTCache } from "./utils/cache";

export interface BusquedaInfo {
    label: string;
}

export interface ThreadInfo {
    thread_id: string;
    metadata: object;
}

export interface Busqueda {

    hacia?: EntradaEstructura;
    hacia_info?: BusquedaInfo;

    desde?: EntradaEstructura;
    desde_info?: BusquedaInfo;

    salir_api?: boolean;
    thread: boolean;

    thread_info?: ThreadInfo;
    threads?: ThreadInfo[];

    instrucciones;

    /*
        {
            "id": "asst_77TQowzpq6GoiB4sqvRFKMHm",
            "object": "assistant",
            "created_at": 1704415050,
            "name": "Hemisferio derecho",
            "description": null,
            "model": "gpt-4",
            "instructions": "A continuación se enumeran las capacidades de este agente: \"Es experto en la parte creativa y abstracta.\"\n\n- Se encarga de las funciones relacionadas con la imaginación, la creatividad, las emociones y los sentimientos.\n- Tiene un papel importante en lo referente a las funciones espaciales y las habilidades musicales.\n- Además, también se encarga del pensamiento más intuitivo, espontáneo y subjetivo.",
            "tools": [],
            "top_p": 1,
            "temperature": 1,
            "tool_resources": {},
            "metadata": {},
            "response_format": "auto"
        }
    */
    asistentes?: any[];
    set_asistentes?: any[];

    juegos?: any;
}

export class Bot extends Core {

    constructor() {
        super()
    }

    async turno(msg: Msg) {

        // CONECTOR A LA CACHE
        if (!this.rc) {
            this.rc = new RTCache();
            this.rc.ruta = msg.disco;
            this.rc.archivo = "tree.json";
            this.rc.recuperar();
        }

        const storage = this.rc.leer("gpt") || {};

        msg.busqueda.instrucciones = this.T.GPT.OBJETIVO;

        if (msg.busqueda?.set_asistentes) {

            const asistentes = msg.busqueda?.set_asistentes || [];
            storage["asistentes"] = asistentes;
            this.rc.guardar("gpt", storage);
            this.rc.persistir();

            console.log("RT BOT", "Store ASSISTANTS", msg.busqueda.set_asistentes, storage)
            msg.busqueda.asistentes = asistentes;
            msg.busqueda.set_asistentes = null;
            return msg;
        }

        if (msg.busqueda?.thread) {

            msg.busqueda.threads = storage["threads"] || [];

            msg.busqueda.threads.push(msg.busqueda.thread_info);
            storage["threads"] = msg.busqueda.threads;
            this.rc.guardar("gpt", storage);
            this.rc.persistir();

            console.log("RT BOT", "Store new thread", msg.busqueda.thread, storage)
            msg.busqueda.thread = false;

            if (msg.actual_info) {
                const juegos = storage["juegos"] || [];
                const juego = (juegos).find(j => j.clave == msg.clave);

                if (juego) {
                    juego.thread_info = msg.busqueda.thread_info;
                    storage["juegos"] = juegos;
                    this.rc.guardar("gpt", storage);
                    this.rc.persistir();
                    msg.busqueda.juegos = juegos;
                }
            }

            return msg;
        }

        if (msg.actual_info) {

            msg.busqueda.juegos = storage["juegos"] || [];

            let juegoIndex = msg.busqueda.juegos.findIndex(j => j.clave == msg.clave);
            console.log("RT BOT", "Recupera juego", juegoIndex, msg.clave /*, "de", msg.busqueda.juegos.map(j => j.clave), juegoIndex*/)

            let juego = {};

            if (juegoIndex > -1) {
                juego = msg.busqueda.juegos[juegoIndex];
            } else {

                console.log("RT BOT", "Crea juego", msg.clave)
                juego = {
                    thread_info: null,
                    clave: msg.clave,
                    camino: msg.camino.map(c => { return { anterior: c.anterior, candidato: c.candidato }}),
                    inicio: msg.inicio,
                    actual: msg.actual.replace(msg.base, ""),
                    final: msg.final,
                    base: msg.base
                }
                msg.busqueda.juegos.push(juego);
            }

            const camino = juego["camino_ia"];

            if (!camino) {

                console.log("RT BOT", "Inicializa juego", msg.clave)
                juego["camino_ia"] = {
                    mensajes: []
                }
            }

            const mensaje = juego["camino_ia"]
                .mensajes.find(m => m.actual == msg.actual.replace(msg.base, ""))

            if (!mensaje) {

                console.log("RT BOT", "Inicializa mensaje para actual", msg.clave, msg.actual)

                const mensaje = {
                    base: msg.base,
                    inicio: msg.inicio.replace(msg.base, ""),
                    final: msg.final.replace(msg.base, ""),
                    actual: msg.actual.replace(msg.base, ""),
                    camino: msg.camino.filter(c => c.candidato).map((c, index) => { return {
                        anterior: c.anterior,
                        candidato: c.candidato
                    }}),
                    candidatos: msg.camino_info.candidatos.internos.map(e => e.text),
                }

                juego["camino_ia"].mensajes.push(mensaje)
                storage["juegos"] = msg.busqueda.juegos;
                this.rc.guardar("gpt", storage);
                this.rc.persistir();

                msg.busqueda.salir_api = true;
            } else {
                msg.busqueda.salir_api = false;
            }

            if (juego["thread_info"]) {
                msg.busqueda.thread = false;
                msg.busqueda.thread_info = juego["thread_info"];
            } else {

                console.log("RT BOT", "Solicita thread...", msg.clave)
                msg.busqueda.thread = true;
                msg.busqueda.salir_api = false;
            }
        }

        return msg;
    }
}