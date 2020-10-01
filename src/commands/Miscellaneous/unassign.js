const Command = require("../../structures/Command");

class unassignCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["removerole", "iamnot"],
      args: "<role:role>",
      description: "Te quita un rol asignable.",
      clientperms: "manageRoles",
    });
  }

  async run(msg, args, pargs) {
    const role = pargs[0].value;
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    if (!guildconfig || !guildconfig.assignableRoles || !guildconfig.assignableRoles.length) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
        assignableRoles: [],
      }).run();
    }

    const assignable = guildconfig.assignableRoles.includes(role.id);

    // Removes the role
    if (assignable) {
      try {
        await msg.member.removeRole(role.id, "Self-assignable role");
      } catch (err) {
        return this.bot.embed("❌ Error", "No se pudo quitar el rol de usted.", msg, "error");
      }

      this.bot.emit("roleUnassign", msg.channel.guild, msg.member, role);
      this.bot.embed("✅ Listo", `El **${role.name}** rol fue eliminado de ti.`, msg, "success");
    } else if (!assignable) {
      return this.bot.embed("❌ Error", "Ese no es un rol asignable.", msg, "error");
    }
  }
}

module.exports = unassignCommand;
