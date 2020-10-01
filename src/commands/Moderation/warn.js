const { Snowflake } = require("../../utils/snowflake");
const Command = require("../../structures/Command");

class warnCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["punish", "s", "strike", "w", "warn"],
      args: "<member:member&strict> [reason:string]",
      description: "Da a un miembro una advertencia.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    // Generates the id
    const id = Snowflake();
    const user = pargs[0].value;
    let reason = args.slice(1).join(" ");
    if (reason.length > 512) reason = reason.slice(0, 512);

    // Inserts info
    await this.bot.db.table("warnings").insert({
      giver: msg.author.id,
      receiver: user.id,
      guild: msg.channel.guild.id,
      id: id,
      reason: reason || "No se ha dado ninguna razón.",
    }).run();

    // Tries to DM user about their warning
    const dmchannel = await user.user.getDMChannel().catch(() => {});
    dmchannel.createMessage({
      embed: {
        title: `⚠ Advertido en ${msg.channel.guild.name}`,
        description: `Fuiste advertido por ${reason ? `\`${reason}\`` : "No se ha dado ninguna razón."}`,
        color: this.bot.embed.color("error"),
        footer: {
          text: `Advertido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    }).catch(() => {});

    this.bot.emit("memberWarn", msg.channel.guild, msg.member, user, id, reason || "No se ha dado ninguna razón.");
    this.bot.embed("✅ Listo", `**${user.username}** se le dio una advertencia ${reason.length ? ` por \`${reason}\`.` : "."}`, msg, "success");
  }
}

module.exports = warnCommand;
