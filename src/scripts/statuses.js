/**
 * @fileoverview Statuses
 * @description Switches between and formats statuses
 * @module statuses
 */

/**
 * Switches between statuses
 * @param {object} bot Main bot object
 */

module.exports.switch = bot => {
  // Formats statuses
  let useramnt = 0;
  bot.guilds.forEach(g => { useramnt += g.memberCount; });
  const statuses = bot.config.statuses.map(s => {
    if (s === "help") s = `${bot.config.prefixes[0]}help `;
    if (s === "guilds") s = `${bot.guilds.size} servidores`;
    if (s === "users") s = `${useramnt} usuarios`;
    if (s === "version") s = `v1.1`;
    return s;
  });

  // Sets the initial status
  bot.editStatus(bot.config.status, {
    name: statuses[Math.floor(statuses.length * Math.random())],
    type: bot.config.statustype,
    url: "https://twitch.tv/.",
  });

  // Timeout for switching
  setInterval(() => {
    bot.editStatus(bot.config.status, {
      name: statuses[Math.floor(statuses.length * Math.random())],
      type: bot.config.statustype,
      url: "https://twitch.tv/.",
    });
  }, 50000);
};
