const Command = require("../../structures/Command");

class bannerCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Envía el banner del servidor.",
    });
  }

  run(msg) {
    if (!msg.channel.guild.banner) return this.bot.embed("❌ Error", "Este servidor no tiene banner.", msg, "error");

    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.color("general"),
        author: {
          icon_url: msg.channel.guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: msg.channel.guild.name,
        },
        image: {
          url: msg.channel.guild.dynamicBannerURL(),
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = bannerCommand;
