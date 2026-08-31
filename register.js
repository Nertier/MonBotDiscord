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
                .setRequired(true)),
                
    new SlashCommandBuilder()
        .setName('demute')
        .setDescription('Enlève le mute d\'un membre')
        .addUserOption(option => 
            option.setName('membre')
                .setDescription('La personne à demute')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Affiche les statistiques de la map Fortnite DODO PARTY 2.0'),

    // NOUVELLE COMMANDE : /kick
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
                ))
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
