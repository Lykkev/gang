const Command = require("../../structures/Command");

class removecommandCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["delcmd", "delcommand", "deletecmd", "deletecommand", "removecmd"],
      args: "[command:string]",
      description: "Elimina un comando personalizado.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    // List of custom commands
    if (!args.length && guildconfig && guildconfig.customCommands.length) {
      return this.bot.embed("✨ Commandos Personalizados", `${guildconfig.customCommands.map(cmd => `\`${cmd.name}\``).join(", ")}`, msg);
    }

    if (!args.length && !guildconfig || !guildconfig || args.length && guildconfig && !guildconfig.customCommands) {
      return this.bot.embed("❌ Error", "Este servidor no tiene comandos personalizados.", msg, "error");
    }

    // Find the custom command
    const name = args[0];
    const command = guildconfig.customCommands.find(cmd => cmd.name === name);
    if (!command) return this.bot.embed("❌ Error", `El comando personalizado **${name}** no existe.`, msg, "error");

    // Deletes the command
    guildconfig.customCommands.splice(guildconfig.customCommands.indexOf(command), 1);
    await this.bot.db.table("guildconfig").get(msg.guild.id).update(guildconfig).run();
    this.bot.emit("commandRemove", msg.channel.guild, msg.author, name);
    this.bot.embed("✅ Listo", `Comando eliminado con éxito **${name}**.`, msg, "success");
  }
}

module.exports = removecommandCommand;
