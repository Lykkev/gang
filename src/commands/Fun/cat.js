const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class catCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["kitten", "kitty", "randomcat"],
      description: "Envía una imagen de gato al azar.",
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg) {
    const body = await fetch("http://aws.random.cat/meow").then(res => res.json().catch(() => {}));
    if (!body || !body.file) return this.bot.embed("❌ Error", "No se pudo enviar la imagen. Inténtelo de nuevo más tarde.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🐱 Cat",
        color: this.bot.embed.color("general"),
        image: {
          url: body.file,
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)} | Powered by random.cat`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = catCommand;
