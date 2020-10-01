const Command = require("../../structures/Command");

class changelogCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["updates"],
      description: "Envía el registro de cambios de la última versión.",
      allowdms: true,
    });
  }

  run(msg) {
    this.bot.embed("📚 Changelog", "Puedes ver los últimos cambios [Aquí](https://www.youtube.com/channel/UCP3uPQol8D2ha3Absn5c9lQ?view_as=subscriber).", msg);
  }
}

module.exports = changelogCommand;
