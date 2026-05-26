// Author: Senior Frontend Engineer
// OS support: Windows, macOS, Linux
// Description: Serveur Master - Gestion avancée des salons et stockage dynamique
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, ActivityType, PermissionFlagsBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus, enterState } = require('@discordjs/voice');
const play = require('play-dl');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const DB_PATH = path.join(__dirname, 'db.json');
const MUSIC_DB_PATH = path.join(__dirname, 'music_db.json');
const PROFILE_DIR = path.join(__dirname, 'profile');
const PORT = 3001;

if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR);
}

const ALL_PERMISSIONS = [
  'MANAGE_ROLES', 'MANAGE_USERS', 'MANAGE_ROOMS', 'MANAGE_PATHS', 
  'KICK_MEMBERS', 'ADD_TO_PLAYLIST', 'VIEW_STATS', 'BYPASS_PASSWORD', 'VIEW_PERFORMANCE'
];

let db = {
  users: [],
  roles: [
    { id: 'admin', name: 'Administrateur', color: '#e50914', permissions: ALL_PERMISSIONS },
    { id: 'member', name: 'Membre', color: '#10b981', permissions: ['ADD_TO_PLAYLIST'] },
    { id: 'viewer', name: 'Spectateur', color: '#6b7280', permissions: [] }
  ],
  rooms: [],
  localMovies: [],
  videoPaths: [
    { path: "/volume2/Medias", isPremium: false },
    { path: "/app/medias", isPremium: false }
  ],
  catalogFolders: [],
  userGoals: [],
  validSubscriptions: [], // Liste des IDs de facture ou pseudos Ko-fi valides
  globalMessages: [],
  systemNotification: null,
  suggestions: [],
  config: {
    showCarousels: true,
    brokhometvFont: 'Inter'
  },
  discordConfig: {
    token: process.env.DISCORD_BOT_TOKEN || '',
    clientId: process.env.DISCORD_CLIENT_ID || '',
    autoStart: true
  }
};

const loadDb = () => {
    if (fs.existsSync(DB_PATH)) {
        try {
            const data = fs.readFileSync(DB_PATH, 'utf8');
            if (data.trim()) {
                const parsed = JSON.parse(data);
                db = { ...db, ...parsed };
                // S'assurer que discordConfig est présent même si db.json est ancien
                if (!db.discordConfig) {
                    db.discordConfig = {
                        token: process.env.DISCORD_BOT_TOKEN || '',
                        clientId: process.env.DISCORD_CLIENT_ID || '',
                        autoStart: true
                    };
                }
            }
        } catch (e) { console.error("Erreur DB:", e); }
    }
};

const saveDb = () => {
    try { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
    catch (e) { console.error("Erreur sauvegarde DB:", e); }
};

let musicDb = { playlists: {} };
const loadMusicDb = () => {
    if (fs.existsSync(MUSIC_DB_PATH)) {
        try {
            const data = fs.readFileSync(MUSIC_DB_PATH, 'utf8');
            if (data.trim()) {
                musicDb = JSON.parse(data);
            }
        } catch (e) { console.error("Erreur Music DB:", e); }
    }
};
const saveMusicDb = () => {
    try { fs.writeFileSync(MUSIC_DB_PATH, JSON.stringify(musicDb, null, 2)); }
    catch (e) { console.error("Erreur sauvegarde Music DB:", e); }
};

loadDb();
loadMusicDb();

const hydrateUser = (u) => {
  if (!u) return null;
  let role = db.roles.find(r => r.id === u.roleId) || db.roles.find(r => r.id === 'viewer');
  if (u.roleId === 'guest') {
    role = { id: 'guest', name: 'Invité', color: '#888888', permissions: ['watch'] };
  }
  return { 
    ...u, 
    role, 
    isPremium: true, 
    kofiUsername: u.kofiUsername || "",
    stats: {
        ...u.stats,
        watchedHistory: u.stats?.watchedHistory || []
    },
    lastPlayback: u.lastPlayback || null
  };
};

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const scanLocalMovies = (dir, baseDir) => {
    if (!fs.existsSync(dir)) return [];
    let results = [];
    try {
        const files = fs.readdirSync(dir);
        files.sort(collator.compare);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            let stat;
            try { stat = fs.statSync(fullPath); } catch(e) { return; }
            const relativePath = path.relative(baseDir, fullPath).split(path.sep).join('/');
            if (stat.isDirectory()) {
                results.push({ name: file, path: relativePath, isDirectory: true, rootPath: baseDir });
                results = results.concat(scanLocalMovies(fullPath, baseDir));
            } else {
                const ext = path.extname(file).toLowerCase();
                if (['.mp4', '.mkv', '.webm', '.mov'].includes(ext)) {
                    results.push({ name: file, path: relativePath, isDirectory: false, rootPath: baseDir });
                }
            }
        });
    } catch (err) { console.error(`Erreur scan:`, err); }
    return results;
};

const refreshMovies = () => {
    let allMovies = [];
    db.videoPaths.forEach(vPath => { 
        const root = typeof vPath === 'string' ? vPath : vPath.path;
        if(fs.existsSync(root)) {
            allMovies = allMovies.concat(scanLocalMovies(root, root)); 
        }
    });
    db.localMovies = allMovies;
    saveDb();
    io.emit('local-movies-updated', db.localMovies);
    return db.localMovies;
};

const ensurePublicRooms = () => {
    let changed = false;
    for (let i = 1; i <= 20; i++) {
        const roomName = `salon Publique (Free) ${i}`;
        const exists = db.rooms.find(r => r.name === roomName);
        if (!exists) {
            db.rooms.push({
                id: `public-room-${i}`,
                name: roomName,
                ownerId: 'system',
                isVisible: true,
                hasChat: true,
                isPremium: false,
                playlist: [],
                currentVideoIndex: 0,
                playbackState: { isPlaying: false, currentTime: 0, lastUpdated: Date.now() }
            });
            changed = true;
        }
    }
    if (changed) saveDb();
};

loadDb();
ensurePublicRooms();
refreshMovies();

// DISCORD BOT MANAGER
let discordClient = null;
let discordStatus = 'OFFLINE';
let discordLogs = [];

function addDiscordLog(message, type = 'info') {
    const log = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        message,
        type // 'info', 'error', 'success'
    };
    discordLogs.unshift(log);
    if (discordLogs.length > 50) discordLogs.pop();
    console.log(`[Discord Bot] ${type.toUpperCase()}: ${message}`);
}

async function startDiscordBot() {
    const token = db.discordConfig?.token;
    const clientId = db.discordConfig?.clientId;

    if (!token || !clientId) {
        discordStatus = 'MISSING_CONFIG';
        addDiscordLog("Configuration manquante : Token ou Client ID absent.", "error");
        return;
    }

    try {
        if (discordClient) {
            addDiscordLog("Redémarrage du bot...", "info");
            await discordClient.destroy();
        }

        discordClient = new Client({ 
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages
            ] 
        });
        discordStatus = 'STARTING';
        addDiscordLog("Tentative de connexion...", "info");

        discordClient.on('clientReady', async () => {
            discordStatus = 'ONLINE';
            addDiscordLog(`Connecté en tant que ${discordClient.user.tag}`, "success");
            
            // Set Presence
            discordClient.user.setActivity('Watch Together Français', { 
                type: ActivityType.Watching,
                url: 'http://brokhometv.ddns.net'
            });

            const commands = [
                new SlashCommandBuilder()
                    .setName('liaison')
                    .setDescription('Lier votre compte BrokHomeTV avec votre abonnement Ko-fi')
                    .addStringOption(option => 
                        option.setName('username')
                            .setDescription('Votre nom d\'utilisateur sur BrokHomeTV')
                            .setRequired(true))
                    .addStringOption(option => 
                        option.setName('kofi_info')
                            .setDescription('ID de facture ou pseudo Ko-fi utilisé pour l\'abonnement')
                            .setRequired(true)),
                new SlashCommandBuilder()
                    .setName('help')
                    .setDescription('Afficher la liste des commandes disponibles'),
                new SlashCommandBuilder()
                    .setName('ping')
                    .setDescription('Vérifier la latence du bot'),
                new SlashCommandBuilder()
                    .setName('site')
                    .setDescription('Obtenir le lien du site BrokHomeTV'),
                new SlashCommandBuilder()
                    .setName('clear')
                    .setDescription('Supprimer un nombre de messages')
                    .addIntegerOption(option => 
                        option.setName('nombre')
                            .setDescription('Nombre de messages à supprimer (1-100)')
                            .setRequired(true)),
                new SlashCommandBuilder()
                    .setName('play')
                    .setDescription('Jouer de la musique (Spotify/YouTube)')
                    .addStringOption(option => 
                        option.setName('recherche')
                            .setDescription('Lien ou nom de la musique')
                            .setRequired(true)),
                new SlashCommandBuilder()
                    .setName('skip')
                    .setDescription('Passer à la musique suivante')
            ].map(command => command.toJSON());

            const rest = new REST({ version: '10' }).setToken(token);
            try {
                addDiscordLog("Enregistrement des slash commands...", "info");
                await rest.put(Routes.applicationCommands(clientId), { body: commands });
                addDiscordLog("Slash commands enregistrées avec succès.", "success");
            } catch (error) {
                addDiscordLog(`Erreur slash commands: ${error.message}`, "error");
                console.error('Erreur enregistrement commands Discord:', error);
            }
        });

        discordClient.on('error', (error) => {
            addDiscordLog(`Erreur client: ${error.message}`, "error");
        });

        discordClient.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return;

            const { commandName } = interaction;

            if (commandName === 'liaison') {
                const username = interaction.options.getString('username');
                const kofiInfo = interaction.options.getString('kofi_info');
                const discordId = interaction.user.id;

                addDiscordLog(`Commande /liaison reçue de ${interaction.user.tag} pour ${username}`, "info");

                const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
                if (!user) {
                    addDiscordLog(`Liaison échouée: Utilisateur "${username}" non trouvé`, "error");
                    return interaction.reply({ content: `❌ Utilisateur "${username}" non trouvé sur BrokHomeTV.`, ephemeral: true });
                }

                if (user.discordId === discordId) {
                    addDiscordLog(`Liaison: ${username} est déjà lié à ce compte Discord`, "info");
                    return interaction.reply({ content: `ℹ️ Votre compte BrokHomeTV "${username}" est déjà lié à votre profil Discord.`, ephemeral: true });
                }

                const isValid = db.validSubscriptions.some(s => s.toLowerCase() === kofiInfo.toLowerCase());
                if (!isValid) {
                    addDiscordLog(`Liaison échouée: ID Ko-fi "${kofiInfo}" invalide`, "error");
                    return interaction.reply({ content: `❌ L'ID de facture ou pseudo Ko-fi "${kofiInfo}" n'est pas reconnu ou n'est pas encore validé.`, ephemeral: true });
                }

                user.isPremium = true;
                user.discordId = discordId;
                user.kofiUsername = kofiInfo;
                saveDb();

                addDiscordLog(`Liaison réussie: ${username} est maintenant PREMIUM`, "success");
                
                const embed = {
                    color: 0xe50914,
                    title: '✅ Liaison Réussie !',
                    description: `Félicitations <@${discordId}> !\n\nVotre compte **BrokHomeTV** \`${username}\` est désormais **PREMIUM**.\n\nProfitez de tous les avantages sur [brokhometv.ddns.net](http://brokhometv.ddns.net)`,
                    thumbnail: { url: interaction.user.displayAvatarURL() },
                    timestamp: new Date().toISOString()
                };

                return interaction.reply({ embeds: [embed], ephemeral: false });
            }

            if (commandName === 'help') {
                const embed = {
                    color: 0xe50914,
                    title: '🤖 Commandes BrokHomeTV',
                    description: 'Voici la liste des commandes disponibles :',
                    fields: [
                        { name: '`/liaison`', value: 'Lier votre compte site avec votre abonnement Ko-fi.' },
                        { name: '`/site`', value: 'Obtenir le lien direct vers BrokHomeTV.' },
                        { name: '`/ping`', value: 'Vérifier la latence du bot.' },
                        { name: '`/play`', value: 'Jouer de la musique (Bientôt disponible).' },
                        { name: '`/clear`', value: 'Supprimer des messages (Admin uniquement).' }
                    ],
                    footer: { text: 'BrokHomeTV - Watch Together Français' }
                };
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            if (commandName === 'ping') {
                return interaction.reply({ content: `🏓 Pong! Latence: \`${Math.round(discordClient.ws.ping)}ms\``, ephemeral: true });
            }

            if (commandName === 'site') {
                return interaction.reply({ content: `🌐 Accédez à BrokHomeTV ici : http://brokhometv.ddns.net`, ephemeral: false });
            }

            if (commandName === 'clear') {
                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                    return interaction.reply({ content: '❌ Vous n\'avez pas la permission de supprimer des messages.', ephemeral: true });
                }
                const amount = interaction.options.getInteger('nombre');
                if (amount < 1 || amount > 100) return interaction.reply({ content: 'Veuillez choisir un nombre entre 1 et 100.', ephemeral: true });
                
                await interaction.channel.bulkDelete(amount, true);
                return interaction.reply({ content: `✅ \`${amount}\` messages supprimés.`, ephemeral: true });
            }

            if (commandName === 'play') {
                const query = interaction.options.getString('recherche');
                addDiscordLog(`Commande /play: ${query} par ${interaction.user.tag}`, "info");
                
                const guildId = interaction.guildId;
                const member = interaction.member;
                const voiceChannel = member.voice.channel;

                if (!voiceChannel) {
                    return interaction.reply({ content: "❌ Vous devez être dans un salon vocal !", ephemeral: true });
                }

                await interaction.deferReply();

                try {
                    const searchResults = await play.search(query, { limit: 1 });
                    if (searchResults.length === 0) {
                        return interaction.editReply("❌ Aucun résultat trouvé.");
                    }

                    const track = {
                        id: Date.now().toString(),
                        title: searchResults[0].title,
                        artist: searchResults[0].channel?.name || "Inconnu",
                        duration: searchResults[0].durationRaw,
                        url: searchResults[0].url,
                        image: searchResults[0].thumbnails[0]?.url,
                        source: 'youtube'
                    };

                    const channelId = voiceChannel.id;
                    if (!musicDb.playlists[channelId]) musicDb.playlists[channelId] = [];
                    musicDb.playlists[channelId].push(track);
                    saveMusicDb();

                    // Join if not connected
                    if (!voiceConnections.has(guildId)) {
                        const connection = joinVoiceChannel({
                            channelId: voiceChannel.id,
                            guildId: guildId,
                            adapterCreator: interaction.guild.voiceAdapterCreator,
                        });
                        voiceConnections.set(guildId, connection);
                    }

                    const player = audioPlayers.get(guildId);
                    if (!player || player.state.status === AudioPlayerStatus.Idle) {
                        playNext(guildId, channelId);
                    }

                    return interaction.editReply(`🎵 Ajouté à la file d'attente du salon **${voiceChannel.name}** : **${track.title}**`);
                } catch (err) {
                    console.error(err);
                    return interaction.editReply("❌ Erreur lors de la lecture.");
                }
            }

            if (commandName === 'skip') {
                const guildId = interaction.guildId;
                const connection = voiceConnections.get(guildId);
                if (!connection) return interaction.reply({ content: "❌ Le bot n'est pas connecté à un salon vocal.", ephemeral: true });
                
                const channelId = connection.joinConfig.channelId;
                addDiscordLog(`Commande /skip par ${interaction.user.tag}`, "info");
                
                if (musicDb.playlists[channelId] && musicDb.playlists[channelId].length > 0) {
                    musicDb.playlists[channelId].shift();
                    saveMusicDb();
                    playNext(guildId, channelId);
                    return interaction.reply({ content: '⏭️ Musique passée !', ephemeral: false });
                }
                return interaction.reply({ content: 'ℹ️ La file d\'attente est vide.', ephemeral: true });
            }
        });

        await discordClient.login(token);
    } catch (e) {
        addDiscordLog(`Erreur fatale: ${e.message}`, "error");
        console.error("Erreur Discord Bot:", e);
        discordStatus = 'ERROR';
    }
}

async function stopDiscordBot() {
    if (discordClient) {
        await discordClient.destroy();
        discordClient = null;
        addDiscordLog("Bot arrêté manuellement.", "info");
    }
    discordStatus = 'OFFLINE';
}

// MUSIC BOT LOGIC
const voiceConnections = new Map();
const audioPlayers = new Map();

async function playNext(guildId, channelId) {
    const playlist = musicDb.playlists[channelId] || [];
    if (playlist.length === 0) {
        const player = audioPlayers.get(guildId);
        if (player) player.stop();
        return;
    }

    const track = playlist[0];
    try {
        let player = audioPlayers.get(guildId);
        if (!player) {
            player = createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Play }
            });
            audioPlayers.set(guildId, player);
        }

        const connection = voiceConnections.get(guildId);
        if (connection) connection.subscribe(player);

        addDiscordLog(`Lecture de : ${track.title} dans ${channelId}`, "info");

        let stream;
        try {
            let urlToStream = track.url;
            if (!urlToStream || !urlToStream.startsWith('http')) {
                const searchResults = await play.search(track.title + " " + (track.artist || ""), { limit: 1 });
                if (searchResults.length === 0) throw new Error("No results found");
                urlToStream = searchResults[0].url;
            }
            if (!urlToStream) throw new Error("Invalid URL");
            stream = await play.stream(urlToStream);
        } catch (err) {
            console.error("Stream error:", err);
            throw err;
        }

        const resource = createAudioResource(stream.stream, { inputType: stream.type });
        player.play(resource);

        player.removeAllListeners(AudioPlayerStatus.Idle);
        player.once(AudioPlayerStatus.Idle, () => {
            if (musicDb.playlists[channelId]) {
                musicDb.playlists[channelId].shift();
                saveMusicDb();
                playNext(guildId, channelId);
            }
        });

    } catch (e) {
        console.error("Error playing music:", e);
        if (musicDb.playlists[channelId]) {
            musicDb.playlists[channelId].shift();
            saveMusicDb();
            playNext(guildId, channelId);
        }
    }
}

// Initial start if config exists
if (db.discordConfig?.autoStart) {
    startDiscordBot();
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// GESTION DES CHEMINS (ADMIN)
// DISCORD API
app.get('/api/discord/voice-channels', async (req, res) => {
    if (!discordClient || discordStatus !== 'ONLINE') {
        return res.json([]);
    }

    try {
        const guildId = "1175391905463422997";
        const guild = await discordClient.guilds.fetch(guildId);
        if (!guild) return res.json([]);

        const channels = guild.channels.cache
            .filter(c => c.type === 2) // 2 is GuildVoice
            .map(c => ({
                id: c.id,
                name: c.name,
                members: c.members.size,
                botConnected: voiceConnections.has(guildId) && voiceConnections.get(guildId).joinConfig.channelId === c.id
            }));
        
        res.json(channels);
    } catch (error) {
        console.error("Error fetching voice channels:", error);
        res.status(500).json({ error: "Failed to fetch voice channels" });
    }
});

app.post('/api/discord/voice/join', async (req, res) => {
    const { channelId, guildId } = req.body;
    if (!discordClient) return res.status(500).json({ error: "Bot not started" });

    try {
        const guild = discordClient.guilds.cache.get(guildId);
        if (!guild) throw new Error("Guild not found");

        const connection = joinVoiceChannel({
            channelId: channelId,
            guildId: guildId,
            adapterCreator: guild.voiceAdapterCreator,
        });

        voiceConnections.set(guildId, connection);
        
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    enterState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    enterState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch (error) {
                connection.destroy();
                voiceConnections.delete(guildId);
            }
        });

        // Start playing channel playlist
        playNext(guildId, channelId);

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/discord/voice/leave', (req, res) => {
    const { guildId } = req.body;
    const connection = voiceConnections.get(guildId);
    if (connection) {
        connection.destroy();
        voiceConnections.delete(guildId);
    }
    const player = audioPlayers.get(guildId);
    if (player) {
        player.stop();
        audioPlayers.delete(guildId);
    }
    res.json({ success: true });
});

app.get('/api/discord/playlist/:channelId', (req, res) => {
    res.json(musicDb.playlists[req.params.channelId] || []);
});

app.post('/api/discord/playlist/:channelId/add', (req, res) => {
    const { track, guildId } = req.body;
    const { channelId } = req.params;
    if (!musicDb.playlists[channelId]) musicDb.playlists[channelId] = [];
    musicDb.playlists[channelId].push(track);
    saveMusicDb();

    // If bot is in this channel and nothing is playing, start playing
    const connection = voiceConnections.get(guildId);
    if (connection && connection.joinConfig.channelId === channelId) {
        const player = audioPlayers.get(guildId);
        if (!player || player.state.status === AudioPlayerStatus.Idle) {
            playNext(guildId, channelId);
        }
    }

    res.json(musicDb.playlists[channelId]);
});

app.post('/api/discord/playlist/:channelId/remove', (req, res) => {
    const { trackId, guildId } = req.body;
    const { channelId } = req.params;
    if (musicDb.playlists[channelId]) {
        const wasFirst = musicDb.playlists[channelId][0]?.id === trackId;
        musicDb.playlists[channelId] = musicDb.playlists[channelId].filter(t => t.id !== trackId);
        saveMusicDb();

        if (wasFirst) {
            const connection = voiceConnections.get(guildId);
            if (connection && connection.joinConfig.channelId === channelId) {
                playNext(guildId, channelId);
            }
        }
    }
    res.json(musicDb.playlists[channelId] || []);
});

// SPOTIFY API INTEGRATION
let spotifyAccessToken = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) return null;

    if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
        return spotifyAccessToken;
    }

    try {
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${auth}`
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();
        if (data.access_token) {
            spotifyAccessToken = data.access_token;
            spotifyTokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
            return spotifyAccessToken;
        }
        return null;
    } catch (e) {
        console.error("Spotify Auth Error:", e);
        return null;
    }
}

app.get('/api/spotify/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const token = await getSpotifyToken();
    
    if (!token) {
        // Fallback to mock if no credentials
        const mockResults = [
            { id: 's1', title: `${q} - Spotify Mix (Mode Démo)`, artist: 'Spotify', duration: '3:45', source: 'spotify' },
            { id: 's2', title: `Best of ${q} (Mode Démo)`, artist: 'Various Artists', duration: '4:20', source: 'spotify' }
        ];
        return res.json(mockResults);
    }

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const results = data.tracks.items.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            duration: `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`,
            source: 'spotify',
            image: track.album.images[0]?.url
        }));
        
        res.json(results);
    } catch (e) {
        console.error("Spotify Search Error:", e);
        res.status(500).json({ error: "Spotify search failed" });
    }
});

app.get('/api/admin/roles', (req, res) => res.json(db.roles));

app.post('/api/admin/roles', (req, res) => {
    const { role } = req.body;
    const existing = db.roles.find(r => r.id === role.id);
    if (existing) {
        Object.assign(existing, role);
    } else {
        db.roles.push(role);
    }
    saveDb();
    res.json(db.roles);
});

app.delete('/api/admin/roles/:id', (req, res) => {
    db.roles = db.roles.filter(r => r.id !== req.params.id);
    saveDb();
    res.json(db.roles);
});

app.post('/api/admin/users/role', (req, res) => {
    const { userId, roleId } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) {
        user.roleId = roleId;
        saveDb();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Utilisateur non trouvé" });
    }
});

app.get('/api/users/count', (req, res) => {
    res.json({ count: db.users.length });
});

app.get('/api/admin/user-goals', (req, res) => {
    res.json(db.userGoals || []);
});

app.post('/api/admin/user-goals', (req, res) => {
    const { goal } = req.body;
    if (!db.userGoals) db.userGoals = [];
    
    const existingIndex = db.userGoals.findIndex(g => g.id === goal.id);
    if (existingIndex > -1) {
        db.userGoals[existingIndex] = goal;
    } else {
        db.userGoals.push({ ...goal, id: 'goal-' + Date.now() });
    }
    
    saveDb();
    res.json(db.userGoals);
});

app.delete('/api/admin/user-goals/:id', (req, res) => {
    if (db.userGoals) {
        db.userGoals = db.userGoals.filter(g => g.id !== req.params.id);
        saveDb();
    }
    res.json(db.userGoals || []);
});

app.get('/api/suggestions', (req, res) => res.json(db.suggestions || []));

app.post('/api/suggestions', (req, res) => {
    const { userId, username, type, content } = req.body;
    const suggestion = {
        id: 's-' + Date.now(),
        userId,
        username,
        type,
        content,
        timestamp: Date.now()
    };
    if (!db.suggestions) db.suggestions = [];
    db.suggestions.push(suggestion);
    saveDb();
    res.json(suggestion);
});

app.get('/api/admin/online-users', (req, res) => {
    const online = [];
    const sockets = io.sockets.sockets;
    sockets.forEach((socket) => {
        if (socket.user) {
            const roomIds = Array.from(socket.rooms).filter(r => r !== socket.id);
            const roomNames = roomIds.map(id => db.rooms.find(r => r.id === id)?.name).filter(Boolean);
            online.push({
                username: socket.user.username,
                rooms: roomNames
            });
        }
    });
    res.json(online);
});

// DISCORD BOT ENDPOINTS
app.get('/api/admin/discord/status', (req, res) => {
    res.json({ 
        status: discordStatus,
        config: db.discordConfig || { token: '', clientId: '', autoStart: false }
    });
});

app.get('/api/admin/discord/logs', (req, res) => {
    res.json(discordLogs);
});

app.post('/api/admin/discord/logs/clear', (req, res) => {
    discordLogs = [];
    res.json({ success: true });
});

app.post('/api/admin/discord/config', (req, res) => {
    const { token, clientId, autoStart } = req.body;
    db.discordConfig = { token, clientId, autoStart };
    saveDb();
    res.json({ success: true, config: db.discordConfig });
});

app.post('/api/admin/discord/toggle', async (req, res) => {
    const { action } = req.body;
    if (action === 'start') {
        await startDiscordBot();
    } else {
        await stopDiscordBot();
    }
    res.json({ success: true, status: discordStatus });
});

app.post('/api/admin/paths/toggle-premium', (req, res) => {
    const { path: targetPath } = req.body;
    const pathObj = db.videoPaths.find(p => p.path === targetPath);
    if (pathObj) {
        pathObj.isPremium = !pathObj.isPremium;
        saveDb();
        refreshMovies();
        res.json({ paths: db.videoPaths });
    } else {
        res.status(404).json({ error: "Chemin non trouvé" });
    }
});

app.get('/api/admin/fonts', (req, res) => {
    const fontsDir = path.join(__dirname, 'public', 'fonts');
    if (!fs.existsSync(fontsDir)) {
        return res.json(['Inter', 'Arial', 'Verdana', 'Georgia']);
    }
    const files = fs.readdirSync(fontsDir);
    const fonts = ['Inter', ...files.filter(f => f.endsWith('.ttf') || f.endsWith('.otf') || f.endsWith('.woff') || f.endsWith('.woff2')).map(f => f.split('.')[0])];
    res.json(fonts);
});

app.post('/api/admin/config/font', (req, res) => {
    const { font } = req.body;
    if (!db.config) db.config = { showCarousels: true };
    db.config.brokhometvFont = font;
    saveDb();
    io.emit('config-updated', db.config);
    res.json(db.config);
});

app.get('/api/admin/disks', (req, res) => {
    // Simulation de détection de disques pour l'exemple
    // Sur Windows, on pourrait utiliser 'wmic logicaldisk get name'
    // Sur Linux, 'df -h'
    // Ici on retourne une liste statique ou simulée
    res.json(['/volume2/Medias', '/app/medias', 'C:', 'D:', 'E:', 'F:', 'G:', 'H:', 'I:', '/mnt/data', '/media/usb']);
});

app.post('/api/admin/paths', (req, res) => {
    const { path: newPath, isPremium } = req.body;
    if (!newPath) return res.status(400).json({ error: "Chemin manquant" });
    if (!fs.existsSync(newPath)) return res.status(400).json({ error: "Le chemin n'existe pas sur le serveur" });
    if (db.videoPaths.find(p => p.path === newPath)) return res.status(400).json({ error: "Chemin déjà indexé" });
    
    db.videoPaths.push({ path: newPath, isPremium: !!isPremium });
    saveDb();
    refreshMovies();
    res.json({ paths: db.videoPaths, count: db.localMovies.length });
});

app.delete('/api/admin/paths', (req, res) => {
    const { path: targetPath } = req.body;
    db.videoPaths = db.videoPaths.filter(p => p.path !== targetPath);
    saveDb();
    refreshMovies();
    res.json({ paths: db.videoPaths });
});

app.get('/api/admin/catalog-folders', (req, res) => res.json(db.catalogFolders || []));

app.post('/api/admin/catalog-folders', (req, res) => {
    const { folder } = req.body;
    if (!db.catalogFolders) db.catalogFolders = [];
    const existing = db.catalogFolders.find(f => f.path === folder.path);
    if (existing) {
        Object.assign(existing, folder);
    } else {
        db.catalogFolders.push(folder);
    }
    saveDb();
    res.json(db.catalogFolders);
});

app.delete('/api/admin/catalog-folders', (req, res) => {
    const { path: targetPath } = req.body;
    db.catalogFolders = (db.catalogFolders || []).filter(f => f.path !== targetPath);
    saveDb();
    res.json(db.catalogFolders);
});

app.post('/api/admin/refresh-movies', (req, res) => {
    const movies = refreshMovies();
    res.json({ count: movies.length });
});

// ROUTES STANDARDS
app.get('/video/local/:path', (req, res) => {
    const moviePath = decodeURIComponent(req.params.path);
    let fullPath = "";
    for(const vPath of db.videoPaths) {
        const root = typeof vPath === 'string' ? vPath : vPath.path;
        const potential = path.join(root, moviePath);
        if(fs.existsSync(potential)) {
            fullPath = potential;
            break;
        }
    }
    if(!fullPath) return res.status(404).send("Non trouvé");
    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(fullPath, { start, end });
        const head = { 'Content-Range': `bytes ${start}-${end}/${fileSize}`, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = { 'Content-Length': fileSize, 'Content-Type': 'video/mp4' };
        res.writeHead(200, head);
        fs.createReadStream(fullPath).pipe(res);
    }
});

app.get('/api/config', (req, res) => res.json(db.config || { showCarousels: true }));

app.post('/api/admin/config', (req, res) => {
    const { showCarousels } = req.body;
    if (typeof showCarousels === 'boolean') {
        db.config = { ...db.config, showCarousels };
        saveDb();
        io.emit('config-updated', db.config);
        res.json(db.config);
    } else {
        res.status(400).json({ error: "Valeur invalide" });
    }
});

app.get('/api/users', (req, res) => res.json(db.users.map(hydrateUser)));

app.post('/api/register', (req, res) => {
    const { username, password, avatarStyle } = req.body;
    const style = avatarStyle || 'avataaars';
    const u = { 
        id: 'u-' + Date.now(), 
        username, 
        password, 
        roleId: db.users.length === 0 ? 'admin' : 'member', 
        avatar: `https://api.dicebear.com/7.x/${style}/svg?seed=${username}`, 
        stats: { totalMinutes: 0, roomsCreated: 0 }, 
        isPremium: db.users.length === 0 
    };
    db.users.push(u); saveDb(); res.json(hydrateUser(u));
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const u = db.users.find(x => x.username === username && x.password === password);
    if (!u) return res.status(401).json({ error: "Erreur identifiants" });
    res.json(hydrateUser(u));
});

app.post('/api/guest', (req, res) => {
    const guestId = 'guest-' + Math.random().toString(36).substring(4);
    const u = {
        id: guestId,
        username: 'Invité-' + Math.floor(100 + Math.random() * 900),
        roleId: 'guest',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
        stats: { totalMinutes: 0, roomsCreated: 0 },
        isGuest: true,
        isPremium: false
    };
    db.users.push(u);
    saveDb();
    res.json(hydrateUser(u));
});

app.get('/api/rooms', (req, res) => res.json(db.rooms));
app.get('/api/rooms/:id', (req, res) => res.json(db.rooms.find(x => x.id === req.params.id)));

app.post('/api/rooms', (req, res) => {
    const { name, ownerId, password, isVisible, hasChat, initialMovie } = req.body;
    const user = db.users.find(u => u.id === ownerId);
    
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    if (user.roleId === 'guest') {
        return res.status(403).json({ error: "Les invités ne peuvent pas créer de salons." });
    }
    
    const hydrated = hydrateUser(user);
    
    const r = { 
        id: 'room-'+Date.now(), 
        name, 
        ownerId, 
        password, 
        isVisible, 
        hasChat: hasChat !== undefined ? hasChat : true,
        isPremium: hydrated.isPremium || hydrated.roleId === 'admin',
        playlist: initialMovie ? [{ ...initialMovie, id: 'p-'+Date.now() }] : [], 
        currentVideoIndex: 0, 
        playbackState: req.body.initialPlaybackState || { isPlaying: false, currentTime: 0, lastUpdated: Date.now() } 
    };
    db.rooms.push(r); saveDb();
    res.json({ room: r, user: hydrateUser(db.users.find(u => u.id === ownerId)) });
});

app.delete('/api/rooms/:id', (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;
    const index = db.rooms.findIndex(r => r.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "Salon non trouvé." });
    }
    const room = db.rooms[index];
    const user = db.users.find(u => u.id === userId);
    if (!user) {
        return res.status(401).json({ error: "Authentification requise." });
    }
    if (room.ownerId === userId || user.roleId === 'admin') {
        db.rooms.splice(index, 1);
        saveDb();
        io.emit('rooms-updated', db.rooms);
        io.to(id).emit('room-deleted');
        return res.json({ success: true, rooms: db.rooms });
    } else {
        return res.status(403).json({ error: "Vous n'avez pas l'autorisation de supprimer ce salon." });
    }
});

app.put('/api/rooms/:id', (req, res) => {
    const { id } = req.params;
    const { newName, password, isVisible, hasChat, isPremium, userId } = req.body;
    const room = db.rooms.find(r => r.id === id);
    if (!room) {
        return res.status(404).json({ error: "Salon non trouvé." });
    }
    const user = db.users.find(u => u.id === userId);
    if (!user) {
        return res.status(401).json({ error: "Authentification requise." });
    }
    if (room.ownerId === userId || user.roleId === 'admin') {
        if (newName !== undefined) room.name = newName;
        if (password !== undefined) room.password = password;
        if (isVisible !== undefined) room.isVisible = isVisible;
        if (hasChat !== undefined) room.hasChat = hasChat;
        if (isPremium !== undefined) room.isPremium = isPremium;
        saveDb();
        io.emit('rooms-updated', db.rooms);
        emitRoomUpdate(id);
        return res.json({ success: true, room });
    } else {
        return res.status(403).json({ error: "Vous n'avez pas l'autorisation de modifier ce salon." });
    }
});

app.post('/api/rooms/:id/playlist', (req, res) => {
    const { id } = req.params;
    const { item, userId } = req.body;
    const room = db.rooms.find(r => r.id === id);
    const user = db.users.find(u => u.id === userId);
    if (!room || !user) return res.status(404).json({ error: "Non trouvé" });
    
    const hydrated = hydrateUser(user);
    
    if (room.isPremium && !hydrated.isPremium && hydrated.roleId !== 'admin') {
        return res.status(403).json({ error: "Accès restreint : Seuls les membres Premium peuvent modifier la playlist d'un salon Premium." });
    }

    if (item.isLocal && item.localPath) {
        const movie = db.localMovies.find(m => m.path === item.localPath);
        if (movie && movie.rootPath && movie.rootPath.startsWith('H:') && !hydrated.isPremium && hydrated.roleId !== 'admin') {
            return res.status(403).json({ error: "Ce contenu est réservé aux membres Premium." });
        }
    }

    room.playlist.push({ ...item, id: 'p-'+Date.now() });
    saveDb();
    io.to(id).emit('room-update', room);
    res.json({ success: true });
});

// WEBHOOK KO-FI
app.post('/api/webhooks/kofi', (req, res) => {
    const data = req.body;
    
    try {
        const payload = JSON.parse(data.data);
        const kofiName = payload.from_name;
        const transactionId = payload.kofi_transaction_id;
        
        if (!db.validSubscriptions) db.validSubscriptions = [];
        
        // On ajoute le nom et l'ID de transaction à la liste des abonnements valides
        if (kofiName) db.validSubscriptions.push(kofiName);
        if (transactionId) db.validSubscriptions.push(transactionId);
        
        saveDb();
        console.log(`Nouvel abonnement Ko-fi reçu de ${kofiName} (ID: ${transactionId})`);
        
        // Tentative de liaison automatique si l'utilisateur existe déjà
        const user = db.users.find(u => u.username.toLowerCase() === kofiName.toLowerCase());
        if (user) {
            user.isPremium = true;
            user.kofiUsername = kofiName;
            saveDb();
        }
    } catch (e) {
        console.error("Erreur webhook Ko-fi:", e);
    }
    
    res.status(200).end();
});

app.get('/api/catalogue', (req, res) => {
    const catalogue = {};
    const premiumPaths = db.videoPaths.filter(p => p.isPremium).map(p => p.path);
    const catalogFolders = db.catalogFolders || [];

    db.localMovies.forEach(movie => {
        if (movie.isDirectory) return;
        
        // Si des dossiers de catalogue sont définis, on ne montre que ceux-là
        if (catalogFolders.length > 0) {
            const isInCatalog = catalogFolders.some(cf => movie.path.startsWith(cf.path));
            if (!isInCatalog) return;
        }

        // Ignorer les fichiers qui contiennent "episode" + numéro
        if (/episode\s*\d+/i.test(movie.name)) return;

        const parts = movie.path.split('/');
        let title = parts[0];
        // Nettoyer le titre (enlever S1, etc.)
        title = title.replace(/S\d+/i, '').trim();

        let seasons = new Set();
        parts.forEach(part => {
            const seasonMatch = part.match(/S(\d+)/i);
            if (seasonMatch) {
                seasons.add(seasonMatch[0].toUpperCase());
            }
        });

        const isPremium = premiumPaths.some(pp => movie.rootPath && movie.rootPath.startsWith(pp));
        const folderConfig = catalogFolders.find(cf => movie.path.startsWith(cf.path));

        if (!catalogue[title]) {
            catalogue[title] = {
                name: title,
                seasons: new Set(),
                path: movie.path,
                isPremium,
                image: folderConfig?.image || null
            };
        }
        seasons.forEach(s => catalogue[title].seasons.add(s));
    });

    const result = Object.values(catalogue).map(item => ({
        ...item,
        seasons: item.seasons.size
    }));

    res.json(result);
});

app.get('/api/local-movies', (req, res) => {
    const userId = req.query.userId;
    const roomId = req.query.roomId;
    const user = db.users.find(u => u.id === userId);
    const hydrated = hydrateUser(user);
    
    const premiumPaths = db.videoPaths.filter(p => p.isPremium).map(p => p.path);
    const isPublicRoom = roomId && roomId.startsWith('public-room-');
    
    // Attacher isPremium à chaque film
    const moviesWithPremium = db.localMovies.map(m => ({
        ...m,
        isPremium: premiumPaths.some(pp => m.rootPath && m.rootPath.startsWith(pp))
    }));

    if (hydrated && (hydrated.isPremium || hydrated.roleId === 'admin' || isPublicRoom)) {
        return res.json(moviesWithPremium);
    }
    
    // Filtre pour les non-premium : exclure les chemins premium
    const filtered = moviesWithPremium.filter(m => !m.isPremium);
    res.json(filtered);
});
// GESTION DES SALONS (ADMIN)
app.post('/api/admin/rooms/premium', (req, res) => {
    const { roomId, isPremium } = req.body;
    const room = db.rooms.find(r => r.id === roomId);
    if (room) {
        room.isPremium = isPremium;
        saveDb();
        io.emit('rooms-updated', db.rooms);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Salon non trouvé" });
    }
});

app.get('/api/admin/rooms', (req, res) => res.json(db.rooms));

app.post('/api/admin/notification', (req, res) => {
    const { message, duration } = req.body;
    if (message) {
        db.systemNotification = {
            id: 'n-' + Date.now(),
            message,
            expiresAt: duration ? Date.now() + (duration * 60000) : null
        };
    } else {
        db.systemNotification = null;
    }
    saveDb();
    io.emit('system-notification', db.systemNotification);
    res.json({ success: true, notification: db.systemNotification });
});

app.get('/api/system-notification', (req, res) => {
    if (db.systemNotification && db.systemNotification.expiresAt && db.systemNotification.expiresAt < Date.now()) {
        db.systemNotification = null;
        saveDb();
    }
    res.json(db.systemNotification);
});

app.get('/api/leaderboard', (req, res) => res.json(db.users.map(hydrateUser).sort((a,b) => b.stats.totalMinutes - a.stats.totalMinutes).slice(0,10)));

app.post('/api/users/profile', (req, res) => {
    const { userId, kofiUsername, avatar } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (user) {
        if (kofiUsername !== undefined) user.kofiUsername = kofiUsername;
        if (avatar !== undefined) user.avatar = avatar;
        saveDb();
        res.json(hydrateUser(user));
    } else {
        res.status(404).json({ error: "Utilisateur non trouvé" });
    }
});

app.post('/api/users/verify-premium', (req, res) => {
    const { userId } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    
    if (!user.kofiUsername) {
        return res.status(400).json({ error: "Veuillez d'abord renseigner votre pseudo Ko-fi dans votre profil." });
    }

    // Simulation d'une vérification API Ko-fi
    // Dans un cas réel, on appellerait l'API Ko-fi ici
    // Pour la démo, on accepte seulement si le pseudo contient "PREMIUM"
    const isSubscribed = user.kofiUsername.toUpperCase().includes('PREMIUM'); 
    
    if (isSubscribed) {
        user.isPremium = true;
        saveDb();
        res.json({ success: true, user: hydrateUser(user) });
    } else {
        res.status(400).json({ error: "Aucun abonnement actif trouvé pour ce pseudo sur Ko-fi." });
    }
});

app.get('/api/global-chat', (req, res) => res.json(db.globalMessages || []));

const emitRoomUpdate = (roomId) => {
    const room = db.rooms.find(r => r.id === roomId);
    if (room) {
        const memberCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        io.to(roomId).emit('room-update', { ...room, memberCount });
    }
};

const activeConnections = new Map();

io.on('connection', (socket) => {
    socket.on('identify', (user) => {
        socket.user = user;
        if (user && user.id) {
            socket.userId = user.id;
            const currentCount = activeConnections.get(user.id) || 0;
            activeConnections.set(user.id, currentCount + 1);
            
            if (user.roleId === 'guest') {
                const uObj = db.users.find(u => u.id === user.id);
                if (uObj) {
                    delete uObj.lastSeen;
                    saveDb();
                }
            }
        }
    });

    socket.on('join-room', ({ roomId }) => {
        socket.join(roomId);
        emitRoomUpdate(roomId);
    });

    socket.on('delete-room', ({ roomId, userId }) => {
        const index = db.rooms.findIndex(r => r.id === roomId);
        if (index !== -1) {
            const room = db.rooms[index];
            const user = db.users.find(u => u.id === userId);
            if (user && (room.ownerId === userId || user.roleId === 'admin')) {
                db.rooms.splice(index, 1);
                saveDb();
                io.emit('rooms-updated', db.rooms);
                io.to(roomId).emit('room-deleted');
            }
        }
    });

    socket.on('rename-room', ({ roomId, newName, userId }) => {
        const room = db.rooms.find(r => r.id === roomId);
        if (room) {
            const user = db.users.find(u => u.id === userId);
            if (user && (room.ownerId === userId || user.roleId === 'admin')) {
                room.name = newName;
                saveDb();
                io.emit('rooms-updated', db.rooms);
                emitRoomUpdate(roomId);
            }
        }
    });

    socket.on('update-room', ({ roomId, newName, password, isVisible, hasChat, isPremium, userId }) => {
        const room = db.rooms.find(r => r.id === roomId);
        if (room) {
            const user = db.users.find(u => u.id === userId);
            if (user && (room.ownerId === userId || user.roleId === 'admin')) {
                if (newName !== undefined) room.name = newName;
                if (password !== undefined) room.password = password;
                if (isVisible !== undefined) room.isVisible = isVisible;
                if (hasChat !== undefined) room.hasChat = hasChat;
                if (isPremium !== undefined) room.isPremium = isPremium;
                saveDb();
                io.emit('rooms-updated', db.rooms);
                emitRoomUpdate(roomId);
            }
        }
    });

    socket.on('disconnecting', () => {
        for (const roomId of socket.rooms) {
            if (roomId !== socket.id) {
                // On attend un peu que le socket soit effectivement sorti pour compter
                setTimeout(() => emitRoomUpdate(roomId), 100);
            }
        }
    });

    socket.on('disconnect', () => {
        if (socket.userId) {
            const count = activeConnections.get(socket.userId) || 0;
            if (count <= 1) {
                activeConnections.delete(socket.userId);
                
                const userObj = db.users.find(u => u.id === socket.userId);
                if (userObj && userObj.roleId === 'guest') {
                    userObj.lastSeen = Date.now();
                    saveDb();
                }
            } else {
                activeConnections.set(socket.userId, count - 1);
            }
        }
    });

    socket.on('save-playback-history', ({ roomId, userId, video, currentTime }) => {
        const user = db.users.find(u => u.id === userId);
        if (user && video) {
            user.lastPlayback = {
                video,
                currentTime: Math.floor(currentTime),
                timestamp: Date.now(),
                roomId
            };
            if (!user.stats) {
                user.stats = { totalMinutes: 0, roomsCreated: 0 };
            }
            if (user.stats.watchSeconds === undefined) {
                user.stats.watchSeconds = (user.stats.totalMinutes || 0) * 60;
            }
            user.stats.watchSeconds += 10;
            user.stats.totalMinutes = Math.floor(user.stats.watchSeconds / 60);
            saveDb();
            socket.emit('user-updated', hydrateUser(user));
        }
    });

    socket.on('playback-control', ({ roomId, state }) => {
        const room = db.rooms.find(r => r.id === roomId);
        if (room) {
            room.playbackState = { ...state, lastUpdated: Date.now() };
            socket.to(roomId).emit('playback-sync', room.playbackState);
        }
    });

    socket.on('clear-playlist', ({ roomId }) => {
        const room = db.rooms.find(r => r.id === roomId);
        if (room) {
            room.playlist = [];
            room.currentVideoIndex = 0;
            room.playbackState = { isPlaying: false, currentTime: 0, lastUpdated: Date.now() };
            emitRoomUpdate(roomId);
            io.to(roomId).emit('playback-sync', room.playbackState);
        }
    });

    socket.on('add-to-playlist', ({ roomId, item, userId }) => {
        const room = db.rooms.find(r => r.id === roomId);
        const user = db.users.find(u => u.id === userId);
        if (room && user) {
            const hydrated = hydrateUser(user);
            
            if (hydrated.roleId === 'guest') {
                return socket.emit('error-msg', "Les invités ne peuvent pas modifier la playlist.");
            }
            
            if (room.isPremium && !hydrated.isPremium && hydrated.roleId !== 'admin') {
                return socket.emit('error-msg', "Accès restreint : Seuls les membres Premium peuvent modifier la playlist d'un salon Premium.");
            }

            const newItem = { ...item, id: 'p-'+Date.now(), userId: user.id };
            
            if (hydrated.isPremium || hydrated.roleId === 'admin') {
                // Premium : Toujours le suivant
                room.playlist.splice(room.currentVideoIndex + 1, 0, newItem);
            } else {
                // Free : Système "un chacun" (Round-Robin)
                let i = room.currentVideoIndex + 1;
                let inserted = false;
                while (i < room.playlist.length) {
                    let roundUsers = new Set();
                    let foundUserInRound = false;
                    let j = i;
                    while (j < room.playlist.length) {
                        const uid = room.playlist[j].userId;
                        if (roundUsers.has(uid)) break; 
                        if (uid === user.id) foundUserInRound = true;
                        roundUsers.add(uid);
                        j++;
                    }
                    if (!foundUserInRound) {
                        room.playlist.splice(j, 0, newItem);
                        inserted = true;
                        break;
                    }
                    i = j;
                }
                if (!inserted) {
                    room.playlist.push(newItem);
                }
            }
            
            emitRoomUpdate(roomId);
        }
    });

    socket.on('clear-folder', ({ roomId, folderPath }) => {
        const room = db.rooms.find(r => r.id === roomId);
        if (room) {
            room.playlist = room.playlist.filter(p => !p.localPath || !p.localPath.startsWith(folderPath));
            emitRoomUpdate(roomId);
        }
    });

    socket.on('add-folder-to-playlist', ({ roomId, folderPath, userId }) => {
        const room = db.rooms.find(r => r.id === roomId);
        const user = db.users.find(u => u.id === userId);
        if (room && user) {
            const hydrated = hydrateUser(user);
            
            if (hydrated.roleId === 'guest') {
                return socket.emit('error-msg', "Les invités ne peuvent pas modifier la playlist.");
            }
            
            if (room.isPremium && !hydrated.isPremium && hydrated.roleId !== 'admin') {
                return socket.emit('error-msg', "Accès restreint : Seuls les membres Premium peuvent modifier la playlist d'un salon Premium.");
            }

            const normalizedFolder = folderPath.endsWith('/') ? folderPath : folderPath + '/';
            let folderMovies = db.localMovies.filter(m => !m.isDirectory && m.path.startsWith(normalizedFolder));
            
            // Filtre par disque si non-premium
            if (!hydrated.isPremium && hydrated.roleId !== 'admin') {
                folderMovies = folderMovies.filter(m => m.rootPath && m.rootPath.startsWith('G:'));
            }

            folderMovies.sort((a, b) => collator.compare(a.path, b.path));
            folderMovies.forEach(movie => {
                room.playlist.push({
                    id: 'p-' + Math.random().toString(36).substr(2, 9),
                    title: movie.name,
                    url: `/video/local/${encodeURIComponent(movie.path)}`,
                    addedBy: hydrated.username,
                    isLocal: true,
                    localPath: movie.path 
                });
            });
            emitRoomUpdate(roomId);
        }
    });

    socket.on('remove-from-playlist', ({ roomId, playlistItemId }) => {
        const room = db.rooms.find(r => r.id === roomId);
        if (room) {
            room.playlist = room.playlist.filter(p => p.id !== playlistItemId);
            emitRoomUpdate(roomId);
        }
    });

    socket.on('change-video', ({ roomId, index, userId }) => {
        const room = db.rooms.find(r => r.id === roomId);
        if (room) {
            if (userId) {
                const user = db.users.find(u => u.id === userId);
                if (user && user.roleId === 'guest') {
                    return socket.emit('error-msg', "Les invités ne peuvent pas changer de vidéo.");
                }
            }
            room.currentVideoIndex = index;
            room.playbackState = { isPlaying: true, currentTime: 0, lastUpdated: Date.now() };
            
            // Ajouter à l'historique de l'utilisateur
            if (userId) {
                const user = db.users.find(u => u.id === userId);
                if (user) {
                    if (!user.stats) user.stats = {};
                    if (!user.stats.watchedHistory) user.stats.watchedHistory = [];
                    
                    const video = room.playlist[index];
                    if (video) {
                        // Nettoyer le titre pour l'historique
                        let cleanTitle = video.title;
                        cleanTitle = cleanTitle.replace(/S\d+/i, '').replace(/episode\s*\d+/i, '').trim();
                        
                        user.stats.watchedHistory.unshift({
                            title: cleanTitle,
                            timestamp: Date.now()
                        });
                        if (user.stats.watchedHistory.length > 50) user.stats.watchedHistory.pop();
                        saveDb();
                    }
                }
            }

            emitRoomUpdate(roomId);
            io.to(roomId).emit('playback-sync', room.playbackState);
        }
    });

    socket.on('send-message', ({ roomId, message }) => {
        const user = db.users.find(u => u.username === message.username);
        if (user && user.roleId === 'guest') {
            return socket.emit('error-msg', "Les invités ne peuvent pas parler.");
        }
        io.to(roomId).emit('new-message', message);
    });

    socket.on('send-global-message', (message) => {
        const user = db.users.find(u => u.username === message.username);
        if (user && user.roleId === 'guest') {
            return socket.emit('error-msg', "Les invités ne peuvent pas parler.");
        }
        if (!db.globalMessages) db.globalMessages = [];
        const msg = { ...message, id: 'g-' + Date.now(), timestamp: Date.now() };
        db.globalMessages.push(msg);
        if (db.globalMessages.length > 100) db.globalMessages.shift();
        io.emit('new-global-message', msg);
    });
});

server.listen(PORT, '0.0.0.0', () => console.log(`Server Ready sur ${PORT}`));

// Cleanup offline guest accounts after 1 hour of offline status
setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    let dbChanged = false;
    
    db.users = db.users.filter(user => {
        if (user.roleId === 'guest') {
            if (activeConnections.has(user.id)) return true;
            if (!user.lastSeen) {
                user.lastSeen = Date.now();
                dbChanged = true;
                return true;
            }
            if (user.lastSeen < oneHourAgo) {
                dbChanged = true;
                return false;
            }
        }
        return true;
    });
    
    if (dbChanged) {
        saveDb();
    }
}, 5 * 60 * 1000); // Check every 5 minutes

// --- End of server.js ---
