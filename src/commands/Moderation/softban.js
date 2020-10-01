const Command = require("../../structures/Command");
const hierarchy = require("../../utils/hierarchy");
const yn = require("../../utils/ask").yesNo;

class softbanCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["sb"],
      args: "<member:member> [string:reason]",
      description: "Banea a un miembro del servidor sin borrar ningún mensaje.",
      clientperms: "banMembers",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let reason = args.slice(1).join(" ");
    if (!reason.length) reason = "No se ha dado ninguna razón.";
    else if (reason.length > 512) reason = reason.slice(0, 512);

    // If bot doesn't have high enough role
    if (!hierarchy(msg.channel.guild.members.get(this.bot.user.id), user)) {
      return this.bot.embed("❌ Error", `No tengo un rol lo suficientemente alto como para hacerle softban a **${user.username}**.`, msg, "error");
    }

    // If author passes hierarchy
    if (hierarchy(msg.member, user)) {
      // Asks for confirmation
      const softbanmsg = await this.bot.embed("🔨 Softban", `¿Estás seguro de que te gustaría banear a **${user.username}**?`, msg);
      const response = await yn(this.bot, { author: msg.author, channel: msg.channel });
      if (!response) return this.bot.embed.edit("🔨 Softban", `Softbanning cancelado**${user.username}**.`, softbanmsg);

      // Tries to ban the user; deletes no messages
      try {
        await user.ban(0, `${reason} (by ${this.bot.tag(msg.author, true)})`).catch(() => {});
      } catch (err) {
        return this.bot.embed.edit("❌ Error", `Fallo el softban **${user.username}**.`, softbanmsg, "error");
      }

      // Tries to DM banned user
      const dmchannel = await user.user.getDMChannel().catch(() => {});
      dmchannel.createMessage({
        embed: {
          title: `🚪 Baneado de ${msg.channel.guild.name}`,
          description: `Fuiste baneado por \`${reason}\`.`,
          color: this.bot.embed.color("general"),
        },
      }).catch(() => {});

      this.bot.embed.edit("🔨 Softban", `**${user.username}** fue baneado por **${msg.author.username}**.`, softbanmsg);
    }
  }
}

module.exports = softbanCommand;
