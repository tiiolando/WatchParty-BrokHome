// Author: Senior Frontend Engineer
// OS support: Cross-platform
// Description: Service pour la gestion du Discord Rich Presence via bridge postMessage

export interface RPCData {
  roomName: string;
  memberCount: number;
  username: string;
  watchingTitle: string;
  isPlaying: boolean;
}

export class DiscordRPCService {
  private static lastUpdate = 0;
  private static UPDATE_INTERVAL = 5000; // 5 secondes pour éviter le spam

  static updatePresence(data: RPCData) {
    const now = Date.now();
    if (now - this.lastUpdate < this.UPDATE_INTERVAL) return;
    this.lastUpdate = now;

    // Mise à jour du titre du document (souvent utilisé par PreMiD comme fallback)
    document.title = data.isPlaying 
      ? `▶ ${data.watchingTitle} - BrokHomeTV` 
      : `⏸ ${data.watchingTitle} - BrokHomeTV`;

    // Ajout d'attributs sur le body pour faciliter le "scraping" par PreMiD
    document.body.setAttribute('data-rpc-room', data.roomName);
    document.body.setAttribute('data-rpc-user', data.username);
    document.body.setAttribute('data-rpc-movie', data.watchingTitle);
    document.body.setAttribute('data-rpc-count', data.memberCount.toString());
    document.body.setAttribute('data-rpc-status', data.isPlaying ? 'playing' : 'paused');

    // Envoi via postMessage
    window.postMessage({
      type: 'DISCORD_RPC_UPDATE',
      source: 'syncstream-ultra',
      data: {
        details: `${data.username} regarde : ${data.watchingTitle}`,
        state: `Salon : ${data.roomName} (${data.memberCount} spectateurs)`,
        largeImageKey: 'logo',
        largeImageText: 'BrokHomeTV',
        smallImageKey: data.isPlaying ? 'play' : 'pause',
        smallImageText: data.isPlaying ? 'En lecture' : 'En pause',
        buttons: [
          { label: 'Rejoindre le site', url: 'http://brokhometv.ddns.net' }
        ]
      }
    }, '*');

    // Tentative de communication avec un bridge local si présent (optionnel)
    // console.log("[DiscordRPC] Mise à jour envoyée:", data);
  }
}
