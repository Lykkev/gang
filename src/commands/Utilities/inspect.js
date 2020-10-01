const Command = require("../../structures/Command");

class inspectCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<invite:string>",
      description: "Devuelve información sobre una invitación de un servidor.",
    });
  }

  async run(msg, args) {
    // Gets the invite info
    const parser = /(https?:\/\/)?(www\.)?(discord\.(gg)|discord(app)?\.com\/invite)\/(.+)/.exec(args.join(" "));
    const invinfo = await this.bot.getInvite(parser ? parser[6] : args.join(" "), true).catch(() => {});
    if (!invinfo) return this.bot.embed("❌ Error", "Invitación invalida.", msg, "error");
    const fields = [];

    fields.push({
      name: "Server ID",
      value: invinfo.guild.id,
    });

    if (invinfo.channel) fields.push({
      name: "Canal",
      value: `#${invinfo.channel.name} (${invinfo.channel.id})`,
    });

    if (invinfo.inviter) fields.push({
      name: "Invitado por",
      value: `${invinfo.inviter ? invinfo.inviter.username : "Widget"}${invinfo.inviter ? "#" : ""}` +
        `${invinfo.inviter ? invinfo.inviter.discriminator : ""} (${invinfo.inviter ? invinfo.inviter.id : invinfo.guild.id})`,
    });

    if (invinfo.memberCount) fields.push({
      name: "Miembros",
      value: `${invinfo.memberCount} miembros, ${invinfo.presenceCount} conectados`,
    });

    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.color("general"),
        fields: fields,
        author: {
          icon_url: invinfo.guild.icon ? `https://cdn.discordapp.com/icons/${invinfo.guild.id}/${invinfo.guild.icon}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
          name: `${invinfo.guild.name} (${invinfo.code})`,
        },
        thumbnail: {
          url: invinfo.guild.icon ? `https://cdn.discordapp.com/icons/${invinfo.guild.id}/${invinfo.guild.icon}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = inspectCommand;
