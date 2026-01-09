const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const si = require('systeminformation');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Fonction pour collecter toutes les données système
async function collectSystemData() {
  try {
    const [
      cpu,
      cpuTemp,
      mem,
      disk,
      network,
      processes,
      graphics,
      osInfo,
      system,
      battery,
      cpuCurrentSpeed,
      networkStats,
      diskIO
    ] = await Promise.all([
      si.cpu(),
      si.cpuTemperature(),
      si.mem(),
      si.fsSize(),
      si.networkInterfaces(),
      si.processes(),
      si.graphics(),
      si.osInfo(),
      si.system(),
      si.battery(),
      si.cpuCurrentSpeed(),
      si.networkStats(),
      si.disksIO()
    ]);

    const cpuLoad = await si.currentLoad();

    return {
      timestamp: Date.now(),
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speed: cpu.speed,
        currentSpeed: cpuCurrentSpeed.avg,
        temperature: cpuTemp.main || 0,
        load: cpuLoad.currentLoad,
        loadUser: cpuLoad.currentLoadUser,
        loadSystem: cpuLoad.currentLoadSystem,
        loadIdle: cpuLoad.currentLoadIdle,
        cpus: cpuLoad.cpus
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
        active: mem.active,
        available: mem.available,
        usagePercent: (mem.used / mem.total) * 100,
        swapTotal: mem.swaptotal,
        swapUsed: mem.swapused,
        swapFree: mem.swapfree
      },
      disk: disk.map(d => ({
        fs: d.fs,
        type: d.type,
        size: d.size,
        used: d.used,
        available: d.available,
        usagePercent: d.use,
        mount: d.mount
      })),
      diskIO: {
        rIO: diskIO.rIO,
        wIO: diskIO.wIO,
        tIO: diskIO.tIO,
        rIO_sec: diskIO.rIO_sec,
        wIO_sec: diskIO.wIO_sec,
        tIO_sec: diskIO.tIO_sec
      },
      network: networkStats.map(n => ({
        iface: n.iface,
        operstate: n.operstate,
        rx_bytes: n.rx_bytes,
        tx_bytes: n.tx_bytes,
        rx_sec: n.rx_sec,
        tx_sec: n.tx_sec,
        rx_dropped: n.rx_dropped,
        tx_dropped: n.tx_dropped,
        rx_errors: n.rx_errors,
        tx_errors: n.tx_errors
      })),
      processes: {
        all: processes.all,
        running: processes.running,
        blocked: processes.blocked,
        sleeping: processes.sleeping,
        list: processes.list.slice(0, 10).map(p => ({
          pid: p.pid,
          name: p.name,
          cpu: p.cpu,
          mem: p.mem,
          memVsz: p.memVsz,
          memRss: p.memRss
        }))
      },
      graphics: graphics.controllers.map(g => ({
        model: g.model,
        vendor: g.vendor,
        vram: g.vram,
        vramDynamic: g.vramDynamic,
        temperatureGpu: g.temperatureGpu || 0
      })),
      system: {
        manufacturer: system.manufacturer,
        model: system.model,
        version: system.version,
        uuid: system.uuid
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        hostname: osInfo.hostname,
        uptime: osInfo.uptime
      },
      battery: {
        hasBattery: battery.hasBattery,
        percent: battery.percent,
        isCharging: battery.isCharging,
        timeRemaining: battery.timeRemaining
      }
    };
  } catch (error) {
    console.error('Erreur lors de la collecte des données:', error);
    return null;
  }
}

// WebSocket - Envoyer les données en temps réel
wss.on('connection', (ws) => {
  console.log('Nouveau client connecté');

  const interval = setInterval(async () => {
    if (ws.readyState === WebSocket.OPEN) {
      const data = await collectSystemData();
      if (data) {
        ws.send(JSON.stringify(data));
      }
    }
  }, 1000); // Mise à jour chaque seconde

  ws.on('close', () => {
    console.log('Client déconnecté');
    clearInterval(interval);
  });

  ws.on('error', (error) => {
    console.error('Erreur WebSocket:', error);
    clearInterval(interval);
  });
});

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API REST pour les données initiales
app.get('/api/system', async (req, res) => {
  const data = await collectSystemData();
  res.json(data);
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur de monitoring démarré sur http://${HOST}:${PORT}`);
  console.log(`📊 Interface futuriste disponible`);
  console.log(`🌐 Accessible depuis votre navigateur à http://localhost:${PORT}`);
});
