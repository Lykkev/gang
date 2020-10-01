const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class pussyCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["irlpussy"],
      description: "Envía una foto de una vagina de NSFW IRL.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://nekobot.xyz/api/image?type=pussy").then(res => res.json().catch(() => {}));
    if (!body || !body.message) return this.bot.embed("❌ Error", "No pude enviar la imagen. Inténtalo de nuevo más tarde..", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🔞 Pussy",
        color: this.bot.embed.color("general"),
        image: {
          url: body.message,
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)} | Powered by api.nekobot.xyz`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = pussyCommand;
