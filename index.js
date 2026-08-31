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
    console.log(`Bot connecté en tant que ${client.user.tag}`);
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

    // COMMANDE : /stats (MODIFIÉE POUR LE WEBSCRAPING)
    if (commandName === 'stats') {
        await interaction.deferReply(); 

        try {
            // L'URL de la page fortnite.gg à scrapper
            const targetUrl = 'https://fortnite.gg/island/8199-8353-2193';
            
            // Requête vers la page. On ajoute un faux User-Agent pour simuler un vrai navigateur
            // et on force la langue en anglais pour que nos mots clés fonctionnent.
            const response = await fetch(targetUrl, {
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur lors du webscrapping: ${response.status}`);
            }

            // On récupère le code source de la page
            const html = await response.text();

            // On retire toutes les balises HTML <...> pour se retrouver avec du texte brut
            const textContent = html.replace(/<[^>]+>/g, ' ');

            // Regex pour chercher un chiffre (pouvant contenir virgules ou "K") 
            // se trouvant juste avant les mots "Players right now" et "Favorites"
            const playersMatch = textContent.match(/([\d.,kK]+)\s*(?:#\s*)?Players right now/i);
            const favMatch = textContent.match(/([\d.,kK]+)\s*(?:#\s*)?Favorites/i);

            // On extrait les résultats s'ils existent, sinon on met '0'
            const joueursActuels = playersMatch ? playersMatch[1].trim() : '0';
            const favoris = favMatch ? favMatch[1].trim() : '0';

            const messageStats = 
                `Voici les stats de la map **DODO PARTY 2.0** :\n\n` +
                `👥 Joueurs actuels : **${joueursActuels}**\n` +
                `⭐ Favoris actuels : **${favoris}**\n` +
                `🗺️ Code : 8199-8353-2193\n` +
                `🛠️ Créateur : skar9272727`;

            await interaction.editReply(messageStats);

        } catch (error) {
            console.error('Erreur lors du webscrapping Fortnite :', error);
            await interaction.editReply("❌ Impossible de récupérer les statistiques de la map pour le moment.");
        }
    }
});

client.login(process.env.TOKEN);
