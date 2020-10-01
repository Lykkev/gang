const Command = require("../../structures/Command");

class dicksizeCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<member:member&fallback>",
      description: "Te devuelve el tamaño del pene de otro miembro o tuyo.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const inches = user.id % 7.1;
    if (user.bot) return this.bot.embed("❌ Error", `No creo que **${user.username}** tenga pene.`, msg, "error");

    const suffix = a => {
      return a > 1 || a < 0 || a === 0 ? "es" : "";
    };

    const thedick = `8${"=".repeat(Math.round(inches.toFixed(2) / 2))}D`;
    this.bot.embed("🍆 Dicksize", `**${user.username}** el tamaño de tu pene es **${inches.toFixed(1)} pulgada${suffix(inches)}**.\n` + `${thedick}`, msg);
  }
}

module.exports = dicksizeCommand;
