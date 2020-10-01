const Command = require("../../structures/Command");

class unverifyCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["ut", "untrust", "uv"],
      args: "<member:member&strict>",
      description: "Elimina el rol verificado de un miembro.",
      clientperms: "manageRoles",
      requiredperms: "manageRoles",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    // If no role or cfg
    if (!guildconfig || !guildconfig.verifiedRole) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
      }).run();

      return this.bot.embed("❌ Error", "El rol verificado no ha sido configurado todavía.", msg, "error");
    }

    // If member doesn't have the verified role
    if (!user.roles.includes(guildconfig.verifiedRole)) {
      return this.bot.embed("❌ Error", `**${user.username}** no tiene el rol verificado.`, msg, "error");
    }

    // Removes the role
    try {
      await user.removeRole(guildconfig.verifiedRole, `Unverified by ${this.bot.tag(msg.author, true)}`);
    } catch (err) {
      return this.bot.embed("❌ Error", `Ups, algo falló **${user.username}**.`, msg, "error");
    }

    this.bot.emit("memberUnverify", msg.channel.guild, msg.member, user);
    this.bot.embed("✅ Listo", `El rol verificado fue eliminado de **${user.username}**.`, msg, "success");
  }
}

module.exports = unverifyCommand;
