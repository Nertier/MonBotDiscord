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
    TextInputStyle 
} = require('discord.js');
const express = require('express');

// --- DONNÉES DE LA MAP (En mémoire) ---
let mapInfo = {
    nom: "DODO PARTY 2.0",
    code: "8199-8353-2193",
    createur: "skar9272727"
};

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
    
    // ==========================================
    // 1. GESTION DES COMMANDES SLASH (/)
    // ==========================================
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        // COMMANDE : /mute
        if (commandName === 'mute') {
            const target = interaction.options.getMember('membre');
            const minutes = interaction.options.getInteger('temps');
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: '❌ Tu n\'as pas la permission de mute.', ephemeral: true });
            if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });

            try {
                await target.timeout(minutes * 60 * 1000, `Mute par ${interaction.user.tag}`);
                await interaction.reply(`🔇 **${target.user.tag}** a été mute pour **${minutes} minute(s)**.`);
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

        // COMMANDE : /info
        if (commandName === 'info') {
            const messageInfo = 
                `Informations de la map :\n` +
                `Nom: ${mapInfo.nom}\n` +
                `Code: ${mapInfo.code}\n` +
                `Créateur fortnite: ${mapInfo.createur}`;
            
            // ephemeral: true rend le message invisible pour les autres
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
                            `commande actuel:\n/kick\n/mute\n/demute\n/info\n/modif`;

            // On envoie le message de base (celui-ci est privé pour ne pas spam le chat)
            await interaction.reply({ content: msgMenu, components: [row], ephemeral: true });
        }
    }

    // ==========================================
    // 2. GESTION DES BOUTONS
    // ==========================================
    if (interaction.isButton()) {
        // Sécurité : Vérifier que c'est bien un modérateur qui clique !
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser ces boutons.', ephemeral: true });
        }

        // Bouton : MODIFIER /INFO
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

            // Ce message est envoyé publiquement comme tu l'as demandé
            await interaction.reply({ content: msgPublicInfo, components: [row] });
        }

        // Bouton : MODIFIER NOM (Ouvre la fenêtre)
        if (interaction.customId === 'btn_modif_nom') {
            const modal = new ModalBuilder().setCustomId('modal_nom').setTitle('Modifier le Nom');
            const input = new TextInputBuilder().setCustomId('input_nom').setLabel("Nouveau nom :").setStyle(TextInputStyle.Short).setValue(mapInfo.nom);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }

        // Bouton : MODIFIER CODE (Ouvre la fenêtre)
        if (interaction.customId === 'btn_modif_code') {
            const modal = new ModalBuilder().setCustomId('modal_code').setTitle('Modifier le Code');
            const input = new TextInputBuilder().setCustomId('input_code').setLabel("Nouveau code :").setStyle(TextInputStyle.Short).setValue(mapInfo.code);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }

        // Bouton : MODIFIER CREATEUR (Ouvre la fenêtre)
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

client.login(process.env.TOKEN);
