const Command = require("../../structures/Command");
const waitFor = require("../../utils/waitFor");

class embedCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["embedmessage", "embedmsg", "rembed", "richembed"],
      description: "Crea un embed personalizado.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    const emojis = [];
    const emojiactions = {
      "🇦": "title",
      "🇧": "description",
      "🖼": "image.url",
      "📷": "thumbnail.url",
      "👤": "author.name",
      "📸": "author.icon_url",
      "💬": "footer.text",
      "🎥": "footer.icon_url",
      "🖍": "color",
      "📅": "timestamp",
      "✅": "hibiki:done",
      "❌": "hibiki:cancel",
    };

    const emojilabels = {
      "title": "Título",
      "description": "Descripción",
      "image.url": "Link de la imagen",
      "thumbnail.url": "Miniatura",
      "author.name": "Texto del autor",
      "author.icon_url": "Imagen del autor",
      "footer.text": "Texto de pie de página",
      "footer.icon_url": "Imagen de pie de página",
      "color": "Color",
      "timestamp": "Tiempo",
      "hibiki:done": "Hecho",
      "hibiki:cancel": "Cancelado",
    };

    const emojidescriptions = {
      "title": "Título de la inserción.",
      "description": "Texto principal del embed.",
      "image.url": "Imagen grande del embed.",
      "thumbnail.url": "Miniatura del embed.",
      "author.name": "Texto en la esquina izquierda.",
      "author.icon_url": "Imagen en la esquina izquierda.",
      "footer.text": "Texto en la parte inferior.",
      "footer.icon_url": "Imagen en la parte inferior.",
      "color": "Color hexagonal del embed.",
      "timestamp": "Agrega una marca de tiempo.",
      "hibiki:done": "Envía el embed.",
      "hibiki:cancel": "Cierra este menú.",
    };

    let embed = {};
    Object.entries(emojiactions).forEach(e => emojis.push(e[0]));

    // Sends the first embed
    const embedmsg = await msg.channel.createMessage({
      embed: {
        title: "🖊 Embed",
        color: this.bot.embed.color("general"),
        fields: Object.entries(emojiactions).map(e => {
          return {
            name: `${e[0]} ${emojilabels[e[1]] ? emojilabels[e[1]] : e[1]}`,
            value: emojidescriptions[e[1]] ? emojidescriptions[e[1]] : "No hay descripción",
            inline: true,
          };
        }),
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });

    // Sets a timeout for the reaction menu
    emojis.forEach(e => embedmsg.addReaction(e).catch(() => {}));
    await waitFor("messageReactionAdd", 120000, async (m, emoji, user) => {
      // Returns if needed
      if (m.id !== embedmsg.id) return false;
      if (user !== msg.author.id) return false;
      if (!emojiactions[emoji.name]) return false;
      let e = emojiactions[emoji.name];
      if (e === "hibiki:done") return true;
      if (e === "hibiki:cancel") {
        embedmsg.delete();
        embed = { error: "Embed cancelado." };
        return true;
      }

      // Removes the reaction from the message
      m.removeReaction(emoji.name, user).catch(() => {});
      if (e === "timestamp") { embed.timestamp = new Date(); return; }
      if (e.includes(".")) e = e.split(".");

      // Sends a prompt to the author
      this.bot.embed.edit("🖊 Embed",
        `Responder con lo pedido **${emojilabels[typeof e == "string" ? e : e.join(".")] ? `${emojilabels[typeof e == "string" ?
        e : e.join(".")][0].toLowerCase()}${emojilabels[typeof e == "string" ? e : e.join(".")].substring(1)}` : e[1]}**.`,
        embedmsg,
      );

      const [resp] = await waitFor("messageCreate", 60000, async message => {
        if (message.author.id !== msg.author.id) return false;
        if (message.channel.id !== msg.channel.id) return false;
        message.delete().catch(() => {});
        return true;
      }, this.bot).catch(() => {});

      // Edits the embed message
      embedmsg.edit({
        embed: {
          title: "🖊 Embed",
          color: this.bot.embed.color("general"),
          fields: Object.entries(emojiactions).map(em => {
            return {
              name: `${em[0]} ${emojilabels[em[1]] ? emojilabels[em[1]] : em[1]}`,
              value: emojidescriptions[em[1]] ? emojidescriptions[em[1]] : "No descripción",
              inline: true,
            };
          }),
          footer: {
            text: `Pedido por ${this.bot.tag(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      }).catch(() => {});

      // Color checker
      if (typeof e == "string" && e !== "color" && e !== "timestamp") embed[e] = resp.content;
      else if (e === "color") {
        let finalhex;
        const hexcheck = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/.exec(resp.content);
        if (hexcheck) args = args.slice(0, hexcheck.index) + args.slice(hexcheck.index + hexcheck[0].length, args.length);
        if (!hexcheck && isNaN(parseInt(`0x${args}`))) {
          finalhex = this.bot.embed.color("generaL");
        } else {
          if (!hexcheck) finalhex = parseInt(`0x${args}`);
          else finalhex = parseInt(hexcheck[0].replace("#", "0x"));
          if (finalhex >= 16777215) { finalhex = 16777215; }
        }
        embed[e] = finalhex;
      } else {
        // Image checker
        if ((e[0] === "image" || e[0] === "thumbnail" || e[0] === "author" || e[0] === "footer") && (e[1] === "url" || e[1] === "icon_url") &&
          resp.attachments && resp.attachments[0]) resp.content = resp.attachments[0].proxy_url;
        let obj = {};
        if (embed[e[0]]) obj = embed[e[0]];
        obj[e[1]] = resp.content;
        embed[e[0]] = obj;
      }
    }, this.bot).catch(() => {});

    if (!Object.keys(embed).length || Object.keys(embed).includes("error")) {
      embedmsg.delete().catch(() => {});
      return this.bot.embed("❌ Error", embed.error ? embed.error : "Embed invalido.", msg, "error");
    }

    // Sends the final embed
    if (!embed.color) embed.color = this.bot.embed.color("general");
    msg.channel.createMessage({ embed: embed }).catch(() => {});
    embedmsg.delete().catch(() => {});
  }
}

module.exports = embedCommand;
