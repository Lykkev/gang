const Command = require("../../structures/Command");

class snipeCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["deletedmsg", "snipemsg"],
      description: "Envía el último mensaje eliminado en un canal.",
    });
  }

  async run(msg) {
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    // Sends if message sniping has been disabled
    if (guildconfig && guildconfig.snipingEnable === false) {
      return this.bot.embed(
        "❌ Error",
        `No se ha habilitado el snipe de mensajes.`,
        msg,
        "error",
      );
    }

    // If permission isn't public; member doesn't have the role
    if (guildconfig && guildconfig.snipingPermission && guildconfig.snipingPermission === false && guildconfig.staffRole && !msg.member.roles.includes(guildconfig.staffRole)) {
      return this.bot.embed("❌ Error", "No tiene el rol requerido para usar esto.", msg, "error");
    }

    // Gets the message to send
    const snipeMsg = this.bot.snipeData[msg.channel.id];
    if (!snipeMsg) return this.bot.embed("❌ Error", "No hay mensaje para snipe.", msg, "error");

    msg.channel.createMessage({
      embed: {
        description: snipeMsg.content,
        color: this.bot.embed.color("general"),
        timestamp: new Date(snipeMsg.timestamp),
        author: {
          name: snipeMsg.author ? `${snipeMsg.author} dijo...` : null,
          icon_url: snipeMsg.authorpfp ? snipeMsg.authorpfp : null,
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
        image: {
          url: snipeMsg.attachment,
        },
      },
    });
  }
}

module.exports = snipeCommand;
