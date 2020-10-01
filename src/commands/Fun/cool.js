const Command = require("../../structures/Command");

class coolCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["coolness", "howcool"],
      args: "[member:member&fallback]",
      description: "Calcula lo genial que es un miembro.",
    });
  }

  run(msg, args, pargs) {
    const user = pargs[0].value;
    const random = Math.floor(Math.random() * 99) + 1;
    this.bot.embed("😎 Cool", `**${user.username}** es **${random}%** cool.`, msg);
  }
}

module.exports = coolCommand;
