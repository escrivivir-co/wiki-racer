export enum Etapa {
    NoIniciado = "NoIniciado",
    Reintentar = "Reintentar",
    Iniciado = "Iniciado",
    Acabado = "Acabado",
    Esperando = "Esperando"
}

export enum Error {
    SinDatos = "SinDatos",
    NoEncontrado = "NoEncontrado",
    FaltanPropiedades = "FaltanPropiedades",
    CaminoSinSalida = "CaminoSinSalida",
    Exito = "Exito"
}

export type  Estado = {
    Etapa: Etapa,
    Error: Error
}