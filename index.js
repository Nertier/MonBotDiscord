require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const express = require('express');

// --- PARTIE SERVEUR WEB (Pour le 24/7) ---
const app = express();
app.get('/', (req, res) => res.send('Le bot est en ligne et actif !'));
app.listen(3000, () => console.log('Serveur web démarré sur le port 3000.'));

// --- PARTIE BOT DISCORD ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once('ready', () => {
    console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    // COMMANDE : /mute
    if (commandName === 'mute') {
        const target = interaction.options.getMember('membre');
        const minutes = interaction.options.getInteger('temps');

        // Vérification des permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ Tu n\'as pas la permission de mute des membres.', ephemeral: true });
        }
        if (!target) {
            return interaction.reply({ content: '❌ Membre introuvable sur le serveur.', ephemeral: true });
        }

        const msDuration = minutes * 60 * 1000;

        try {
            await target.timeout(msDuration, `Mute par ${interaction.user.tag}`);
            await interaction.reply(`🔇 **${target.user.tag}** a été mute pour **${minutes} minute(s)**.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Impossible de mute ce membre. Vérifie que mon rôle de Bot est placé plus haut que le sien dans les paramètres du serveur.', ephemeral: true });
        }
    }

    // COMMANDE : /demute
    if (commandName === 'demute') {
        const target = interaction.options.getMember('membre');

        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ Tu n\'as pas la permission de demute des membres.', ephemeral: true });
        }
        if (!target) {
            return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
        }

        try {
            await target.timeout(null, `Demute par ${interaction.user.tag}`);
            await interaction.reply(`🔊 **${target.user.tag}** a été demute.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Impossible de demute ce membre.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);