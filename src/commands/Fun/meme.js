const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class memeCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["randommeme"],
      description: "Manda un meme random.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://meme-api.herokuapp.com/gimme").then(res => res.json().catch(() => {}));
    if (!body || !body.url) return this.bot.embed("❌ Error", "No se pudo enviar el meme. Vuelve a intentarlo más tarde.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🤣 Meme",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = memeCommand;
