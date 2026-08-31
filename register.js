require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, ChannelType } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute temporairement un membre')
        .addUserOption(option => 
            option.setName('membre')
                .setDescription('La personne à mute')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('temps')
                .setDescription('Le temps du mute en minutes')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('Met la raison du mute, laisse vide pour ne pas MP l\'utilisateur')
                .setRequired(false)),
                
    new SlashCommandBuilder()
        .setName('demute')
        .setDescription('Enlève le mute d\'un membre')
        .addUserOption(option => 
            option.setName('membre')
                .setDescription('La personne à demute')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Exclure une personne du serveur')
        .addUserOption(option => 
            option.setName('membre')
                .setDescription('un membre du serveur')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('raison de la sanction')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('mp')
                .setDescription('Envoyer la raison de la sanction a l\'utilisateur en mp ?')
                .setRequired(true)
                .addChoices(
                    { name: 'OUI', value: 'oui' },
                    { name: 'NON', value: 'non' }
                )),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannir une personne du serveur')
        .addUserOption(option => 
            option.setName('membre')
                .setDescription('un membre du serveur')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('temps_en_jour')
                .setDescription('Le temps du ban en jours')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('raison')
                .setDescription('raison de la sanction')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('mp')
                .setDescription('Envoyer la raison de la sanction a l\'utilisateur en mp ?')
                .setRequired(true)
                .addChoices(
                    { name: 'OUI', value: 'oui' },
                    { name: 'NON', value: 'non' }
                ))
        .addStringOption(option => 
            option.setName('ban_perm')
                .setDescription('Ban permanant l\'utilisateur')
                .setRequired(true)
                .addChoices(
                    { name: 'OUI', value: 'oui' },
                    { name: 'NON', value: 'non' }
                )),

    new SlashCommandBuilder()
        .setName('info')
        .setDescription('Affiche les informations de la map de façon cachée'),

    new SlashCommandBuilder()
        .setName('modif')
        .setDescription('Panneau de configuration du bot (Mods uniquement)'),

    // --- NOUVELLES COMMANDES ---
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprimer un nombre de messages dans le salon (Mods uniquement)')
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Nombre de messages à supprimer (1 à 100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),

    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Avertir un membre et envoyer un rapport (Mods uniquement)')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à avertir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison du warn')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Salon où envoyer le rapport')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Débannir un utilisateur via son ID Discord (Mods uniquement)')
        .addStringOption(option =>
            option.setName('discordid')
                .setDescription('L\'ID Discord de l\'utilisateur')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Créer un sondage avec plusieurs choix')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Titre du sondage')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('texte')
                .setDescription('Description / Détails du sondage')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('nombre_reponses')
                .setDescription('Nombre de choix d\'options')
                .setRequired(true)
                .setMinValue(2)
                .setMaxValue(10))
        .addStringOption(option =>
            option.setName('reponses')
                .setDescription('Options séparées par des virgules (ex : Oui, Non, Peut-être)')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Affiche l\'avatar d\'un membre en grand format')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre dont tu veux voir l\'avatar')
                .setRequired(false))

].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Enregistrement des commandes (/) en cours...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Commandes enregistrées avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement :', error);
    }
})();
