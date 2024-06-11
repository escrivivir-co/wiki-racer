export const ES = {

    CONFIG_INICIO: "Introduzca un enlace de inicio.",
    CONFIG_FINAL: "Introduzca un enlace de final.",

    NUEVO_TURNO: "- %0: (%1)",

    FIN_JUEGO_EXITO: "¡Enhorabuena! ¡Has llegado al objetivo!",

    FIN_JUEGO: "El juego ha sido terminado.",

    FIN_JUEGO_SIN_SALIDA: "Has hecho un camino sin salida. ¡Perdiste!",

    ESCOGER: "¡Debes escoger un candidato!",

    CANDIDATO_ESCOGIDO: "Seleccionado: %1",

    CANDIDATO_ESCOGIDO_EXT: "Enlaces disponibles: %1",

    NO_SE_PUEDE_SEGUIR: "El anterior actual no es válido, el juego no puede continuar",

    ESPERANDO_AL_JUGADOR: "Esperando al jugador...",

    LEYENDO_OBJETIVO: "Caché %1",

    LEYENDO_OBJETIVO_SCRAP: "Salida a red...",

    GPT: {
        OBJETIVO: "Modo Json: activado. Estamos jugando al Wiki-Racer. A partir de una página de inicio y otra de objetivo, encontrar un camino de páginas enlazadas entre las dos. A partir del siguiente context correspondiente a una página y sus enlaces, elige el siguiente candidato de turno. Responde con solo un JSON con clave 'candidato' y el valor del candidato escogido existente en el array context.candidatos. Indicando en un segundo campo del JSON el índice del candidato escogido en el array. Importante: observa el campo 'camino' para no sugerir opciones ya escogidas y evitar bucles."
    }

}