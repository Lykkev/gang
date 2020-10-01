const Command = require("../../structures/Command");
const responses = [
  "Es cierto", "Definitivamente es así", "Sin duda", "Sí, definitivamente", "Puede confiar en él", "Como yo lo veo, sí", "La mayoría probable.",
  "Outlook bueno", "Sí", "Las señales apuntan a que sí", "Respuesta confusa, inténtalo de nuevo", "Preguntar de nuevo más tarde", "Mejor no decírtelo ahora", "No se puede predecir ahora",
  "Concéntrate y pregunta de nuevo", "No cuentes con eso", "Mi respuesta es no", "Mis fuentes dicen que no", "Outlook no es tan bueno", "Muy dudoso",
];

class eightballCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["ask", "askball", "ball"],
      args: "[question:string]",
      description: "Haz una pregunta",
      allowdms: true,
    });
  }

  run(msg) {
    this.bot.embed("🎱 8ball", `${responses[Math.floor(Math.random() * responses.length)]}`, msg);
  }
}

module.exports = eightballCommand;
