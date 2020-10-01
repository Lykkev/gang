const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class dogCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["puppy", "randomdog"],
      description: "Envía una foto de perro al azar.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("https://random.dog/woof.json").then(res => res.json().catch(() => {}));
    if (!body || !body.url) return this.bot.embed("❌ Error", "No se pudo enviar la imagen. Vuelve a intentarlo más tarde.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🐶 Dog",
        color: this.bot.embed.color("general"),
        image: {
          url: body.url,
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)} | Powered by random.dog`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = dogCommand;
