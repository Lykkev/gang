const Command = require("../../structures/Command");

class bioCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["addbio", "clearbio", "removebio", "rmbio", "userbio"],
      args: "[bio:string] [clear:string] [member:member]",
      description: "Establece una biografía personalizada para mostrar en su perfil.",
    });
  }

  async run(msg, args) {
    // Other user's bios
    const user = this.bot.args.argtypes.member(args.join(" "), msg);
    if (user) {
      const cfg = await this.bot.db.table("userconfig").get(user.id).run();
      return cfg && cfg.bio ?
        this.bot.embed("👤 Bio", `**${user.username}** tu biografía es \`${cfg.bio}\`.`, msg) :
        this.bot.embed("❌ Error", `**${user.username}** no tiene una biografía.`, msg, "error");
    }

    // Bio limit
    if (args.join(" ").length > 120) return this.bot.embed("❌ Error", "La longitud máxima de la biografía es 120.", msg, "error");
    let cfg = await this.bot.db.table("userconfig").get(msg.author.id).run();
    if (!args.length && (!cfg || !cfg.bio)) return this.bot.embed("❌ Error", "No proporcionaste una biografía.", msg, "error");

    // Shows the bio
    else if (!args.length && cfg && cfg.bio) return this.bot.embed("👤 Bio", `Tu biografía es actualmente \`${cfg.bio}\`.`, msg);
    if (!cfg) { cfg = { id: msg.author.id, bio: null }; }
    await this.bot.db.table("userconfig").insert(cfg).run();

    // Bio clearing
    if (["clear", "delete", "remove"].includes(args.join(" ").toLowerCase())) {
      cfg.bio = null;
      await this.bot.db.table("userconfig").get(msg.author.id).update(cfg).run();
      return this.bot.embed("👤 Bio", "Tu biografía ha sido borrada.", msg);
    }

    // Sets bio; blocks ads
    cfg.bio = args.join(" ");
    if (/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|list)|discord(app)?\.com\/invite)\/.+[a-z]/.test(cfg.bio)) {
      return this.bot.embed("❌ Error", "Tu biografía incluyó un anuncio.", msg, "error");
    }

    // Updates userconfig
    await this.bot.db.table("userconfig").get(msg.author.id).update(cfg).run();
    this.bot.embed("👤 Bio", `Tu biografía se estableció en \`${cfg.bio}\`.`, msg);
  }
}

module.exports = bioCommand;
