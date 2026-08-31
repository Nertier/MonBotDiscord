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
                .setRequired(true))
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