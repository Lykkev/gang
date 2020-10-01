const Command = require("../../structures/Command");

class iconCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["guildicon", "servericon"],
      description: "Envía el icono del servidor.",
    });
  }

  run(msg) {
    if (!msg.channel.guild.iconURL) this.bot.embed("❌ Error", "Este servidor no tiene un ícono.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: `🖼 ${msg.channel.guild.name}`,
        color: this.bot.embed.color("general"),
        image: {
          url: msg.channel.guild.iconURL,
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = iconCommand;
