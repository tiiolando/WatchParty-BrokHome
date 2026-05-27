// Author: SyncStream i18n Engineer
// OS support: Cross-platform
// Description: Multi-language dictionaries and global language switcher config for BrokHomeTV

// ==========================================
// CONFIGURATION GLOBALE DE LA LANGUE / GLOBAL LANGUAGE CONFIG
// Modifiez simplement cette variable pour changer instantanément la langue de tout le site !
// Supports : 'FR' | 'EN' | 'ES' | 'IT' | 'DE' | 'PT' | 'NL' | 'PL' | 'TR' | 'AR' | 'JA' | 'KO'
// ==========================================
export const CURRENT_LANG: keyof typeof dictionary = 'FR';

export interface Translations {
  global: {
    loading: string;
    welcome: string;
    logout: string;
    adminConsole: string;
    dashboard: string;
    profile: string;
    pricing: string;
    awareness: string;
    movies: string;
    title: string;
  };
  auth: {
    login: string;
    register: string;
    username: string;
    password: string;
    startWatching: string;
    joinAdventure: string;
    continueGuest: string;
    haveAccount: string;
    newToApp: string;
    connectBtn: string;
    registerNow: string;
    errorAuth: string;
  };
  media: {
    title: string;
    catalog: string;
    forceScan: string;
    pathSettings: string;
    noMovies: string;
    premiumOnly: string;
    indexPaths: string;
    activePaths: string;
    addPath: string;
  };
  rooms: {
    createRoom: string;
    roomName: string;
    passwordOptional: string;
    joinRoom: string;
    activeRooms: string;
    privateRoom: string;
    memberCount: string;
    roomList: string;
    noRooms: string;
    createRoomBtn: string;
  };
  player: {
    play: string;
    pause: string;
    sync: string;
    syncStatus: string;
    autoSkip: string;
    nextVideo: string;
    previousVideo: string;
    live: string;
  };
  playlist: {
    title: string;
    addVideo: string;
    removeVideo: string;
    emptyPlaylist: string;
    queue: string;
  };
  chat: {
    send: string;
    placeholder: string;
    clearChat: string;
    welcomeChat: string;
    systemMessage: string;
  };
  roles: {
    admin: string;
    premium: string;
    member: string;
    guest: string;
  };
}

export const dictionary = {
  FR: {
    global: {
      loading: "Chargement...",
      welcome: "Bienvenue !",
      logout: "Déconnexion",
      adminConsole: "Console d'administration",
      dashboard: "Tableau de bord",
      profile: "Profil",
      pricing: "Offres Premium",
      awareness: "Sensibilisation",
      movies: "Vidéos",
      title: "Visionnage Synchrone"
    },
    auth: {
      login: "S'identifier",
      register: "S'inscrire",
      username: "Nom d'utilisateur",
      password: "Mot de passe",
      startWatching: "Commencer à regarder",
      joinAdventure: "Rejoindre l'aventure",
      continueGuest: "Continuer en tant qu'invité",
      haveAccount: "Vous avez déjà un compte ?",
      newToApp: "Nouveau sur BrokHomeTV ?",
      connectBtn: "Se connecter",
      registerNow: "S'inscrire maintenant",
      errorAuth: "Échec de l'authentification"
    },
    media: {
      title: "Médiathèque",
      catalog: "Catalogue",
      forceScan: "Forcer un scan",
      pathSettings: "Gestion du stockage",
      noMovies: "Aucun film indexé",
      premiumOnly: "Réservé Premium",
      indexPaths: "Chemins d'indexation",
      activePaths: "Chemins Actifs",
      addPath: "Ajouter un chemin"
    },
    rooms: {
      createRoom: "Créer un salon",
      roomName: "Nom du salon",
      passwordOptional: "Mot de passe (facultatif)",
      joinRoom: "Rejoindre",
      activeRooms: "Salons Actifs",
      privateRoom: "Salon Privé",
      memberCount: "spectateur(s)",
      roomList: "Liste de salons",
      noRooms: "Aucun salon actif",
      createRoomBtn: "Créer le salon"
    },
    player: {
      play: "Lecture",
      pause: "Pause",
      sync: "Synchroniser",
      syncStatus: "Stabilisé",
      autoSkip: "Auto-Skip",
      nextVideo: "Suivante",
      previousVideo: "Précédente",
      live: "En direct"
    },
    playlist: {
      title: "File de lecture",
      addVideo: "Ajouter à la file",
      removeVideo: "Retirer",
      emptyPlaylist: "File de lecture vide",
      queue: "En attente"
    },
    chat: {
      send: "Envoyer",
      placeholder: "Écrire un message...",
      clearChat: "Vider le chat",
      welcomeChat: "Début du tchat",
      systemMessage: "Système"
    },
    roles: {
      admin: "Administrateur",
      premium: "Premium",
      member: "Membre",
      guest: "Invité"
    }
  },
  EN: {
    global: {
      loading: "Loading...",
      welcome: "Welcome!",
      logout: "Logout",
      adminConsole: "Admin Console",
      dashboard: "Dashboard",
      profile: "Profile",
      pricing: "Premium Plans",
      awareness: "Awareness",
      movies: "Videos",
      title: "Synchronous Watch"
    },
    auth: {
      login: "Sign In",
      register: "Sign Up",
      username: "Username",
      password: "Password",
      startWatching: "Start Watching",
      joinAdventure: "Join the Adventure",
      continueGuest: "Continue as Guest",
      haveAccount: "Already have an account?",
      newToApp: "New to BrokHomeTV?",
      connectBtn: "Log In",
      registerNow: "Register now",
      errorAuth: "Authentication failed"
    },
    media: {
      title: "Media Library",
      catalog: "Catalog",
      forceScan: "Force Scan",
      pathSettings: "Storage Settings",
      noMovies: "No indexed movies",
      premiumOnly: "Premium Only",
      indexPaths: "Indexing Paths",
      activePaths: "Active Paths",
      addPath: "Add Path"
    },
    rooms: {
      createRoom: "Create Room",
      roomName: "Room Name",
      passwordOptional: "Password (optional)",
      joinRoom: "Join",
      activeRooms: "Active Rooms",
      privateRoom: "Private Room",
      memberCount: "viewer(s)",
      roomList: "Room List",
      noRooms: "No active rooms",
      createRoomBtn: "Create Room"
    },
    player: {
      play: "Play",
      pause: "Pause",
      sync: "Synchronize",
      syncStatus: "Synced",
      autoSkip: "Auto-Skip",
      nextVideo: "Next",
      previousVideo: "Previous",
      live: "Live"
    },
    playlist: {
      title: "Playlist Queue",
      addVideo: "Add to Queue",
      removeVideo: "Remove",
      emptyPlaylist: "Queue is empty",
      queue: "Upcoming"
    },
    chat: {
      send: "Send",
      placeholder: "Send a message...",
      clearChat: "Clear Chat",
      welcomeChat: "Start of chat",
      systemMessage: "System"
    },
    roles: {
      admin: "Administrator",
      premium: "Premium",
      member: "Member",
      guest: "Guest"
    }
  },
  ES: {
    global: {
      loading: "Cargando...",
      welcome: "¡Bienvenido!",
      logout: "Cerrar sesión",
      adminConsole: "Consola de Administración",
      dashboard: "Panel de Control",
      profile: "Perfil",
      pricing: "Planes Premium",
      awareness: "Sensibilización",
      movies: "Videos",
      title: "Ver en Sincronía"
    },
    auth: {
      login: "Iniciar Sesión",
      register: "Registrarse",
      username: "Nombre de usuario",
      password: "Contraseña",
      startWatching: "Comenzar a ver",
      joinAdventure: "Unirse a la aventura",
      continueGuest: "Continuar como invitado",
      haveAccount: "¿Ya tienes cuenta?",
      newToApp: "¿Nuevo en BrokHomeTV?",
      connectBtn: "Conectarse",
      registerNow: "Registrarse ahora",
      errorAuth: "Error de autenticación"
    },
    media: {
      title: "Biblioteca de Medios",
      catalog: "Catálogo",
      forceScan: "Forzar escaneo",
      pathSettings: "Gestión de almacenamiento",
      noMovies: "No hay películas indexadas",
      premiumOnly: "Solo Premium",
      indexPaths: "Rutas de indexación",
      activePaths: "Rutas Activas",
      addPath: "Añadir ruta"
    },
    rooms: {
      createRoom: "Crear una sala",
      roomName: "Nombre de la sala",
      passwordOptional: "Contraseña (opcional)",
      joinRoom: "Unirse",
      activeRooms: "Salas Activas",
      privateRoom: "Sala Privada",
      memberCount: "espectador(es)",
      roomList: "Lista de salas",
      noRooms: "No hay salas activas",
      createRoomBtn: "Crear sala"
    },
    player: {
      play: "Reproducir",
      pause: "Pausa",
      sync: "Sincronizar",
      syncStatus: "Sincronizado",
      autoSkip: "Salto Automático",
      nextVideo: "Siguiente",
      previousVideo: "Anterior",
      live: "En vivo"
    },
    playlist: {
      title: "Cola de reproducción",
      addVideo: "Añadir a la cola",
      removeVideo: "Quitar",
      emptyPlaylist: "Cola vacía",
      queue: "En espera"
    },
    chat: {
      send: "Enviar",
      placeholder: "Escribe un mensaje...",
      clearChat: "Limpiar chat",
      welcomeChat: "Inicio del chat",
      systemMessage: "Sistema"
    },
    roles: {
      admin: "Administrador",
      premium: "Premium",
      member: "Miembro",
      guest: "Invitado"
    }
  },
  IT: {
    global: {
      loading: "Caricamento...",
      welcome: "Benvenuto!",
      logout: "Disconnetti",
      adminConsole: "Console Amministratore",
      dashboard: "Dashboard",
      profile: "Profilo",
      pricing: "Piani Premium",
      awareness: "Sensibilizzazione",
      movies: "Video",
      title: "Visione Sincronizzata"
    },
    auth: {
      login: "Accedi",
      register: "Registrati",
      username: "Nome utente",
      password: "Password",
      startWatching: "Inizia a guardare",
      joinAdventure: "Unisciti all'avventura",
      continueGuest: "Continua come ospite",
      haveAccount: "Hai già un account?",
      newToApp: "Nuovo su BrokHomeTV?",
      connectBtn: "Accedi",
      registerNow: "Registrati ora",
      errorAuth: "Autenticazione fallita"
    },
    media: {
      title: "Libreria Multimediale",
      catalog: "Catalogo",
      forceScan: "Forza scansione",
      pathSettings: "Gestione archiviazione",
      noMovies: "Nessun film indicizzato",
      premiumOnly: "Solo Premium",
      indexPaths: "Percorsi di indicizzazione",
      activePaths: "Percorsi Attivi",
      addPath: "Aggiungi percorso"
    },
    rooms: {
      createRoom: "Crea una stanza",
      roomName: "Nome della stanza",
      passwordOptional: "Password (opzionale)",
      joinRoom: "Entra",
      activeRooms: "Stanze Attive",
      privateRoom: "Stanza Privata",
      memberCount: "spettatore/i",
      roomList: "Lista delle stanze",
      noRooms: "Nessuna stanza attiva",
      createRoomBtn: "Crea stanza"
    },
    player: {
      play: "Riproduci",
      pause: "Pausa",
      sync: "Sincronizza",
      syncStatus: "Sincronizzato",
      autoSkip: "Salto Automatico",
      nextVideo: "Successivo",
      previousVideo: "Precedente",
      live: "Dal vivo"
    },
    playlist: {
      title: "Coda di riproduzione",
      addVideo: "Aggiungi alla coda",
      removeVideo: "Rimuovi",
      emptyPlaylist: "Coda vuota",
      queue: "In coda"
    },
    chat: {
      send: "Invia",
      placeholder: "Scrivi un messaggio...",
      clearChat: "Svuota chat",
      welcomeChat: "Inizio chat",
      systemMessage: "Sistema"
    },
    roles: {
      admin: "Amministratore",
      premium: "Premium",
      member: "Membro",
      guest: "Ospite"
    }
  },
  DE: {
    global: {
      loading: "Laden...",
      welcome: "Willkommen!",
      logout: "Abmelden",
      adminConsole: "Admin-Konsole",
      dashboard: "Dashboard",
      profile: "Profil",
      pricing: "Premium-Pläne",
      awareness: "Sensibilisierung",
      movies: "Videos",
      title: "Synchrones Anschauen"
    },
    auth: {
      login: "Einloggen",
      register: "Registrieren",
      username: "Benutzername",
      password: "Passwort",
      startWatching: "Anschauen starten",
      joinAdventure: "Tritt dem Abenteuer bei",
      continueGuest: "Als Gast fortfahren",
      haveAccount: "Hast du bereits ein Konto?",
      newToApp: "Neu bei BrokHomeTV?",
      connectBtn: "Einloggen",
      registerNow: "Jetzt registrieren",
      errorAuth: "Authentifizierung fehlgeschlagen"
    },
    media: {
      title: "Mediathek",
      catalog: "Katalog",
      forceScan: "Scan erzwingen",
      pathSettings: "Speicherverwaltung",
      noMovies: "Keine indizierten Filme",
      premiumOnly: "Nur Premium",
      indexPaths: "Indizierungspfade",
      activePaths: "Aktive Pfade",
      addPath: "Pfad hinzufügen"
    },
    rooms: {
      createRoom: "Raum erstellen",
      roomName: "Raumname",
      passwordOptional: "Passwort (optional)",
      joinRoom: "Beitreten",
      activeRooms: "Aktive Räume",
      privateRoom: "Privater Raum",
      memberCount: "Zuschauer",
      roomList: "Raumliste",
      noRooms: "Keine aktiven Räume",
      createRoomBtn: "Raum erstellen"
    },
    player: {
      play: "Abspielen",
      pause: "Pause",
      sync: "Synchronisieren",
      syncStatus: "Synchronisiert",
      autoSkip: "Auto-Skip",
      nextVideo: "Nächstes",
      previousVideo: "Vorheriges",
      live: "Live"
    },
    playlist: {
      title: "Wiedegabeliste",
      addVideo: "Zur Liste hinzufügen",
      removeVideo: "Entfernen",
      emptyPlaylist: "Leere Wiedergabeliste",
      queue: "Warteschlange"
    },
    chat: {
      send: "Senden",
      placeholder: "Nachricht schreiben...",
      clearChat: "Chat leeren",
      welcomeChat: "Chatstart",
      systemMessage: "System"
    },
    roles: {
      admin: "Administrator",
      premium: "Premium",
      member: "Mitglied",
      guest: "Gast"
    }
  },
  PT: {
    global: {
      loading: "Carregando...",
      welcome: "Bem-vindo!",
      logout: "Sair",
      adminConsole: "Console de Administração",
      dashboard: "Painel",
      profile: "Perfil",
      pricing: "Planos Premium",
      awareness: "Sensibilização",
      movies: "Vídeos",
      title: "Sincronizar Exibição"
    },
    auth: {
      login: "Iniciar Sessão",
      register: "Cadastrar-se",
      username: "Nome de usuário",
      password: "Senha",
      startWatching: "Começar a assistir",
      joinAdventure: "Juntar-se à aventura",
      continueGuest: "Continuar como convidado",
      haveAccount: "Já tem uma conta?",
      newToApp: "Novo no BrokHomeTV?",
      connectBtn: "Entrar",
      registerNow: "Cadastrar-se agora",
      errorAuth: "Falha na autenticação"
    },
    media: {
      title: "Biblioteca de Mídia",
      catalog: "Catálogo",
      forceScan: "Forçar varredura",
      pathSettings: "Configurações de armazenamento",
      noMovies: "Nenhum filme indexado",
      premiumOnly: "Apenas Premium",
      indexPaths: "Caminhos de indexação",
      activePaths: "Caminhos Ativos",
      addPath: "Adicionar caminho"
    },
    rooms: {
      createRoom: "Criar uma sala",
      roomName: "Nome da sala",
      passwordOptional: "Senha (opcional)",
      joinRoom: "Entrar",
      activeRooms: "Salas Ativas",
      privateRoom: "Sala Privada",
      memberCount: "espectador(es)",
      roomList: "Lista de salas",
      noRooms: "Nenhuma sala ativa",
      createRoomBtn: "Criar sala"
    },
    player: {
      play: "Reproduzir",
      pause: "Pausa",
      sync: "Sincronizar",
      syncStatus: "Sincronizado",
      autoSkip: "Pular Automaticamente",
      nextVideo: "Próximo",
      previousVideo: "Anterior",
      live: "Ao vivo"
    },
    playlist: {
      title: "Fila de reprodução",
      addVideo: "Adicionar à fila",
      removeVideo: "Remover",
      emptyPlaylist: "Fila vazia",
      queue: "Próximos"
    },
    chat: {
      send: "Enviar",
      placeholder: "Escreva uma mensagem...",
      clearChat: "Limpar chat",
      welcomeChat: "Início do chat",
      systemMessage: "Sistema"
    },
    roles: {
      admin: "Administrador",
      premium: "Premium",
      member: "Membro",
      guest: "Convidado"
    }
  },
  NL: {
    global: {
      loading: "Laden...",
      welcome: "Welkom!",
      logout: "Uitloggen",
      adminConsole: "Beheerderspaneel",
      dashboard: "Dashboard",
      profile: "Profiel",
      pricing: "Premium Plannen",
      awareness: "Bewustwording",
      movies: "Video's",
      title: "Synchroon Kijken"
    },
    auth: {
      login: "Inloggen",
      register: "Registreren",
      username: "Gebruikersnaam",
      password: "Wachtwoord",
      startWatching: "Begin met kijken",
      joinAdventure: "Doe mee met het avontuur",
      continueGuest: "Doorgaan als gast",
      haveAccount: "Heb je al een account?",
      newToApp: "Nieuw bij BrokHomeTV?",
      connectBtn: "Inloggen",
      registerNow: "Nu registreren",
      errorAuth: "Verificatie mislukt"
    },
    media: {
      title: "Mediatheek",
      catalog: "Catalogus",
      forceScan: "Forceer scan",
      pathSettings: "Opslagbeheer",
      noMovies: "Geen geïndexeerde films",
      premiumOnly: "Alleen Premium",
      indexPaths: "Indexeringspaden",
      activePaths: "Actieve Paden",
      addPath: "Pad toevoegen"
    },
    rooms: {
      createRoom: "Kamer maken",
      roomName: "Kamernaam",
      passwordOptional: "Wachtwoord (optioneel)",
      joinRoom: "Deelnemen",
      activeRooms: "Actieve Kamers",
      privateRoom: "Privékamer",
      memberCount: "kijker(s)",
      roomList: "Kamerlijst",
      noRooms: "Geen actieve kamers",
      createRoomBtn: "Kamer maken"
    },
    player: {
      play: "Afspelen",
      pause: "Pauze",
      sync: "Synchroniseren",
      syncStatus: "Gesynchroniseerd",
      autoSkip: "Automatisch overslaan",
      nextVideo: "Volgende",
      previousVideo: "Vorige",
      live: "Live"
    },
    playlist: {
      title: "Afspeellijst",
      addVideo: "Toevoegen aan wachtrij",
      removeVideo: "Verwijderen",
      emptyPlaylist: "Wachtrij is leeg",
      queue: "Aankomend"
    },
    chat: {
      send: "Verzenden",
      placeholder: "Schrijf een bericht...",
      clearChat: "Chat wissen",
      welcomeChat: "Start van chat",
      systemMessage: "Systeem"
    },
    roles: {
      admin: "Beheerder",
      premium: "Premium",
      member: "Lid",
      guest: "Gast"
    }
  },
  PL: {
    global: {
      loading: "Ładowanie...",
      welcome: "Witaj!",
      logout: "Wyloguj się",
      adminConsole: "Konsola Administratora",
      dashboard: "Panel",
      profile: "Profil",
      pricing: "Plany Premium",
      awareness: "Świadomość",
      movies: "Filmy",
      title: "Wspólne Oglądanie"
    },
    auth: {
      login: "Zaloguj się",
      register: "Zarejestruj się",
      username: "Nazwa użytkownika",
      password: "Hasło",
      startWatching: "Zacznij oglądać",
      joinAdventure: "Dołącz do przygody",
      continueGuest: "Kontynuuj jako gość",
      haveAccount: "Masz już konto?",
      newToApp: "Nowy w BrokHomeTV?",
      connectBtn: "Zaloguj się",
      registerNow: "Zarejestruj się teraz",
      errorAuth: "Błąd uwierzytelniania"
    },
    media: {
      title: "Biblioteka Mediów",
      catalog: "Katalog",
      forceScan: "Wymuś skanowanie",
      pathSettings: "Zarządzanie pamięcią",
      noMovies: "Brak indeksowanych filmów",
      premiumOnly: "Tylko Premium",
      indexPaths: "Ścieżki indeksowania",
      activePaths: "Aktywne Ścieżki",
      addPath: "Dodaj ścieżkę"
    },
    rooms: {
      createRoom: "Utwórz pokój",
      roomName: "Nazwa pokoju",
      passwordOptional: "Hasło (opcjonalnie)",
      joinRoom: "Dołącz",
      activeRooms: "Aktywne Pokoje",
      privateRoom: "Pokój Prywatny",
      memberCount: "widz(ów)",
      roomList: "Lista pokojów",
      noRooms: "Brak aktywnych pokojów",
      createRoomBtn: "Utwórz pokój"
    },
    player: {
      play: "Odtwarzaj",
      pause: "Pauza",
      sync: "Synchronizuj",
      syncStatus: "Zsynchronizowano",
      autoSkip: "Automatyczne pomijanie",
      nextVideo: "Następny",
      previousVideo: "Poprzedni",
      live: "Na żywo"
    },
    playlist: {
      title: "Kolejka",
      addVideo: "Dodaj do kolejki",
      removeVideo: "Usuń",
      emptyPlaylist: "Kolejka jest pusta",
      queue: "Nadchodzące"
    },
    chat: {
      send: "Wyślij",
      placeholder: "Napisz wiadomość...",
      clearChat: "Wyczyść czat",
      welcomeChat: "Początek czatu",
      systemMessage: "System"
    },
    roles: {
      admin: "Administrator",
      premium: "Premium",
      member: "Członek",
      guest: "Gość"
    }
  },
  TR: {
    global: {
      loading: "Yükleniyor...",
      welcome: "Hoş geldiniz!",
      logout: "Çıkış Yap",
      adminConsole: "Yönetici Konsolu",
      dashboard: "Panel",
      profile: "Profil",
      pricing: "Premium Paketler",
      awareness: "Farkındalık",
      movies: "Videolar",
      title: "Senkronize İzleme"
    },
    auth: {
      login: "Giriş Yap",
      register: "Kayıt Ol",
      username: "Kullanıcı adı",
      password: "Şifre",
      startWatching: "İzlemeye Başla",
      joinAdventure: "Maceraya Katıl",
      continueGuest: "Ziyaretçi olarak devam et",
      haveAccount: "Zaten bir hesabınız var mı?",
      newToApp: "BrokHomeTV'de yeni misiniz?",
      connectBtn: "Giriş yap",
      registerNow: "Şimdi kaydolun",
      errorAuth: "Kimlik doğrulama başarısız"
    },
    media: {
      title: "Medya Kitaplığı",
      catalog: "Katalog",
      forceScan: "Taramayı Zorla",
      pathSettings: "Depolama Yönetimi",
      noMovies: "Dizine eklenmiş film yok",
      premiumOnly: "Sadece Premium",
      indexPaths: "Dizin Yolları",
      activePaths: "Aktif Yollar",
      addPath: "Yol Ekle"
    },
    rooms: {
      createRoom: "Oda Oluştur",
      roomName: "Oda Adı",
      passwordOptional: "Şifre (isteğe bağlı)",
      joinRoom: "Katıl",
      activeRooms: "Aktif Odalar",
      privateRoom: "Özel Oda",
      memberCount: "izleyici",
      roomList: "Oda Listesi",
      noRooms: "Aktif oda yok",
      createRoomBtn: "Oda Oluştur"
    },
    player: {
      play: "Oynat",
      pause: "Duraklat",
      sync: "Senkronize Et",
      syncStatus: "Senkronize Edildi",
      autoSkip: "Otomatik Atlama",
      nextVideo: "Sonraki",
      previousVideo: "Önceki",
      live: "Canlı"
    },
    playlist: {
      title: "Oynatma Listesi",
      addVideo: "Sıraya Ekle",
      removeVideo: "Kaldır",
      emptyPlaylist: "Sıra boş",
      queue: "Gelecek"
    },
    chat: {
      send: "Gönder",
      placeholder: "Bir mesaj yazın...",
      clearChat: "Sohbeti Temizle",
      welcomeChat: "Sohbet başlangıcı",
      systemMessage: "Sistem"
    },
    roles: {
      admin: "Yönetici",
      premium: "Premium",
      member: "Üye",
      guest: "Ziyaretçi"
    }
  },
  AR: {
    global: {
      loading: "جاري التحميل...",
      welcome: "مرحباً بكم!",
      logout: "تسجيل الخروج",
      adminConsole: "لوحة التحكم",
      dashboard: "لوحة القيادة",
      profile: "الملف الشخصي",
      pricing: "العروض المميزة",
      awareness: "التوعية",
      movies: "الفيديوهات",
      title: "المشاهدة المتزامنة"
    },
    auth: {
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      startWatching: "ابدأ المشاهدة",
      joinAdventure: "انضم إلى المغامرة",
      continueGuest: "المتابعة كضيف",
      haveAccount: "لديك حساب بالفعل؟",
      newToApp: "جديد على BrokHomeTV؟",
      connectBtn: "تسجيل الدخول",
      registerNow: "سجل الآن",
      errorAuth: "فشل التحقق من الهوية"
    },
    media: {
      title: "مكتبة الوسائط",
      catalog: "دليل الفيديو",
      forceScan: "فرض فحص الملفات",
      pathSettings: "إعادة تعيين مسارات التخزين",
      noMovies: "لا توجد فيديوهات مضافة",
      premiumOnly: "خاص بالمشتركين",
      indexPaths: "مسارات الدليل",
      activePaths: "المسارات النشطة",
      addPath: "إضافة مسار"
    },
    rooms: {
      createRoom: "إنشاء غرفة",
      roomName: "اسم الغرفة",
      passwordOptional: "كلمة المرور (اختياري)",
      joinRoom: "انضمام",
      activeRooms: "الغرف النشطة",
      privateRoom: "غرفة خاصة",
      memberCount: "مشاهد",
      roomList: "قائمة الغرف",
      noRooms: "لا توجد غرف نشطة حالياً",
      createRoomBtn: "إنشاء الغرفة"
    },
    player: {
      play: "تشغيل",
      pause: "إيقاف مؤقت",
      sync: "مزامنة",
      syncStatus: "متزامن",
      autoSkip: "تخطي تلقائي",
      nextVideo: "التالي",
      previousVideo: "السابق",
      live: "بث مباشر"
    },
    playlist: {
      title: "قائمة الانتظار",
      addVideo: "إضافة إلى القائمة",
      removeVideo: "إزالة",
      emptyPlaylist: "قائمة الانتظار فارغة",
      queue: "التالي"
    },
    chat: {
      send: "إرسال",
      placeholder: "اكتب رسالة...",
      clearChat: "مسح المحادثة",
      welcomeChat: "بداية المحادثة",
      systemMessage: "النظام"
    },
    roles: {
      admin: "مدير النظام",
      premium: "مشترك مميز",
      member: "عضو",
      guest: "ضيف"
    }
  },
  JA: {
    global: {
      loading: "読み込み中...",
      welcome: "ようこそ！",
      logout: "ログアウト",
      adminConsole: "管理コンソール",
      dashboard: "ダッシュボード",
      profile: "プロフィール",
      pricing: "プレミアムプラン",
      awareness: "意識向上",
      movies: "動画",
      title: "同時視聴"
    },
    auth: {
      login: "ログイン",
      register: "新規登録",
      username: "ユーザー名",
      password: "パスワード",
      startWatching: "視聴を開始する",
      joinAdventure: "冒険に参加する",
      continueGuest: "ゲストとして継続",
      haveAccount: "すでにアカウントをお持ちですか？",
      newToApp: "BrokHomeTVは初めてですか？",
      connectBtn: "ログイン",
      registerNow: "今すぐ登録",
      errorAuth: "認証に失敗しました"
    },
    media: {
      title: "メディアライブラリ",
      catalog: "カタログ",
      forceScan: "再スキャンを強制",
      pathSettings: "ストレージ制御",
      noMovies: "インデックスされた動画はありません",
      premiumOnly: "プレミアム限定",
      indexPaths: "インデックスパス",
      activePaths: "有効なパス",
      addPath: "パスを追加"
    },
    rooms: {
      createRoom: "ルームを作成する",
      roomName: "ルーム名",
      passwordOptional: "パスワード (任意)",
      joinRoom: "参加する",
      activeRooms: "アクティブなルーム",
      privateRoom: "プライベートルーム",
      memberCount: "人の視聴者",
      roomList: "ルーム一覧",
      noRooms: "アクティブなルームはありません",
      createRoomBtn: "ルームを作成"
    },
    player: {
      play: "再生",
      pause: "一時停止",
      sync: "同期する",
      syncStatus: "同期済み",
      autoSkip: "自動スキップ",
      nextVideo: "次へ",
      previousVideo: "前へ",
      live: "ライブ"
    },
    playlist: {
      title: "再生リストのキュー",
      addVideo: "キューに追加",
      removeVideo: "削除",
      emptyPlaylist: "キューが空です",
      queue: "次のクリップ"
    },
    chat: {
      send: "送信",
      placeholder: "メッセージを入力...",
      clearChat: "チャットをクリア",
      welcomeChat: "チャットのはじまり",
      systemMessage: "システム"
    },
    roles: {
      admin: "管理者",
      premium: "プレミアム",
      member: "メンバー",
      guest: "ゲスト"
    }
  },
  KO: {
    global: {
      loading: "로딩 중...",
      welcome: "환영합니다!",
      logout: "로그아웃",
      adminConsole: "관리 콘솔",
      dashboard: "대시보드",
      profile: "프로필",
      pricing: "프리미엄 요금제",
      awareness: "인식 제고",
      movies: "비디오",
      title: "동시 시청"
    },
    auth: {
      login: "로그인",
      register: "회원가입",
      username: "사용자 이름",
      password: "비밀번호",
      startWatching: "시청 시작하기",
      joinAdventure: "모험에 동참하기",
      continueGuest: "게스트로 계속하기",
      haveAccount: "이미 계정이 있으신가요?",
      newToApp: "BrokHomeTV가 처음이신가요?",
      connectBtn: "로그인",
      registerNow: "지금 가입하기",
      errorAuth: "인증 실패"
    },
    media: {
      title: "미디어 라이브러리",
      catalog: "카탈로그",
      forceScan: "강제 재스캔",
      pathSettings: "스토리지 관리",
      noMovies: "인덱싱된 비디오가 없습니다",
      premiumOnly: "프리미엄 전용",
      indexPaths: "활성 경로",
      activePaths: "인덱싱 경로",
      addPath: "경로 추가"
    },
    rooms: {
      createRoom: "방 만들기",
      roomName: "방 이름",
      passwordOptional: "비밀번호 (선택 사항)",
      joinRoom: "입장하기",
      activeRooms: "활성 방 목록",
      privateRoom: "비공개 방",
      memberCount: "명의 시청자",
      roomList: "방 목록",
      noRooms: "활성 방이 없습니다",
      createRoomBtn: "방 만들기"
    },
    player: {
      play: "재생",
      pause: "일시 정지",
      sync: "동기화",
      syncStatus: "동기화됨",
      autoSkip: "자동 스킵",
      nextVideo: "다음",
      previousVideo: "이전",
      live: "라이브"
    },
    playlist: {
      title: "재생 대기열",
      addVideo: "대기열에 추가",
      removeVideo: "제거",
      emptyPlaylist: "대기열이 비어 있습니다",
      queue: "대기 중"
    },
    chat: {
      send: "전송",
      placeholder: "메시지를 입력하세요...",
      clearChat: "채팅 지우기",
      welcomeChat: "채팅 시작",
      systemMessage: "시스템"
    },
    roles: {
      admin: "관리자",
      premium: "프리미엄",
      member: "회원",
      guest: "게스트"
    }
  }
};
