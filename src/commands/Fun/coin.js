const Command = require("../../structures/Command");

class coinCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["coinflip", "flip", "flipcoin"],
      description: "Lanza una moneda.",
      allowdms: true,
    });
  }

  run(msg) {
    const coin = ["cara", "sello"][Math.round(Math.random())];
    this.bot.embed("💰 Coin", `La moneda aterrizó en **${coin}**.`, msg);
  }
}

module.exports = coinCommand;
