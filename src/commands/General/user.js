const Command = require("../../structures/Command");
const format = require("../../utils/format");
const dayjs = require("dayjs");
const pronouns = ["No preference", "He/Him", "She/Her", "They/Them"];

// Dayjs plugins
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

class userCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[member:member&fallback]",
      description: "Devuelve información sobre usted u otro miembro.",
      aliases: ["profile", "perfil", "userinfo"],
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let pointcount = 0;
    let warningcount = 0;
    let spouseid;

    // Gets user's (custom) status; removes custom emojis
    let playing = user.game && user.game.name.trim() ? user.game.name.trim() : "";
    if (user.game && user.game.type === 4) {
      if (user.game.emoji && user.game.emoji.name && !user.game.emoji.id) playing = `${user.game.emoji.name} ${user.game.state || ""}`;
      else playing = user.game.state;
    }

    // Spotify & playing
    if (user.activities) {
      const song = user.activities.find(s => s.id === "spotify:1");
      const game = user.activities.find(s => s.id !== "spotify:1" && s.id !== "custom");
      if (song && !game) playing = `${song.details} \n` + `by ${song.state} \n` + `on ${song.assets.large_text}`;
      else if (game) playing = `${game.name}`;
    }

    // Formats statustypes
    let playingname;
    if (user.game) {
      switch (user.game.type) {
        case 0:
          playingname = "Jugando";
          break;
        case 1:
          playingname = "Transmitiendo";
          break;
        case 2:
          playingname = "Escuchando a";
          break;
        case 3:
          playingname = "Viendo";
          break;
        case 4:
          playingname = `${user.activities.find(s => s.id === "spotify:1") ? "<:spotify:761023614077763584> Escuchando a" : ":stopwatch: Estado personalizado:"}`;
          break;
        default:
          playingname = "Desconocido";
          break;
      }

      if (user.activities.find(s => s.id !== "spotify:1" && s.id !== "custom")) playingname = ":video_game: Jugando";
    } else playingname = ":video_game: Jugando";


    // Formats statuses
    function formatStatus(status) {
      switch (status) {
        case "online":
          return "Conectado";
        case "idle":
          return "Ausente";
        case "dnd":
          return "No molestar";
        case "offline":
          return "Invisible/Desconectado";
        case undefined:
          return "Invisible/Desconectado";
        default:
          return status;
      }
    }

    // Gets database items
    const cookies = await this.bot.db.table("economy").get(user.id).run();
    const points = await this.bot.db.table("points").run();
    const userconfig = await this.bot.db.table("userconfig").get(user.id).run();
    const warnings = await this.bot.db.table("warnings").run();
    const [spouse] = await this.bot.db.table("marriages").getAll(user.id, { index: "marriages" }).run();
    if (spouse) spouseid = spouse.id === user.id ? spouse.spouse : spouse.id;
    points.forEach(p => { if (p.guild === msg.channel.guild.id && p.receiver === user.id) pointcount++; });
    warnings.forEach(w => { if (w.guild === msg.channel.guild.id && w.receiver === user.id) warningcount++; });

    // Gets user's current time
    let timeForUser;
    let timezone;
    const currentTime = new Date();
    if (!userconfig || !userconfig.timezone || userconfig && userconfig.timezoneHide === true) timeForUser = null;
    else timezone = dayjs(currentTime).tz(userconfig.timezone);
    if (!timezone || !timezone.$d) timeForUser = null;
    else timeForUser = format.date(timezone.$d);

    // Embed constructor
    const fields = [];
    fields.push({
      name: ":mag_right: ID",
      value: user.id,
      inline: true,
    });

    fields.push({
      name: ":date: Cuenta",
      value: `Creada en ${format.date(user.createdAt)} \n` + `Se unio en ${format.date(user.joinedAt)}`,
    });

    if (playing) fields.push({
      name: playingname,
      value: `${playing}`,
      inline: false,
    });

    if (user.nick) fields.push({
      name: ":pencil2: Nickname",
      value: `${user.nick}`,
      inline: true,
    });

    fields.push({
      name: ":stopwatch: Estado",
      value: formatStatus(user.status),
      inline: true,
    });

    if (user.roles.length) fields.push({
      name: ":ribbon: Rol mas alto",
      value: `${user.highestRole.name}`,
      inline: true,
    });

    if (userconfig && userconfig.pronouns && userconfig.pronouns !== 0) fields.push({
      name: "Apodo",
      value: pronouns[userconfig.pronouns],
      inline: true,
    });

    if (timeForUser !== null) fields.push({
      name: ":timer: Tiempo actual",
      value: `${timeForUser}`,
      inline: true,
    });

    if (spouse) fields.push({
      name: ":revolving_hearts: Matrimonio",
      value: `${spouseid ? this.bot.users.find(m => m.id === spouseid) ? this.bot.users.find(m => m.id === spouseid).username : `<@!${spouseid}>` : "Nadie"}`,
      inline: true,
    });

    if (cookies && cookies.amount > 0 || pointcount || warningcount) fields.push({
      name: ":moneybag: Estadísticas de bot",
      value: `${pointcount ? `${pointcount} punto${pointcount === 1 ? "" : "s"}` : ""} \n` +
        `${warningcount ? `${warningcount} advertencia${warningcount === 1 ? "" : "s"} \n` : ""}` +
        `x${cookies && cookies.amount > 0 ? `${cookies.amount} cookie${cookies.amount === 1 ? "" : "s :cookie:"}` : ""}`,
      inline: false,
    });


    msg.channel.createMessage({
      embed: {
        description: userconfig && userconfig.bio ? userconfig.bio : null,
        color: this.bot.embed.color("general"),
        fields: fields,
        author: {
          icon_url: user.user.dynamicAvatarURL(null),
          name: this.bot.tag(user.user),
        },
        thumbnail: {
          url: user.user.dynamicAvatarURL(null),
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = userCommand;
