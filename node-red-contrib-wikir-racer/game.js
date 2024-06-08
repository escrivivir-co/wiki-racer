var W = require("/Users/morente/Desktop/wiki-racer/dist/juego.js");

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
