const Command = require("../../structures/Command");

class removewarnCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["removepunish", "rmpunish", "removestrike", "removestrikes", "rmstrike", "rw", "rmwarn", "removewarning", "removewarnings"],
      args: "<id:string>",
      description: "Elimina una o más advertencias.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    // Maps the points
    const warnings = await Promise.all(args.map(async id => {
      if (!id) {
        return { removed: false, warning: id };
      }

      // Gets the warnings in the database
      const warning = await this.bot.db.table("warnings").get(id).run();
      if (!warning || warning.guild !== msg.channel.guild.id) {
        return { removed: false, warning: id };
      }

      // Deletes the warnings
      await this.bot.db.table("warnings").get(id).delete().run();
      return { removed: true, warning: id };
    }));

    // Sets amount of warnings removed / failed
    const removed = warnings.filter(w => w.removed);
    const failed = warnings.filter(w => !w.removed);

    if (!removed.length) {
      return this.bot.embed("❌ Error", "No se pudieron eliminar las advertencias dadas.", msg, "error");
    }

    this.bot.emit("warningRemove", msg.channel.guild, msg.member, removed.map(w => `\`${w.warning}\``));

    msg.channel.createMessage({
      embed: {
        title: `⚠ Eliminado ${removed.length} advertencia${removed.length === 1 ? "" : "s"}.`,
        description: `${removed.map(w => w.warning).join(", ")}`,
        color: this.bot.embed.color("general"),
        fields: failed.length ? [{
          name: "No se han eliminado algunas advertencias.",
          value: `${failed.map(w => w.warning).join(", ")}`,
        }] : [],
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = removewarnCommand;
