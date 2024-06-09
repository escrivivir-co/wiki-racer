import { Estado } from "../estado";
import { EntradaElemento, EntradaEstructura } from "./engine";

export type Enlace = string;

export type LineaGuion = string;

export type Entrada = EntradaEstructura;

export interface Camino {

    anterior: Enlace;
    candidato: Enlace;
    candidatos: Entrada;
}

export interface Msg {

    disco: string;
    base: string;

    clave: string;

    inicio: Enlace;
    actual: Enlace;
    final: Enlace;
    final_invalido: boolean;

    camino: Camino[];

    guion: LineaGuion[];

    turno: LineaGuion[];

    estado: Estado;

    actual_info: EntradaElemento;
    actual_title: string;
    camino_info: Camino;

    restaurar: number;
    restaurar_commit: boolean;

    guardar: boolean;
    cargar_juego: string;
    borrar_juego: string;

    juegos: Msg[];

    pista: string;
    pista_info: EntradaEstructura;
}
