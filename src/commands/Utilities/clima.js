const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class weatherCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["forecast", "humidity", "skystatus", "temp", "temperature", "windspeed"],
      args: "<location:string>",
      description: "Muestra la información meteorológica actual de una zona.",
      requiredkeys: ["weather"],
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const location = await fetch(
      `https://nominatim.openstreetmap.org/search/${encodeURIComponent(args.join(" "))}/?format=geocodejson`,
    ).then(res => res.json().catch(() => {}));

    if (!location || !location.features[0] || !location.features[0].geometry.coordinates) {
      return this.bot.embed("❌ Error", "Ubicación no encontrada.", msg, "error");
    }

    // Gets coordinates & name
    const loc = location.features[0];
    const latitude = loc.geometry.coordinates[1];
    const longitude = loc.geometry.coordinates[0];

    // Removes nonlatin names
    let name = loc.properties.geocoding.name.replace(/[\u0250-\ue007]/g, "");
    if (!name || !name.length) name = `${args}`;

    // Weather info
    const body = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${this.bot.key.weather}`,
    ).then(res => res.json().catch(() => {}));

    // Embed fields
    const fields = [];
    if (body.current.temp) fields.push({
      name: "🌡 Temperatura",
      value: `${body.current.temp.toFixed(0)}°c`,
      inline: true,
    });

    if (body.current.feels_like) fields.push({
      name: "🔆 Se siente como",
      value: `${body.current.feels_like.toFixed(0)}°c`,
      inline: true,
    });

    if (body.current.humidity) fields.push({
      name: "💦 Humedad",
      value: `${body.current.humidity.toFixed(0)}%`,
      inline: true,
    });

    if (body.daily[0].temp.max) fields.push({
      name: "☀ Alta",
      value: `${body.daily[0].temp.max.toFixed(0)}°c`,
      inline: true,
    });

    if (body.daily[0].temp.min) fields.push({
      name: "🌙 Baja",
      value: `${body.daily[0].temp.min.toFixed(0)}°c`,
      inline: true,
    });

    if (body.current.wind_speed) fields.push({
      name: "💨 Velocidad del viento",
      value: `${body.current.wind_speed.toFixed(1)}km/h`,
      inline: true,
    });

    msg.channel.createMessage({
      embed: {
        title: `☁ El tiempo para ${name}`,
        description: `${body.current.weather[0].main} (${body.current.weather[0].description})`,
        color: this.bot.embed.color("general"),
        fields: fields,
        thumbnail: {
          url: `http://openweathermap.org/img/wn/${body.current.weather[0].icon}@2x.png`,
        },
        footer: {
          text: `Pedido por ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = weatherCommand;
