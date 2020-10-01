const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class kissCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["besar"],
      args: "<member:member>",
      description: "Besa a un miembro.",
      cooldown: 3,
    });
  }

  async run(msg, args, pargs) {
    const body = await fetch("https://api.weeb.sh/images/random?type=kiss", {
      headers: {
        "Authorization": `Wolke ${this.bot.key.weebsh}`,
        "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
      },
    }).then(res => res.json().catch(() => {}));
    let gifs = ['https://cdn.weebs.cl/images/nBKORJtt.gif', 'https://cdn.weebs.cl/images/LuCXvYtM.gif', 'https://cdn.weebs.cl/images/K2xSjYCe.gif', 'https://cdn.weebs.cl/images/zBgH65RO.gif', 'https://cdn.weebs.cl/images/yWmkNP6X.gif', 'https://cdn.weebs.cl/images/wdelc2Qz.gif', 'https://cdn.weebs.cl/images/DuxJnpyB.gif', 'https://cdn.weebs.cl/images/iYwUWaDS.gif', 'https://cdn.weebs.cl/images/WVKVS2XA.gif', 'https://cdn.weebs.cl/images/OqBuvtLh.gif', 'https://cdn.weebs.cl/images/C9QERWKj.gif', 'https://cdn.weebs.cl/images/bxHnbQPJ.gif', 'https://cdn.weebs.cl/images/GQkjmNCw.gif', 'https://cdn.weebs.cl/images/009zFUt0.gif', 'https://cdn.weebs.cl/images/zoiAeVi8.gif', 'https://cdn.weebs.cl/images/sv7eQBqu.gif', 'https://cdn.weebs.cl/images/yWmkNP6X.gif', 'https://cdn.weebs.cl/images/bxHnbQPJ.gif', 'https://cdn.weebs.cl/images/G_ZyE-rA.gif', 'https://cdn.weebs.cl/images/EJkuJIA5.gif', 'https://cdn.weebs.cl/images/WIaoLIzg.gif', 'https://cdn.weebs.cl/images/oUiAFsDZ.gif', 'https://cdn.weebs.cl/images/NosMSBf2.gif'] /* Creamos un array con los GIFS que pueden salir */
    let image = gifs[Math.floor(Math.random() * gifs.length)]
    msg.channel.createMessage({
      embed: {
        description: `💙 **${msg.author.username}** besó a **${pargs[0].value.username}**!`,
        color: this.bot.embed.color("general"),
        image: {
          url: image,
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)} `,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = kissCommand;
