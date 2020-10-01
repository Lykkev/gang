const Command = require("../../structures/Command");
const yn = require("../../utils/ask").yesNo;

class purgeCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["clear", "delete", "nuke", "p"],
      args: "<amount:string> [member:member&strict]",
      description: "Borrar una cierta cantidad de mensajes",
      requiredperms: "manageMessages",
      staff: true,
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    let author;
    const amount = args[0];
    pargs[1] && pargs[1].value ? author = pargs[1].value.user.id : author = null;

    // Checks purge amount and member to purge
    if (isNaN(amount)) return this.bot.embed("❌ Error", "No se proporcionó ninguna **cantidad válida**.", msg, "error");
    if (amount <= 0) return this.bot.embed("❌ Error", "No puedes borrar menos de un mensaje.", msg, "error");
    if (amount > 100) return this.bot.embed("❌ Error", "Sólo puedes borrar hasta 100 mensajes a la vez.", msg, "error");

    // Waits for a response
    const purgemsg = await this.bot.embed("💣 Purge", `¿Estás seguro de que quieres borrar **${amount}** mensajes?`, msg);
    const resp = await yn(this.bot, { author: msg.author, channel: msg.channel }, true);
    if (!resp) return this.bot.embed.edit("💣 Purge", "La purga se canceló.", purgemsg);

    // Gets the messages to purge
    if (resp && resp.response === true) {
      if (resp.msg) resp.msg.delete();
      // Add 2 to account for response & the message that ran the command
      const messages = await msg.channel.getMessages(parseInt(amount) + 2);
      const toPurge = await messages.filter(m => {
        if (author && m.author.id !== author) return false;
        if (author && m.author.id === author) return true;
        return true;
      }).map(m => m.id);

      // Deletes the messages
      this.bot.deleteMessages(msg.channel.id, toPurge, `Purgado por ${this.bot.tag(msg.author, true)}`).catch(() => {});

      // TODO: add amnt that failed
      const finalmsg = await this.bot.embed("💣 Purge", `**${amount}** los mensajes fueron purgados por **${msg.author.username}**.`, msg);
      setTimeout(() => { finalmsg.delete().catch(() => {}); }, 4000);
    } else return this.bot.embed.edit("💣 Purge", "La purga se canceló.", purgemsg);
  }
}

module.exports = purgeCommand;
