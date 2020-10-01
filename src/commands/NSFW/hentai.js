const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class hentaiCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Envía una imagen hentai al azar.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekos.life/api/v2/img/solo").then(res => res.json().catch(() => {}));
    if (!body || !body.url) return this.bot.embed("❌ Error", "No pude enviar la imagen. Inténtalo de nuevo más tarde..", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🔞 Hentai",
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

module.exports = hentaiCommand;
