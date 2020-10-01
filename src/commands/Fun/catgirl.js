const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class catgirlCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["neko"],
      description: "Envía una foto de una gata de anime.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekos.life/api/v2/img/neko").then(res => res.json().catch(() => {}));
    if (!body || !body.url) return this.bot.embed("❌ Error", "No se pudo enviar la imagen. Vuelve a intentarlo más tarde.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🐾 Catgirl",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)} | Powered by nekos.life`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = catgirlCommand;
