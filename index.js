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

    // COMMANDE : /stats
    if (commandName === 'stats') {
        await interaction.deferReply(); 

        try {
            // API publique Fortnite Creative (Fortnite.FYI)
            const response = await fetch('https://hnnpaewhugfyoomcuiyg.supabase.co/functions/v1/island-embed-widget?code=8199-8353-2193&format=json');

            if (!response.ok) {
                throw new Error(`Réponse de l'API invalide (Statut ${response.status})`);
            }

            const data = await response.json();

            // Récupération des valeurs en temps réel depuis l'API
            const joueursActuels = data?.peak_ccu ?? data?.unique_players ?? 0;
            const favoris = data?.favorites ?? 0;

            // Formatage exact de la réponse
            const messageStats = 
                `Voici les stats de la map DODO PARTY 2.0: \n` +
                `Joueur actuel: ${joueursActuels}\n` +
                `favoris actuel: ${favoris}\n` +
                `code: 8199-8353-2193\n` +
                `créateur forntite: skar9272727`;

            await interaction.editReply(messageStats);

        } catch (error) {
            console.error('Erreur lors de la récupération des stats Fortnite:', error);
            await interaction.editReply("❌ Impossible de récupérer les statistiques de la map pour le moment.");
        }
    }
});

client.login(process.env.TOKEN);
