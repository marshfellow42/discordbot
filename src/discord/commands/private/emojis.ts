import { Command } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, AttachmentBuilder } from "discord.js";

new Command({
    name: "emojis",
    description: "Emoji command",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "server",
            description: "Returns an JSON text of all of server's emojis",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "bot",
            description: "Returns an JSON text of all of bot's emojis",
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    async run(interaction){
        const { options, client, guild } = interaction;

        const subcommand = options.getSubcommand(true);

        interface Emojis {
           static: Record<string, string>; 
           animated: Record<string, string>; 
        }
        const emojis: Emojis = {
            static: {},
            animated: {},
        }

        switch(subcommand){
            case "bot":
            case "server": {
                const EmojisCache = subcommand === "bot"
                ? client.emojis.cache
                : guild.emojis.cache;
                
                for(const {name, id, animated} of EmojisCache.values()){
                    if (!name) continue;
                    emojis[animated ? "animated" : "static"][name] = id;
                }

                const buffer = Buffer.from(JSON.stringify(emojis, null, 2), "utf-8");
                const attachment = new AttachmentBuilder(buffer, {name: "emojis.json"})

                interaction.reply({
                    ephemeral, files: [attachment],
                    content: `${subcommand}'s emojis`
                })
            }
        }
    }
});