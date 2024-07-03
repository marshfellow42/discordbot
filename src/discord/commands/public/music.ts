import { Command } from "#base";
import { createQueueMetadata, icon, res } from "#functions";
import { brBuilder } from "@magicyan/discord";
import { QueryType, SearchQueryType, useMainPlayer } from "discord-player";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

new Command({
    name: "music",
    description: "Music command",
    type: ApplicationCommandType.ChatInput,
    options:[
        {
            name: "play",
            description: "Play a music",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "search",
                    description: "Music name or URL",
                    type: ApplicationCommandOptionType.String,
                    required
                },
                {
                    name: "engine",
                    description: "Search engine",
                    type: ApplicationCommandOptionType.String,
                    choices: Object.values(QueryType).map(type => ({
                        name: type, value: type
                    }))
                },
            ]
        },
        {
            name: "pause",
            description: "Pause the current music",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "replay",
            description: "Replay the current music",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "stop",
            description: "Stop the current music",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "skip",
            description: "Skip the current music",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "quantity",
                    description: "Music quantity to skip",
                    type: ApplicationCommandOptionType.Integer,
                    minValue: 1
                }
            ]
        },
    ],
    async run(interaction){
        const { options, member, guild, channel, client  } = interaction;

        const voiceChannel = member.voice.channel;

        if (!voiceChannel){
            interaction.reply(res.danger(`${icon("close")}You need to be in a voice channel!`));
            return;
        }
        if (!channel){
            interaction.reply(res.danger(`${icon("close")} It's not possivel to use this command`));
            return;
        }

        const metadata = createQueueMetadata({ channel, client, guild, voiceChannel});

        const player = useMainPlayer();
        const queue= player.queues.cache.get(guild.id);

        await interaction.deferReply({ ephemeral });

        switch(options.getSubcommand(true)){
            case 'play':{
                const query = options.getString("search", true)
                const searchEngine = options.getString("engine")

                try {
                    const { track, searchResult } = await player.play(voiceChannel as never, query, {
                        searchEngine: searchEngine as SearchQueryType,
                        nodeOptions: { metadata }
                    })
                    
                    const display: string[] = [];

                    if(searchResult.playlist){
                        const { tracks, title, url } = searchResult.playlist;
                        display.push(
                            `${icon("check")} Added ${tracks.length} of playlist [${title}](${url})`,
                            ...tracks.map(track => `${track.title}`).slice(0, 8),
                            "..."
                        )
                    } else {
                        display.push(`${icon("check")} ${queue?.size ? "Added to queue" : "Playing now "} ${track.title}`)
                    }

                    interaction.editReply(res.success(brBuilder(display)))
                } catch (error) {
                    interaction.editReply(res.danger("Unable to play the music"))
                }
                return;
            }
        }

        if (!queue){
            interaction.editReply(res.danger(`${icon("close")} There is no active play queue!`))
            return;
        }

        switch(options.getSubcommand(true)){
            case "pause": {
                if (queue.node.isPaused()){
                    interaction.editReply(res.danger(`${icon("close")} The current song is paused!`))
                    return;
                }
                queue.node.pause();
                interaction.editReply(res.success(`${icon("check")} The current song has been paused.`))
                return;
            }
            case "replay": {
                if (!queue.node.isPaused()){
                    interaction.editReply(res.danger(`${icon("close")} The current song is not paused!`))
                    return;
                }
                queue.node.resume();
                interaction.editReply(res.success(`${icon("check")} The current song has been replayed.`))
                return;
            }
            case "stop": {
                queue.node.stop();
                interaction.editReply(res.success(`${icon("check")} The current song has been stopped.`))
                return;
            }
            case "skip": {
                const amount = options.getInteger("quantity") ?? 1;
                const skipAmount = Math.min(queue.size, amount);
                for(let i = 0; i < skipAmount; i++) {
                    queue.node.skip();
                }
                interaction.editReply(res.success(`${icon("check")} Successfully skipped songs`))
                return;
            }
        }
    }
});