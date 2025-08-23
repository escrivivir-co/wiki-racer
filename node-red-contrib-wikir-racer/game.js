// Carga el motor del juego desde la build local, con varias rutas posibles
const path = require("path");
let W;
for (const candidate of [
    path.join(__dirname, "../dist/juego.js"), // cuando nodesDir apunta al repo raíz
    path.join(__dirname, "./dist/juego.js"),  // cuando el dist se empaqueta dentro del módulo
]) {
    try { W = require(candidate); break; } catch(_) {}
}
if (!W) {
    throw new Error("No se encuentra dist/juego.js. Ejecuta 'npm run build' en wiki-racer o empaqueta dist dentro del nodo.");
}

module.exports = function(RED) {
    function GameNode(config) {

        RED.nodes.createNode(this, config);

        this._automata = new W.Juego();
        this._automata.msg.clave = config.name;
        this.world = config.world;

        this.on('input', async function(msg, send, done) {

            try {
                msg.wiki = await this._automata.turno(msg.wiki);

                send(msg);

                done();

            } catch (ex) {
                done({ stack: ex.stack, msg });
            }

        });
    }
    RED.nodes.registerType("game", GameNode);
};
