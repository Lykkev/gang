const Command = require("../../structures/Command");
const yn = require("../../utils/ask").yesNo;

class marryCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["propose"],
      args: "<member:member>",
      description: "Propone a otro miembro.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const state = await this.bot.db.table("marriages").getAll(msg.author.id, user.id, { index: "marriages" }).run();

    // If author is married
    if (state.find(m => m.id === msg.author.id || m.spouse === msg.author.id)) {
      return this.bot.embed("❌ Error", "Ya estas casad@", msg, "error");
    }

    // If mentioned user is married
    if (state.find(m => m.id === user.id || m.spouse === user.id)) {
      return this.bot.embed("❌ Error", `**${user.username}** Ya esta casad@`, msg, "error");
    }

    // Waits for a response
    const marrymsg = await this.bot.embed("💝 Marry", `**${user.username}**, quieres casarte con **${msg.author.username}**?`, msg);
    const response = await yn(this.bot, { author: user, channel: msg.channel });

    if (response) {
      await this.bot.db.table("marriages").insert({ id: msg.author.id, spouse: user.id }).run();
      this.bot.embed.edit("💝 Marry", `**${msg.author.username}** y **${user.username}** Ahora están casados.`, marrymsg);
    } else {
      this.bot.embed.edit("💝 Marry", "Matrimonio cancelado.", marrymsg);
    }
  }
}

module.exports = marryCommand;
