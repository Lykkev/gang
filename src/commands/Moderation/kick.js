const Command = require("../../structures/Command");
const hierarchy = require("../../utils/hierarchy");
const yn = require("../../utils/ask").yesNo;

class kickCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["k"],
      args: "<member:member&strict> [string:reason]",
      description: "Expulsar a un miembro del servidor.",
      clientperms: "kickMembers",
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
      return this.bot.embed("❌ Error", `No tengo un rol lo suficientemente alto para expulsar a **${user.username}**.`, msg, "error");
    }

    // If author passes hierarchy
    if (hierarchy(msg.member, user)) {
      // Asks for confirmation
      const kickmsg = await this.bot.embed("🔨 Kick", `¿Estás seguro de que te gustaría expulsar? a **${user.username}**?`, msg);
      const response = await yn(this.bot, { author: msg.author, channel: msg.channel });
      if (!response) return this.bot.embed.edit("🔨 Kick", `Expulsion cancelada **${user.username}**.`, kickmsg);

      try {
        await user.kick(`${reason} (by ${this.bot.tag(msg.author, true)})`);
      } catch (err) {
        return this.bot.embed.edit("❌ Error", `No se pudo expulsar **${user.username}**.`, kickmsg, "error");
      }

      // Tries to DM kicked user
      const dmchannel = await user.user.getDMChannel().catch(() => {});
      dmchannel.createMessage({
        embed: {
          title: `🚪 Expulsado de ${msg.channel.guild.name}`,
          description: `Fuiste expulsado por \`${reason}\`.`,
          color: this.bot.embed.color("general"),
        },
      }).catch(() => {});

      this.bot.emit("guildKick", msg.channel.guild, reason, msg.member, user);
      await this.bot.embed.edit("🔨 Kick", `**${user.username}** fue expulsado por **${msg.author.username}**.`, kickmsg);
    }
  }
}

module.exports = kickCommand;
