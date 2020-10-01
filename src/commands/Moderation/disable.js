const Command = require("../../structures/Command");

class disableCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<item:string>",
      description: "Desactiva un comando o categoría.",
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
    const cmd = cmds.find(c => (c.id === command || c.aliases.includes(command)));
    const category = categories.find(c => c.toLowerCase() === command.toLowerCase());

    // If a category was found but not a command
    if (!cmd && category) {
      if (!guildconfig.disabledCategories) guildconfig.disabledCategories = [];

      // Prevents owner or general commands from being disabled
      if (category === "Owner" || category === "General") {
        return this.bot.embed("❌ Error", "Eso no está permitido para usted.", msg, "error");
      }

      // If a category is already disabled
      if (guildconfig.disabledCategories && guildconfig.disabledCategories.includes(category)) {
        return this.bot.embed("❌ Error", "Eso ya está desactivado.", msg, "error");
      }

      // Updates db
      guildconfig.disabledCategories.push(category);
      await this.bot.db.table("guildconfig").get(msg.channel.guild.id).update(guildconfig).run();
      this.bot.emit("categoryDisable", msg.channel.guild, msg.member, category);
      return this.bot.embed("✅ Listo", `La categoria **${category}** ha sido deshabilitada`, msg, "success");
    }

    // If not found or is already disabled
    if (!cmd) return this.bot.embed("❌ Error", "Ese comando / categoría no existe o no puede desactivarse.", msg, "error");
    if (!guildconfig.disabledCmds) guildconfig.disabledCmds = [];
    if (guildconfig.disabledCmds && guildconfig.disabledCmds.includes(cmd.id)) {
      return this.bot.embed("❌ Error", "Eso ya está desactivado.", msg, "error");
    }

    if (cmd) {
      // Updates db
      guildconfig.disabledCmds.push(cmd.id);
      await this.bot.db.table("guildconfig").get(msg.channel.guild.id).update(guildconfig).run();
      this.bot.emit("commandDisable", msg.channel.guild, msg.member, command);
      this.bot.embed("✅ Listo", `El comando **${cmd.id}** ha sido deshabilitado.`, msg, "success");
    } else {
      this.bot.embed("❌ Error", "Eso no está permitido inhabilitar.", msg, "error");
    }
  }
}

module.exports = disableCommand;
