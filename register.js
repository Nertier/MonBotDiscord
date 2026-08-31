require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

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
        .setDescription('Panneau de configuration du bot (Mods uniquement)')

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
