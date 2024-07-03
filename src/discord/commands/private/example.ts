import { Command, Responder, ResponderType } from "#base";
import { settings } from "#settings";
import { createEmbed, createRow, sleep } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle } from "discord.js";
import { icon } from "functions/utils/emojis.js";

new Command({
    name: "example",
    description: "Example embed",
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        const embed = createEmbed({
            color: settings.colors.primary,
            description: "Click to find data"
        });

        const row = createRow(
            new ButtonBuilder({
                customId: "data/fetch",
                label: "Searching",
                emoji: icon("star"),
                style: ButtonStyle.Success
            })
        )

        interaction.reply({ephemeral, embeds: [embed], components: [row]})
    }
});

new Responder({
    customId: "data/fetch",
    type: ResponderType.Button, cache: "cached",
    async run(interaction) {
        await interaction.update({
            components: [], embeds: [
                createEmbed({
                    color: settings.colors.warning,
                    description: `${icon(":a:dots")} Searching data, please wait...`
                })
            ]
        })

        await sleep(3000)

        await interaction.editReply({
            components: [], embeds: [
                createEmbed({
                    color: settings.colors.warning,
                    description: `${icon("check")} Data found!`
                })
            ]
        })
    },
});