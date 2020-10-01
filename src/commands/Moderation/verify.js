const Command = require("../../structures/Command");

class verifyCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["t", "trust", "v"],
      args: "<member:member&strict>",
      description: "Da el rol verificado a un miembro.",
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

    // If member already has verified role
    if (user.roles.includes(guildconfig.verifiedRole)) {
      return this.bot.embed("❌ Error", `**${user.username}** ya tiene el rol verificado.`, msg, "error");
    }

    // Adds the role
    try {
      await user.addRole(guildconfig.verifiedRole, `Verificado por ${this.bot.tag(msg.author, true)}`);
    } catch (err) {
      return this.bot.embed("❌ Error", `Fallo la verificación **${this.bot.tag(user.username)}**.`, msg, "error");
    }

    this.bot.emit("memberVerify", msg.channel.guild, msg.member, user);
    this.bot.embed("✅ Listo", `El rol verificado se le dio a **${user.username}**.`, msg, "success");
  }
}

module.exports = verifyCommand;
