const Command = require("../../structures/Command");

class gayCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[member:member&fallback]",
      description: "Calcula qué tan gay es un miembro.",
    });
  }

  run(msg, args, pargs) {
    const user = pargs[0].value;
    const random = Math.floor(Math.random() * 99) + 1;
    if (user.id === "647269760782041133") return this.bot.embed("🏳️‍🌈 Lesbiana", `**${user.username}** es la chica más alegre de todos los tiempos. 💜💙`, msg);
    else if (user.id === "719523922726617188") return this.bot.embed("🏳️‍🌈 Lesbiana", `**  ${user.username}** Es 1000000% gay y muy linda 💙💜`, msg);
    else this.bot.embed("🏳️‍🌈 Gay", `**${user.username}** es **${random}%** gay.`, msg);
  }
}

module.exports = gayCommand;
