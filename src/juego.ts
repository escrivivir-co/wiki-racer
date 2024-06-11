import { Core } from "./core";
import { Etapa, Error } from "./estado";
import { Engine, EntradaEstructura} from './scraper/engine';
import { Msg, LineaGuion, Camino } from "./scraper/tipos";
import { RTCache } from "./utils/cache";

export const JUEGO: Msg = {

    disco: "/Users/morente/Desktop/wiki-racer/CRIPTA",
    base : "https://es.wikipedia.org/wiki/",
    clave: "Race-1",

    inicio: "",
    actual: "",
    final: "",
    final_invalido: false,
    camino: [],
    guion: [],
    turno: [],

    actual_info: null,
    actual_title: "",
    camino_info: null,

    estado: {
        Etapa: Etapa.NoIniciado,
        Error: Error.SinDatos
    },

    restaurar: -1,
    restaurar_commit: false,

    guardar: false,

    juegos: [],
    cargar_juego: "",
    borrar_juego: "",

    pista: "",
    pista_info: null,

    busqueda: null

}

export class Juego extends Core {

    constructor() {
        super();
        this.validar(this.msg);
    }

    async validar(msg: Msg): Promise<boolean> {

        const errores: LineaGuion[] = [];

        if (!msg.inicio) {
            errores.push(this.T.CONFIG_INICIO);
        }

        if (!msg.final) {
            errores.push(this.T.CONFIG_FINAL);
        }

        msg.clave = msg.clave || JUEGO.clave;

        msg.inicio = (msg.inicio.indexOf(msg.base) == -1 ? msg.base : '') + msg.inicio;
        msg.final = (msg.final.indexOf(msg.base) == -1 ? msg.base : '') + msg.final;

        if (!this.rc) {
            this.rc = new RTCache();
            this.rc.ruta = msg.disco;
            this.rc.archivo = "tree.json";
            this.rc.recuperar();
        }

        // EXTERNAL
        const storage = this.rc.leer("gpt") || {};
        msg.busqueda = {
            ...msg.busqueda,
            ...storage,
        }

        const final = await this.getFromCacheOrQuery(msg, "final");
        console.log("RT JUEGO", "Validado final", final?.headers[0]?.text || "No encontrado");
        msg.final_invalido = final?.headers[0]?.text ? false : true;

        msg.disco = msg.disco || JUEGO.disco;

        msg.camino = msg.camino || [];
        msg.guion = msg.guion || [];
        msg.turno = msg.turno || [];

        msg.turno = msg.turno.concat(errores);

        msg.restaurar = (msg.restaurar > -1) ? msg.restaurar : -1;

        msg.juegos = msg.juegos || this.rc.leer("juegos") || [];

        return errores.length == 0;
    }

    async turnoAwait(msg: Msg): Promise<Msg> {

        return await (async () => {
            return await this.turno(msg);
        })();

    }

    async turno(msg: Msg): Promise<Msg> {

        msg.turno = [];

        if (msg.cargar_juego) {
            const juego = (this.rc.leer("juegos") || []).find(j => j.clave == msg.cargar_juego)
            if (juego) {
                msg = {...juego};
            }
            msg.cargar_juego = "";
            msg.juegos = this.rc.leer("juegos") || [];
            return msg;
        }

        if (msg.borrar_juego) {
            const juegos = (this.rc.leer("juegos") || []) as any[];
            const juego = juegos.findIndex(j => j.clave == msg.borrar_juego)
            if (juego > -1) {
                juegos.splice(juego, 1)
                this.rc.persistir();
                msg.camino = [];
                msg.actual_info = null;
                msg.camino_info = null;
                msg.juegos = juegos;
                this.rc.guardar("juegos", juegos);
                console.log("RT JUEGO", "Borrado juego", msg.borrar_juego)
            } else {
                console.log("RT JUEGO", "No se puede borrar. 404", msg.borrar_juego, juegos.map(j => j.clave).join(","))
            }

            msg.borrar_juego = "";

            return msg;
        }

        if (msg.guardar) {
            const juegos = (this.rc.leer("juegos") || []) as any[];
            const copia = {...msg };
            const clave = copia.clave.indexOf("/") > -1 ? copia.clave.split("/")[1] : copia.clave;
            copia.clave = new Date().getTime() + "/" + clave;
            juegos.push(copia);
            this.rc.guardar("juegos", juegos.map(j => { delete j.juegos; return j}));
            this.rc.persistir();
            msg.guardar = false;
            msg.juegos = juegos;
            return msg;
        }

        if (msg.restaurar > -1) {

            const indice: number = parseInt(msg.restaurar as any, 10);
            const restaurar = msg.camino[indice];

            msg.actual = restaurar.anterior;
            restaurar.candidato = "";

            msg.actual_info = restaurar.candidatos.headers[0];
            msg.camino_info = restaurar;
            console.log("RT JUEGO", "Restaurado", indice, "Caminos/Guion antes", msg.camino.length, msg.guion.length /*, msg.actual_info*/);

            if (msg.restaurar_commit) {

                // NO SOLO VIAJAR ATRÁS SINO HACERLO PERMANENTE
                msg.restaurar_commit = false;
                msg.camino.splice((indice + 1), msg.camino.length - indice);
                msg.guion.splice((indice + 1), msg.guion.length - indice);
                console.log("RT JUEGO", "Restaurado commit", indice, "Caminos final", msg.camino.length /*, msg.actual_info*/);
                console.log("RT JUEGO", "Restaurado commit", indice, "Guion final", msg.guion.length /*, msg.actual_info*/);
            }

            msg.restaurar = -1;

            // SALIDA TRAS RESTAURAR
            return msg;
        }

        if (!(await this.validar(msg))) {

            msg.estado = {
                Etapa: Etapa.Esperando,
                Error: Error.FaltanPropiedades
            };

            // SALIDA: CONFIGURACIÓN DEL JUEGO INVÁLIDA
            return msg;

        }

        if (msg.pista) {
            const storage = this.rc.leer("reverse") || {};
            msg.pista_info = (storage[msg.pista]) as unknown as EntradaEstructura || null;
            msg.actual = msg.pista;
        }

        // Primer turno
        if (msg.camino.length == 0) {
            msg.actual = msg.inicio;
        } else {
            const seleccion = msg.actual;

            const actual = this.ultimoCamino(msg);
            actual.candidato = seleccion;

            const texto = actual.candidatos.internos.find(c => c.id == seleccion)?.text || "--";

            if (texto != "--") {
                msg.guion.push(this.T.NUEVO_TURNO.replace("%0", msg.camino.length + "").replace("%1", texto));
            }

            // Sucesivos turnos, el usuario ha elegido
            if (actual.candidato) {



            } else {

                // El usuario debe elegir
                if (actual.candidatos.internos.length == 0) {
                    msg.turno.push(this.T.FIN_JUEGO_SIN_SALIDA);
                    msg.estado = {
                        Etapa: Etapa.Acabado,
                        Error: Error.CaminoSinSalida
                    };
                } else {
                    msg.estado = {
                        Etapa: Etapa.Esperando,
                        Error: Error.SinDatos
                    };
                    msg.turno.push(this.T.ESCOGER);

                    msg.actual_info = this.ultimoActual(msg);
                    msg.camino_info = this.ultimoCamino(msg);
                }
                // SALIDA: JUEGO FINALIZADO, CAMINO SIN SALIDA
                // SALIDA: EL JUGADOR DEBE INTERACTUAR
                return msg;

            }
        }

        const candidato = await this.getFromCacheOrQuery(msg);

        if (!candidato) {

            msg.estado = {
                Etapa: Etapa.Reintentar,
                Error: Error.NoEncontrado
            };

            msg.turno.push(this.T.NO_SE_PUEDE_SEGUIR);

            // SALIDA: NO SE PUEDEN OBTENER NUEVOS DATOS DE LA FUENTE
            return msg;

        } else {

            const tieneFinal = candidato.internos.find(c => c.id.toUpperCase() == msg.final.toUpperCase());
            if (tieneFinal) {
                candidato.internos = [tieneFinal]
            }
            const camino: Camino = {
                anterior: msg.actual,
                candidato: "",
                candidatos: candidato
            };

            if (msg.camino.length == 0) {
                const texto = candidato.headers[0].text;
                msg.guion.push(this.T.NUEVO_TURNO.replace("%0", msg.camino.length + "").replace("%1", texto));
            }

            msg.camino.push(camino);

            if (msg.actual == msg.final) {

                if (!msg.pista) {
                    msg.turno.push(this.T.FIN_JUEGO_EXITO);
                    msg.guion.push(this.T.FIN_JUEGO);
                }

                msg.estado = {
                    Etapa: Etapa.Acabado,
                    Error: Error.Exito
                };
                msg.camino_info = this.ultimoCamino(msg);
                msg.camino_info.candidatos = {
                    internos: [],
                    externos: [],
                    headers: msg.camino_info.candidatos.headers,
                    descartados: []
                };

            } else {

                const turno = this.T.CANDIDATO_ESCOGIDO
                .replace("%1", msg.actual.replace(msg.base, ""));
                msg.turno.push(turno);

                if (!msg.pista) {
                    const turnoEXT = this.T.CANDIDATO_ESCOGIDO_EXT
                    .replace("%1", candidato.internos.length + "");

                    msg.turno.push(turnoEXT);
                    msg.turno.push(this.T.ESPERANDO_AL_JUGADOR);

                    msg.estado = {
                        Etapa: Etapa.Esperando,
                        Error: Error.SinDatos
                    };
                }

                msg.camino_info = this.ultimoCamino(msg);
            }

            msg.actual_info = this.ultimoActual(msg);

            if (msg.pista) {
                msg.camino.pop(); // Elimina el último porque es temporal solo para consultas
            }

            // SALIDA: EL JUGADOR DEBE ESCOGER CANDIDATO
            // SALIDA: ACABAEL JUEGO, SE HA LLEGADO AL OBJETIVO FINAL
            return msg;
        }

    }

    ultimoCamino(msg: Msg): Camino {

        try {
            return msg.camino[msg.camino.length - 1];

        } catch(ex) {
            return {
                anterior: "",
                candidato: "",
                candidatos: {
                    internos: [],
                    externos: [],
                    headers: [],
                    descartados: [],
                }
            }
        }

    }

    ultimoActual(msg: Msg) {

        try {

            const h = this.ultimoCamino(msg).candidatos.headers;
            return h[h.length - 1];

        } catch(ex) {
            return {
                id: "",
                text: "",
                ocurrencias: 0,
                data: {}
            }
        }

    }

}