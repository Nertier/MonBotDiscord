require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    PermissionFlagsBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    EmbedBuilder
} = require('discord.js');
const express = require('express');

// --- DONNÉES DE LA MAP (En mémoire) ---
let mapInfo = {
    nom: "DODO PARTY 2.0",
    code: "8199-8353-2193",
    createur: "skar9272727"
};

const app = express();
app.get('/', (req, res) => res.send('Le bot est en ligne et actif !'));
app.listen(3000, () => console.log('Serveur web démarré sur le port 3000.'));

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    
    // ==========================================
    // 1. GESTION DES COMMANDES SLASH (/)
    // ==========================================
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        // COMMANDE : /mute
        if (commandName === 'mute') {
            const target = interaction.options.getMember('membre');
            const minutes = interaction.options.getInteger('temps');
            const reason = interaction.options.getString('raison');
            
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: '❌ Tu n\'as pas la permission de mute.', ephemeral: true });
            if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });

            let mpStatus = "";
            if (reason) {
                try {
                    await target.send(`Tu as été rendu muet sur le serveur **${interaction.guild.name}** pour **${minutes} minute(s)**.\n**Raison :** ${reason}`);
                    mpStatus = "\n*(Le membre a reçu la raison en MP ✅)*";
                } catch (error) {
                    mpStatus = "\n*(Impossible d'envoyer le MP ❌)*";
                }
            }

            try {
                await target.timeout(minutes * 60 * 1000, reason || `Mute par ${interaction.user.tag}`);
                await interaction.reply(`🔇 **${target.user.tag}** a été mute pour **${minutes} minute(s)**.${mpStatus}`);
            } catch (error) {
                await interaction.reply({ content: '❌ Impossible de mute ce membre.', ephemeral: true });
            }
        }

        // COMMANDE : /demute
        if (commandName === 'demute') {
            const target = interaction.options.getMember('membre');
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: '❌ Tu n\'as pas la permission de demute.', ephemeral: true });
            if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });

            try {
                await target.timeout(null, `Demute par ${interaction.user.tag}`);
                await interaction.reply(`🔊 **${target.user.tag}** a été demute.`);
            } catch (error) {
                await interaction.reply({ content: '❌ Impossible de demute ce membre.', ephemeral: true });
            }
        }

        // COMMANDE : /kick
        if (commandName === 'kick') {
            const target = interaction.options.getMember('membre');
            const reason = interaction.options.getString('raison');
            const sendMp = interaction.options.getString('mp');

            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'exclure.', ephemeral: true });
            if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
            if (!target.kickable) return interaction.reply({ content: '❌ Je ne peux pas exclure ce membre.', ephemeral: true });

            let mpStatus = "";
            if (sendMp === 'oui') {
                try {
                    await target.send(`Tu as été expulsé du serveur **${interaction.guild.name}**.\n**Raison :** ${reason}`);
                    mpStatus = "*(Le membre a reçu la raison en MP ✅)*";
                } catch (error) {
                    mpStatus = "*(Impossible d'envoyer le MP ❌)*";
                }
            }

            try {
                await target.kick(reason);
                await interaction.reply(`👢 **${target.user.tag}** a été expulsé.\n**Raison :** ${reason}\n${mpStatus}`);
            } catch (error) {
                await interaction.reply({ content: '❌ Erreur lors de l\'exclusion.', ephemeral: true });
            }
        }

        // COMMANDE : /ban
        if (commandName === 'ban') {
            const target = interaction.options.getMember('membre');
            const targetUser = interaction.options.getUser('membre');
            const days = interaction.options.getInteger('temps_en_jour');
            const reason = interaction.options.getString('raison');
            const sendMp = interaction.options.getString('mp');
            const isPerm = interaction.options.getString('ban_perm');

            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: '❌ Tu n\'as pas la permission de bannir.', ephemeral: true });
            if (target && !target.bannable) return interaction.reply({ content: '❌ Je ne peux pas bannir ce membre (mon rôle est inférieur).', ephemeral: true });

            let mpStatus = "";
            if (sendMp === 'oui' && target) {
                try {
                    let permText = isPerm === 'oui' ? 'définitivement' : `pour **${days} jour(s)**`;
                    await target.send(`Tu as été banni ${permText} du serveur **${interaction.guild.name}**.\n**Raison :** ${reason}`);
                    mpStatus = "*(Le membre a reçu la raison en MP ✅)*";
                } catch (error) {
                    mpStatus = "*(Impossible d'envoyer le MP ❌)*";
                }
            }

            try {
                await interaction.guild.members.ban(targetUser.id, { reason: reason });
                
                let banMsg = `🔨 **${targetUser.tag}** a été banni.\n**Raison :** ${reason}\n**Type :** ${isPerm === 'oui' ? 'Permanent' : `Temporaire (${days} jours)`}\n${mpStatus}`;
                await interaction.reply(banMsg);

                if (isPerm === 'non') {
                    setTimeout(async () => {
                        try {
                            await interaction.guild.members.unban(targetUser.id, "Fin du ban temporaire");
                        } catch (e) {
                            console.error(`Erreur lors de l'unban automatique de ${targetUser.tag}`, e);
                        }
                    }, days * 24 * 60 * 60 * 1000);
                }

            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '❌ Erreur lors du bannissement.', ephemeral: true });
            }
        }

        // COMMANDE : /info
        if (commandName === 'info') {
            const messageInfo = 
                `Informations de la map :\n` +
                `Nom: ${mapInfo.nom}\n` +
                `Code: ${mapInfo.code}\n` +
                `Créateur fortnite: ${mapInfo.createur}`;
            
            await interaction.reply({ content: messageInfo, ephemeral: true });
        }

        // COMMANDE : /modif
        if (commandName === 'modif') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({ content: '❌ Seuls les modérateurs peuvent utiliser cette commande.', ephemeral: true });
            }

            const btnInfo = new ButtonBuilder()
                .setCustomId('btn_open_modif_info')
                .setLabel('MODIFIER /INFO')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(btnInfo);

            const msgMenu = `MODIFIER LE BOT DORO PARTY BOT:\n` +
                            `commande actuel:\n/kick\n/mute\n/demute\n/ban\n/info\n/modif\n/clear\n/warn\n/unban\n/poll\n/avatar`;

            await interaction.reply({ content: msgMenu, components: [row], ephemeral: true });
        }

        // COMMANDE : /clear
        if (commandName === 'clear') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({ content: '❌ Tu n\'as pas la permission de supprimer des messages.', ephemeral: true });
            }

            const amount = interaction.options.getInteger('nombre');

            try {
                // filterOld = true ignore automatiquement les messages de plus de 14 jours
                const deleted = await interaction.channel.bulkDelete(amount, true);

                let extraInfo = '';
                if (deleted.size < amount) {
                    extraInfo = '\n*(Remarque : les messages datant de plus de 14 jours ne peuvent pas être supprimés par le bot)*';
                }

                await interaction.reply({ 
                    content: `🧹 **${deleted.size}** message(s) supprimé(s) avec succès.${extraInfo}`, 
                    ephemeral: true 
                });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '❌ Impossible de supprimer les messages dans ce salon.', ephemeral: true });
            }
        }

        // COMMANDE : /warn
        if (commandName === 'warn') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'avertir des membres.', ephemeral: true });
            }

            const target = interaction.options.getMember('membre');
            const reason = interaction.options.getString('raison');
            const channel = interaction.options.getChannel('salon');

            if (!target) return interaction.reply({ content: '❌ Membre introuvable sur le serveur.', ephemeral: true });

            let mpStatus = "";
            try {
                await target.send(`⚠️ Tu as reçu un avertissement sur le serveur **${interaction.guild.name}**.\n**Raison :** ${reason}`);
                mpStatus = "*(Le membre a reçu l'avertissement en MP ✅)*";
            } catch (error) {
                mpStatus = "*(Impossible d'envoyer le MP au membre ❌)*";
            }

            const embedLog = new EmbedBuilder()
                .setTitle('⚠️ Nouvel avertissement (Warn)')
                .setColor(0xFFA500)
                .addFields(
                    { name: 'Membre sanctionné', value: `${target.user.tag} (${target.id})`, inline: true },
                    { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Raison', value: reason }
                )
                .setTimestamp();

            try {
                await channel.send({ embeds: [embedLog] });
                await interaction.reply({ content: `✅ **${target.user.tag}** a été averti.\nRapport envoyé dans ${channel}.\n${mpStatus}`, ephemeral: true });
            } catch (error) {
                await interaction.reply({ content: '❌ Impossible d\'envoyer le rapport dans le salon spécifié.', ephemeral: true });
            }
        }

        // COMMANDE : /unban
        if (commandName === 'unban') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({ content: '❌ Tu n\'as pas la permission de débannir.', ephemeral: true });
            }

            const userId = interaction.options.getString('discordid').trim();

            try {
                const unbannedUser = await interaction.guild.members.unban(userId);
                await interaction.reply(`🔓 **${unbannedUser ? unbannedUser.tag : userId}** a été débanni du serveur.`);
            } catch (error) {
                await interaction.reply({ content: '❌ Impossible de débannir cet utilisateur. Vérifie l\'ID fourni ou qu\'il soit bien banni.', ephemeral: true });
            }
        }

        // COMMANDE : /poll
        if (commandName === 'poll') {
            const question = interaction.options.getString('question');
            const texte = interaction.options.getString('texte');
            const count = interaction.options.getInteger('nombre_reponses');
            const rawChoices = interaction.options.getString('reponses');

            const choicesList = rawChoices.split(',').map(choice => choice.trim()).filter(Boolean);

            if (choicesList.length < count) {
                return interaction.reply({ 
                    content: `❌ Tu as spécifié ${count} réponses, mais tu n'en as fourni que ${choicesList.length} séparées par des virgules.`, 
                    ephemeral: true 
                });
            }

            const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
            
            let pollDescription = `${texte}\n\n`;
            for (let i = 0; i < count; i++) {
                pollDescription += `${numberEmojis[i]} ${choicesList[i]}\n`;
            }

            const pollEmbed = new EmbedBuilder()
                .setTitle(`📊 Sondage : ${question}`)
                .setDescription(pollDescription)
                .setColor(0x0099FF)
                .setFooter({ text: `Sondage créé par ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ content: '✅ Sondage en cours de création...', ephemeral: true });

            const pollMessage = await interaction.channel.send({ embeds: [pollEmbed] });

            for (let i = 0; i < count; i++) {
                await pollMessage.react(numberEmojis[i]);
            }
        }

        // COMMANDE : /avatar
        if (commandName === 'avatar') {
            const targetUser = interaction.options.getUser('membre') || interaction.user;
            const avatarUrl = targetUser.displayAvatarURL({ size: 1024, extension: 'png' });

            const avatarEmbed = new EmbedBuilder()
                .setTitle(`Avatar de ${targetUser.tag}`)
                .setImage(avatarUrl)
                .setColor(0x2F3136)
                .setDescription(`[Lien direct vers la photo de profil](${avatarUrl})`);

            await interaction.reply({ embeds: [avatarEmbed] });
        }
    }

    // ==========================================
    // 2. GESTION DES BOUTONS
    // ==========================================
    if (interaction.isButton()) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser ces boutons.', ephemeral: true });
        }

        if (interaction.customId === 'btn_open_modif_info') {
            const btnNom = new ButtonBuilder().setCustomId('btn_modif_nom').setLabel('MODIFIER NOM').setStyle(ButtonStyle.Secondary);
            const btnCode = new ButtonBuilder().setCustomId('btn_modif_code').setLabel('MODIFIER CODE').setStyle(ButtonStyle.Secondary);
            const btnCrea = new ButtonBuilder().setCustomId('btn_modif_createur').setLabel('MODIFIER CREATEUR FORTNITE').setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder().addComponents(btnNom, btnCode, btnCrea);

            const msgPublicInfo = 
                `MODIFIER /INFO:\n` +
                `Nom actuel : ${mapInfo.nom}\n` +
                `Code actuel : ${mapInfo.code}\n` +
                `Créateur fortnite actuel : ${mapInfo.createur}`;

            await interaction.reply({ content: msgPublicInfo, components: [row] });
        }

        if (interaction.customId === 'btn_modif_nom') {
            const modal = new ModalBuilder().setCustomId('modal_nom').setTitle('Modifier le Nom');
            const input = new TextInputBuilder().setCustomId('input_nom').setLabel("Nouveau nom :").setStyle(TextInputStyle.Short).setValue(mapInfo.nom);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }

        if (interaction.customId === 'btn_modif_code') {
            const modal = new ModalBuilder().setCustomId('modal_code').setTitle('Modifier le Code');
            const input = new TextInputBuilder().setCustomId('input_code').setLabel("Nouveau code :").setStyle(TextInputStyle.Short).setValue(mapInfo.code);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }

        if (interaction.customId === 'btn_modif_createur') {
            const modal = new ModalBuilder().setCustomId('modal_createur').setTitle('Modifier le Créateur');
            const input = new TextInputBuilder().setCustomId('input_createur').setLabel("Nouveau créateur :").setStyle(TextInputStyle.Short).setValue(mapInfo.createur);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }
    }

    // ==========================================
    // 3. GESTION DES FENÊTRES (MODALS) SOUMISES
    // ==========================================
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_nom') {
            mapInfo.nom = interaction.fields.getTextInputValue('input_nom');
            await interaction.reply({ content: `✅ Le nom de la map a été mis à jour avec succès ! (\`/info\` modifié)`, ephemeral: true });
        }

        if (interaction.customId === 'modal_code') {
            mapInfo.code = interaction.fields.getTextInputValue('input_code');
            await interaction.reply({ content: `✅ Le code de la map a été mis à jour avec succès ! (\`/info\` modifié)`, ephemeral: true });
        }

        if (interaction.customId === 'modal_createur') {
            mapInfo.createur = interaction.fields.getTextInputValue('input_createur');
            await interaction.reply({ content: `✅ Le nom du créateur a été mis à jour avec succès ! (\`/info\` modifié)`, ephemeral: true });
        }
    }
});

client.login('TOKEN');
