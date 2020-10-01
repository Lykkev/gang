const Command = require("../../structures/Command");

class removepointCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["removemerit", "removemerits", "removepoint", "removepoints", "rmmerit", "rmmerits", "rmpoint", "rmpoints"],
      args: "<id:string>",
      description: "Elimina uno o más puntos de reputación de un miembro.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    // Maps the points
    const points = await Promise.all(args.map(async id => {
      if (!id) {
        return { removed: false, point: id };
      }

      // Gets the points in the database
      const point = await this.bot.db.table("points").get(id).run();
      if (!point || point.guild !== msg.channel.guild.id) {
        return { removed: false, point: id };
      }

      // Deletes the points
      await this.bot.db.table("points").get(id).delete().run();
      return { removed: true, point: id };
    }));

    // Sets amount of IDs removed / failed
    const removed = points.filter(p => p.removed);
    const failed = points.filter(p => !p.removed);

    if (!removed.length) {
      return this.bot.embed("❌ Error", "Ningún punto de reputación dado podría ser eliminado.", msg, "error");
    }

    this.bot.emit("pointRemove", msg.channel.guild, msg.member, removed.map(p => `\`${p.point}\``));

    msg.channel.createMessage({
      embed: {
        title: `✨ Removed ${removed.length} point${removed.length === 1 ? "" : "s"}.`,
        description: `${removed.map(p => p.point).join(", ")}`,
        color: this.bot.embed.color("general"),
        fields: failed.length ? [{
          name: "No se han eliminado algunos puntos.",
          value: `${failed.map(p => p.point).join(", ")}`,
        }] : [],
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = removepointCommand;
