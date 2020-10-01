const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class warningsCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["punishments", "strikes", "warns", "warnings"],
      args: "<member:member&fallback>",
      description: "Muestra qué advertencias tiene un miembro.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const warnings = await this.bot.db.table("warnings").filter({
      receiver: user.id,
      guild: msg.channel.guild.id,
    }).run();

    if (!warnings.length) return this.bot.embed("❌ Error", `**${user.username}** no tiene advertencias.`, msg, "error");

    // Uploads to hasteb.in if over 20
    if (warnings.length > 20) {
      const warnstring = `${warnings.map(w => `${w.id} (by ${this.bot.tag(msg.channel.guild.members.get(w.giver) ||
          { username: `Unknown User (${w.giverId})`, discriminator: "0000" })})\n${w.reason}`).join("\n\n")}`;

      const body = await fetch("https://hasteb.in/documents", {
        referrer: "https://hasteb.in/",
        body: warnstring,
        method: "POST",
        mode: "cors",
      }).then(res => res.json().catch(() => {}));

      return this.bot.embed(
        "❌ Error",
        `**${user.username}** tiene más de 20 advertencias. Véanlos [Aquí](https://hasteb.in/${body.key}).`,
        msg,
        "error",
      );
    }

    msg.channel.createMessage({
      embed: {
        title: `⚠ ${user.username} tiene ${warnings.length} advertencia${warnings.length === 1 ? "" : "s"}.`,
        color: this.bot.embed.color("general"),
        fields: warnings.map(m => ({
          name: `${m.id} - de **${msg.channel.guild.members.get(m.giver) ? msg.channel.guild.members.get(m.giver).username : m.giver}**`,
          value: `${m.reason.slice(0, 150) || "No se ha dado ninguna razón."}`,
        })),
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = warningsCommand;
