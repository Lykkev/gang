const Command = require("../../structures/Command");

class setassignableCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["addassign", "addassignable", "addassignablerole", "assignablerole", "makeassign", "makeassignable"],
      args: "<role:role>",
      description: "Establece un rol que se puede asignar.",
      requiredperms: "manageRoles",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const role = pargs[0].value;

    // Prevents assignable integration roles
    if (role.managed) return this.bot.embed("❌ Error", "Ese rol no puede ser asignado.", msg, "error");
    let guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    // If no guildconfig
    if (!guildconfig || !guildconfig.assignableRoles || !guildconfig.assignableRoles.length) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
        assignableRoles: [],
      }).run();

      guildconfig = { id: msg.channel.guild.id, assignableRoles: [] };
    }

    // Updates the guildconfig
    if (!guildconfig.assignableRoles.includes(role.id)) {
      guildconfig.assignableRoles.push(role.id);
      await this.bot.db.table("guildconfig").get(msg.channel.guild.id).update(guildconfig).run();
      this.bot.emit("setAssignable", msg.channel.guild, msg.member, role);
      this.bot.embed("✅ Listo", `**${role.name}** ahora puede ser asignado usando el comando de asignación.`, msg, "success");
    } else {
      return this.bot.embed("❌ Error", `**${role.name}** ya es asignable.`, msg, "error");
    }
  }
}

module.exports = setassignableCommand;
