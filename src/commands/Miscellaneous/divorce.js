const Command = require("../../structures/Command");
const yn = require("../../utils/ask").yesNo;

class divorceCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Termina tu matrimonio.",
    });
  }

  async run(msg) {
    // Gets marriage states
    const [state] = await this.bot.db.table("marriages").getAll(msg.author.id, { index: "marriages" }).run();
    if (!state) return this.bot.embed("❌ Error", "No estas casado con nadie.", msg, "error");

    // Waits for response
    const divorcemsg = await this.bot.embed("💔 Divorcio ", "¿Está seguro de que desea divorciarse de su espos@?", msg);
    const response = await yn(this.bot, { author: msg.author, channel: msg.channel });
    if (!response) return this.bot.embed.edit("💔 Divorcio ", "Divorcion Cancelado.", divorcemsg);

    // Divorces the users
    await this.bot.db.table("marriages").get(state.id).delete().run();
    this.bot.embed.edit("💔 Divorciad@", "Ya no estás casad@f.", divorcemsg);
  }
}

module.exports = divorceCommand;
