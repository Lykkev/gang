const Command = require("../../structures/Command");

class unbanCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["idunban", "ub", "unbanid"],
      args: "<userids:string>",
      description: "Desbanea a un miembro por su ID.",
      clientperms: "banMembers",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    // Only 10 IDs can be unbanned at a time
    if (args.length > 10) return this.bot.embed("❌ Error", "Sólo se pueden desbanear 10 ID a la vez..", msg, "error");

    // Attempts to unban
    const unbans = await Promise.all(args.map(async user => {
      try {
        await msg.channel.guild.unbanMember(user, `Desbaneado por ${this.bot.tag(msg.author, true)}`);
        return { unbanned: true, user: user };
      } catch (err) {
        return { unbanned: false, user: user };
      }
    }));

    // Sets amount of IDs unbanned / failed
    const unbanned = unbans.filter(b => b.unbanned);
    const failed = unbans.filter(b => !b.unbanned);
    if (!unbanned.length) return this.bot.embed("❌ Error", "No se desbanearon todas las identificaciones dadas.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: `⚒ Desbaneado ${unbanned.length} ID${unbanned.length > 1 ? "s" : ""}.`,
        description: `**${unbanned.map(m => m.user).join(", ")}**`,
        color: this.bot.embed.color("general"),
        fields: failed.length ? [{
          name: `${failed.length} ID${failed.length > 1 ? "s" : ""} no se pudieron desbanear.`,
          value: `${failed.map(m => m.user).join(", ")}`,
        }] : [],
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = unbanCommand;
