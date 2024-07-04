import { SetSongStatus, getQueueMetada } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { useMainPlayer } from "discord-player";

const player = useMainPlayer();

player.events.on("playerStart", (queue, track) => {
    const {client, channel, voiceChannel} = getQueueMetada(queue)

    SetSongStatus(client, track);

    const embed = createEmbed({
        color: settings.colors.fuchsia,
        title: "🎵 Playing now",
        thumbnail: track.thumbnail,
        url: track.url,
        description: brBuilder(
            `**Music**: ${track.title}`,
            `**Author**: ${track.author}`,
            `**Voice channel**: ${voiceChannel}`,
            `**Duration**: ${track.duration}`
        )
    });

    channel.send({ embeds: [embed]})
});