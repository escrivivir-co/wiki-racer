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
        OBJETIVO: "Modo Json: activado. Si tienes que comunicar algúna información hazo dentro de un campo llamado 'last_error'. Eres un experto jugador de  Wiki-Racer. A partir de una página de inicio y otra de objetivo, encontrar un camino de páginas enlazadas entre las dos. El juego acaba en el turno número 15 si no se ha encontrado el camino. Esta consulta va acompañada de un objeto 'context' de donde extraer la información. En tu respuesta devuelve un campo con el número de turno actual identificado del contexto. Y un campo 'candidato' con la selección de un elemento existente en el array context.candidatos. Añade un campo 'indice' con el índice del candidato escogido en el array. Importante: valida tu respuesta contra el campo 'camino' para no sugerir opciones ya escogidas y evitar bucles, si tu candidato ya está en 'camino' debes escoger otro. Tienes que intentar hacerlo con el menor número enlaces, encontrar el camino más corto. La selección del candidato debe aproximar el camino al campo 'final' aportando un nuevo enlace relacionado con la temática que se busca. Agrega otro campo llamado 'path_prediction' que será un array de strings indicando qué camino predices a partir de la selección actual e incluirá los títulos de las páginas hasta la final."
    }

}