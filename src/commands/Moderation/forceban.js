const Command = require("../../structures/Command");
const hierarchy = require("../../utils/hierarchy");
const yn = require("../../utils/ask").yesNo;

class forcebanCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["banid", "fb", "hackban", "hb", "idban"],
      args: "<userids:string>",
      description: "Prohíbe a un miembro que no está en el servidor.",
      clientperms: "banMembers",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    // Asks for confirmation
    if (args.length > 10) return this.bot.embed("❌ Error", "Solo se pueden banear 10 ID a la vez.", msg, "error");
    const forcebanmsg = await this.bot.embed("⚒ Forceban", `¿Estás seguro de que te gustaría forzar el baneo? **${args.join(", ")}**?`, msg);
    const response = await yn(this.bot, { author: msg.author, channel: msg.channel });
    if (!response) return this.bot.embed.edit("⚒ Forceban", `Baneo forzado cancelado **${args.join(", ")}**.`, forcebanmsg);

    // Tries to ban the IDs
    const bans = await Promise.all(args.map(async user => {
      const presentMember = msg.channel.guild.members.find(mem => mem.id === user);
      if (presentMember) {
        // Checks role hiearchy
        if (!hierarchy(msg.member, presentMember)) { return { banned: false, user: user }; }
        try {
          // Bans the present member
          await presentMember.ban(0, `Baneo forzado por ${this.bot.tag(msg.author, true)}`);
          return { banned: true, user: user };
        } catch (err) {
          return { banned: false, user: user };
        }
      }

      try {
        // Bans the IDs
        await msg.channel.guild.banMember(user, 0, `Baneo forzado por ${this.bot.tag(msg.author, true)}`);
        return { banned: true, user: user };
      } catch (err) {
        return { banned: false, user: user };
      }
    }));

    // Sets amount of IDs banned / failed
    const banned = bans.filter(b => b.banned);
    const failed = bans.filter(b => !b.banned);
    if (!banned.length) return this.bot.embed.edit("❌ Error", "No se pudieron prohibir todos los ID proporcionados.", forcebanmsg, "error");

    await forcebanmsg.edit({
      embed: {
        title: `⚒ Force Banned ${banned.length} ID${banned.length > 1 ? "s" : ""}.`,
        description: `**${banned.map(m => m.user).join(", ")}**`,
        color: this.bot.embed.color("general"),
        fields: failed.length ? [{
          name: `${failed.length} ID${failed.length > 1 ? "s" : ""} no pudo ser baneado.`,
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

module.exports = forcebanCommand;
