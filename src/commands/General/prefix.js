const Command = require("../../structures/Command");

class prefixCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[prefix:string]",
      descriptiom: "Visualiza o cambia el prefijo del bot.",
      allowdisable: false,
    });
  }

  async run(msg, args) {
    // Looks for custom prefix
    const prefix = args.join(" ").trim();
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    if (!args.length && (!guildconfig || !guildconfig.prefix)) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
        prefix: this.bot.config.prefixes[0],
      }).run();

      return this.bot.embed("🤖 Prefix", `El prefijo en este servidor es\`${this.bot.config.prefixes[0]}\`.`, msg);
    }

    // If there's a prefix & no args
    if (!args.length) return this.bot.embed("🤖 Prefix", `El prefijo en este servidor es \`${guildconfig.prefix}\`.`, msg);

    // If no guildconfig
    if (!guildconfig || !guildconfig.prefix) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
        prefix: this.bot.config.prefixes[0],
      }).run();
    }

    if (prefix.length > 15) return this.bot.embed("❌ Error", "La longitud máxima del prefijo es de 15 caracteres.", msg, "error");

    // Lets members without permission check but not set
    if (!msg.member.permission.has("manageGuild")) {
      return this.bot.embed("❌ Error", "No tienes permiso para establecer el prefijo.", msg, "error");
    }

    // Updates DB
    await this.bot.db.table("guildconfig").get(msg.channel.guild.id).update({
      id: msg.channel.guild.id,
      prefix: prefix,
    }).run();

    this.bot.emit("prefixUpdate", msg.channel.guild, msg.member, prefix);
    this.bot.embed("✅ Listo", `El prefijo se estableció en \`${prefix}\`.`, msg, "success");
  }
}

module.exports = prefixCommand;
