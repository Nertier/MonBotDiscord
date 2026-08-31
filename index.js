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

    // COMMANDE : /stats (WEBSCRAPING AMÉLIORÉ)
    if (commandName === 'stats') {
        await interaction.deferReply(); 

        try {
            const targetUrl = 'https://fortnite.gg/island/8199-8353-2193';
            
            // On ajoute des headers très complets pour imiter parfaitement un humain sur Chrome
            const response = await fetch(targetUrl, {
                method: 'GET',
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Cache-Control': 'max-age=0'
                }
            });

            if (!response.ok) {
                // Si la page bloque, on jette une erreur avec le code exact (ex: 403)
                throw new Error(`Accès refusé par le site (Code: ${response.status})`);
            }

            const html = await response.text();

            // On retire les balises HTML pour extraire le texte
            const textContent = html.replace(/<[^>]+>/g, ' ');

            // Regex améliorée pour capturer les nombres
            const playersMatch = textContent.match(/([\d.,kK]+)\s*(?:#\s*)?Players right now/i);
            const favMatch = textContent.match(/([\d.,kK]+)\s*(?:#\s*)?Favorites/i);

            const joueursActuels = playersMatch ? playersMatch[1].trim() : 'Introuvable';
            const favoris = favMatch ? favMatch[1].trim() : 'Introuvable';

            const messageStats = 
                `Voici les stats de la map **DODO PARTY 2.0** :\n\n` +
                `👥 Joueurs actuels : **${joueursActuels}**\n` +
                `⭐ Favoris actuels : **${favoris}**\n` +
                `🗺️ Code : 8199-8353-2193\n` +
                `🛠️ Créateur : skar9272727`;

            await interaction.editReply(messageStats);

        } catch (error) {
            console.error('Erreur technique détaillée :', error);
            // On affiche désormais l'erreur exacte directement sur Discord !
            await interaction.editReply(`❌ Impossible de récupérer les statistiques.\n**Erreur :** \`${error.message}\``);
        }
    }
});

client.login(process.env.TOKEN);
