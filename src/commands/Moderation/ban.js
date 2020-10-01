const Command = require("../../structures/Command");
const hierarchy = require("../../utils/hierarchy");
const yn = require("../../utils/ask").yesNo;

class banCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["b"],
      args: "<member:member&strict> [reason:string]",
      description: "Banea a un miembro del servidor.",
      clientperms: "banMembers",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let reason = args.slice(1).join(" ");
    if (!reason.length) reason = "Sin motivo proporcionado.";
    else if (reason.length > 512) reason = reason.slice(0, 512);

    // If bot doesn't have high enough role
    if (!hierarchy(msg.channel.guild.members.get(this.bot.user.id), user)) {
      return this.bot.embed("❌ Error", `No tengo un rol lo suficientemente alto para prohibir a **${user.username}**.`, msg, "error");
    }

    // Asks for confirmation
    if (hierarchy(msg.member, user)) {
      const banmsg = await this.bot.embed("🔨 Ban", `¿Estás seguro de que te gustaría banear a **${user.username}**?`, msg);
      const response = await yn(this.bot, { author: msg.author, channel: msg.channel });
      if (!response) return this.bot.embed.edit("🔨 Ban", `Ban cancelado **${user.username}**.`, banmsg);

      try {
        await user.ban(1, `${reason} (by ${this.bot.tag(msg.author, true)})`);
      } catch (err) {
        return this.bot.embed.edit("❌ Error", `No se pudo banear **${user.username}**.`, banmsg, "error");
      }

      // Tries to DM banned user
      const dmchannel = await user.user.getDMChannel().catch(() => {});
      dmchannel.createMessage({
        embed: {
          title: `🚪 Baneado de ${msg.channel.guild.name}`,
          description: `Fuiste prohibido por \`${reason}\`.`,
          color: this.bot.embed.color("general"),
        },
      }).catch(() => {});

      this.bot.embed.edit("🔨 Ban", `**${user.username}** fue prohibido por **${msg.author.username}**.`, banmsg);
    }
  }
}

module.exports = banCommand;
