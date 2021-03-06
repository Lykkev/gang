const Command = require("../../structures/Command");

class unloadCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["ul"],
      args: "<command:string>",
      description: "Descarga un comando.",
      allowdisable: false,
      owner: true,
    });
  }

  run(msg, args) {
    // FInds the command
    const cmd = this.bot.commands.find(c => c.id === args.join(" ").toLowerCase() || c.aliases.includes(args.join(" ").toLowerCase()));
    if (!cmd) return this.bot.embed("❌ Error", "No se proporcionó ningún **comando**.", msg, "error");

    // Deletes the cache
    delete require.cache[require.resolve(`../${cmd.category}/${cmd.id}`)];
    const index = this.bot.commands.indexOf(cmd);
    if (index !== -1) this.bot.commands.splice(index, 1);
    this.bot.embed("✅ Listo", `**${cmd.id}** fue descargado.`, msg, "success");
  }
}

module.exports = unloadCommand;
