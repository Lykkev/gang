const Command = require("../../structures/Command");

class sayCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<text:string>",
      description: "Hace que el bot diga algo.",
      owner: true,
    });
  }

  run(msg, args) {
    msg.channel.createMessage(args.join(" "));
    msg.delete().catch(() => {});
  }
}

module.exports = sayCommand;
