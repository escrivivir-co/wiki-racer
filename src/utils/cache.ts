import * as fs from "fs";
import * as path from "path";

export type Ignoto = any;

export class RTCache {

    dominio = {};

    ruta: string = "/tmp";
    archivo: string = 'cache.json';

    constructor() {}

    rutaArchivo() {
        return path.join(this.ruta, this.archivo);
    }

    guardar(clave: string, valor: Ignoto): void {

        console.log("RT Cache: GUARDAR con clave:", clave)
        this.dominio[clave] = valor;

    }

    leer(clave: string): Ignoto {

        console.log("RT Cache: LEER con clave:", clave)
        return this.dominio[clave];

    }

    leerLista(clave: string): Ignoto[] {

        return this.dominio[clave] || [];

    }

    persistir() {

        try {
            console.log("RT Cache: PERSISTIR con archivo:", this.rutaArchivo())
            fs.writeFileSync(
                this.rutaArchivo(),
                JSON.stringify(this.dominio, null, "\t")
            );
        } catch(ex) {
            console.log("Error al guardar cache", ex)
        }

    }

    recuperar() {

        try {

            if (!fs.existsSync(this.ruta)) {
                fs.mkdirSync(this.ruta, { recursive: true});
            }

            if (!fs.existsSync(this.rutaArchivo())) {
                this.persistir();
            }

            console.log("RT Cache: RECUPERAR con archivo:", this.rutaArchivo())
            const data = fs.readFileSync(this.rutaArchivo()) as unknown as string;

            this.dominio = JSON.parse(data);

        } catch(ex) {
            console.log("[Cache RT:]", ex.message);
        }


    }


}