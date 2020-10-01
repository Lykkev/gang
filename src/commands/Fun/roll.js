const Command = require("../../structures/Command");

class diceCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["rolldie", "dado"],
      description: "Lanza un dado de seis caras.",
      allowdms: true,
    });
  }

  run(msg) {
    const num = Math.floor(Math.random() * 6) + 1;
    this.bot.embed("🎲 Roll", `Sacaste un **${num}**.`, msg);
  }
}

module.exports = diceCommand;
