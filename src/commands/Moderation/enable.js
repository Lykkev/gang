const Command = require("../../structures/Command");

class enableCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<item:string>",
      description: "Habilita un comando o categoría.",
      allowdisable: false,
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, [command]) {
    let guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();
    const cmds = this.bot.commands.filter(cmd => cmd.allowdisable);
    const categories = [];
    this.bot.commands.forEach(c => categories.includes(c.category) && c.category !== "Owner" ? "" : categories.push(c.category));

    if (!guildconfig) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
        disabledCmds: [],
        disabledCategories: [],
      }).run();

      guildconfig = { id: msg.channel.guild.id, disabledCmds: [], disabledCategories: [] };
    }

    // Looks for cmd/category
    const cmd = cmds.find(c => (c.id === command || c.aliases.includes(command)) && c.allowdisable);
    const category = categories.find(c => c.toLowerCase() === command.toLowerCase());

    // If there's no command, but a category
    if (!cmd && category) {
      if (!guildconfig.disabledCategories) guildconfig.disabledCategories = [];
      if (!guildconfig.disabledCategories.includes(category)) {
        return this.bot.embed("❌ Error", "Esa categoría ya está habilitada.", msg, "error");
      }

      // Updates DB
      guildconfig.disabledCategories.splice(guildconfig.disabledCategories.indexOf(category), 1);
      await this.bot.db.table("guildconfig").get(msg.channel.guild.id).update(guildconfig).run();
      this.bot.emit("categoryEnable", msg.channel.guild, msg.member, category);
      return this.bot.embed("✅ Listo", `La categoria **${category}** ha sido habilitado.`, msg, "success");
    }

    // If not found or is already enabled
    if (!cmd) return this.bot.embed("❌ Error", "Ese comando no existe.", msg, "error");
    if (!guildconfig.disabledCmds) guildconfig.disabledCmds = [];
    if (guildconfig.disabledCmds && !guildconfig.disabledCmds.includes(cmd.id)) {
      return this.bot.embed("❌ Error", "Ese comando no está desactivado.", msg, "error");
    }

    if (cmd) {
      // Updates db
      guildconfig.disabledCmds.splice(guildconfig.disabledCmds.indexOf(cmd.id), 1);
      await this.bot.db.table("guildconfig").get(msg.channel.guild.id).update(guildconfig).run();
      this.bot.emit("commandEnable", msg.channel.guild, msg.member, command);
      this.bot.embed("✅ Listo", `El comando **${cmd.id}** ha sido habilitado.`, msg, "success");
    } else {
      this.bot.embed("❌ Error", "Eso no existe o no está deshabilitado.", msg, "error");
    }
  }
}

module.exports = enableCommand;
