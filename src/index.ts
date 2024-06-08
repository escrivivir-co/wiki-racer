import { Juego } from "./juego";

(async () => {

    const juego = new Juego();
    const msg = juego.msg;

    console.log("Iteración 1", msg);

    juego.msg.inicio = "https://es.wikipedia.org/wiki/Esquema_Nacional_de_Seguridad";
    juego.msg.final = "https://es.wikipedia.org/wiki/Isaac_Asimov";

    await juego.turno(msg);

    console.log("Iteración 2", msg);

    msg.actual = "https://es.wikipedia.org/wiki/Control_de_autoridades";
    await juego.turno(msg);

    console.log("Iteración 3", msg);

})();


