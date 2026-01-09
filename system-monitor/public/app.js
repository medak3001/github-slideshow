// Connexion WebSocket
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${window.location.host}`);

let lastNetworkData = {};

// Formatage des octets
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Formatage du temps
function formatTime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

// Formatage de la vitesse
function formatSpeed(bytesPerSec) {
    if (bytesPerSec === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));
    return parseFloat((bytesPerSec / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Mise à jour de l'heure système
function updateSystemTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', { hour12: false });
    document.getElementById('systemTime').textContent = timeString;
}

setInterval(updateSystemTime, 1000);
updateSystemTime();

// Gestion de la connexion WebSocket
ws.onopen = () => {
    console.log('✅ Connecté au serveur WebSocket');
    console.log('🔗 URL:', `${protocol}//${window.location.host}`);
    updateConnectionStatus(true);
};

ws.onclose = () => {
    console.log('❌ Déconnecté du serveur');
    updateConnectionStatus(false);
};

ws.onerror = (error) => {
    console.error('❌ Erreur WebSocket:', error);
    updateConnectionStatus(false);
};

function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('connectionStatus');
    const statusDot = statusElement.querySelector('.status-dot');
    const statusText = statusElement.querySelector('span:last-child');

    if (connected) {
        statusDot.classList.add('online');
        statusText.textContent = 'Live';
    } else {
        statusDot.classList.remove('online');
        statusText.textContent = 'Disconnected';
    }
}

// Réception des données
ws.onmessage = (event) => {
    console.log('📥 Données reçues du serveur');
    try {
        const data = JSON.parse(event.data);
        console.log('📊 Données parsées:', data);
        updateUI(data);
    } catch (error) {
        console.error('❌ Erreur lors du parsing des données:', error);
        console.error('Données brutes:', event.data);
    }
};

function updateUI(data) {
    // Informations système
    if (data.system) {
        document.getElementById('manufacturer').textContent = data.system.manufacturer || '--';
        document.getElementById('model').textContent = data.system.model || '--';
    }

    if (data.os) {
        document.getElementById('osName').textContent = `${data.os.distro} ${data.os.release}`;
        document.getElementById('hostname').textContent = data.os.hostname || '--';
        document.getElementById('uptime').textContent = formatTime(data.os.uptime);
    }

    // CPU
    if (data.cpu) {
        document.getElementById('cpuBrand').textContent = data.cpu.brand;
        document.getElementById('cpuCores').textContent = `${data.cpu.physicalCores} cores (${data.cpu.cores} threads)`;
        document.getElementById('cpuSpeed').textContent = `${data.cpu.currentSpeed.toFixed(2)} GHz`;
        document.getElementById('cpuTemp').textContent = `${data.cpu.temperature.toFixed(1)} °C`;

        const cpuLoad = Math.round(data.cpu.load);
        document.getElementById('cpuLoad').textContent = `${cpuLoad}%`;
        document.getElementById('cpuLoadPercent').textContent = `${cpuLoad}%`;
        document.getElementById('cpuProgress').style.width = `${cpuLoad}%`;

        const cpuUser = Math.round(data.cpu.loadUser);
        const cpuSystem = Math.round(data.cpu.loadSystem);

        document.getElementById('cpuUserPercent').textContent = `${cpuUser}%`;
        document.getElementById('cpuUserProgress').style.width = `${cpuUser}%`;

        document.getElementById('cpuSystemPercent').textContent = `${cpuSystem}%`;
        document.getElementById('cpuSystemProgress').style.width = `${cpuSystem}%`;

        // Cores individuels
        updateCoresGrid(data.cpu.cpus);
    }

    // Mémoire
    if (data.memory) {
        const memPercent = Math.round(data.memory.usagePercent);
        const memUsedGB = (data.memory.used / (1024 ** 3)).toFixed(2);
        const memTotalGB = (data.memory.total / (1024 ** 3)).toFixed(2);
        const memFreeGB = (data.memory.free / (1024 ** 3)).toFixed(2);
        const memActiveGB = (data.memory.active / (1024 ** 3)).toFixed(2);
        const swapUsedGB = (data.memory.swapUsed / (1024 ** 3)).toFixed(2);

        document.getElementById('memoryPercent').textContent = `${memPercent}%`;
        document.getElementById('memoryUsedText').textContent = `${memUsedGB} GB`;
        document.getElementById('memoryTotalText').textContent = `of ${memTotalGB} GB`;

        document.getElementById('memUsed').textContent = `${memUsedGB} GB`;
        document.getElementById('memFree').textContent = `${memFreeGB} GB`;
        document.getElementById('memActive').textContent = `${memActiveGB} GB`;
        document.getElementById('swapUsed').textContent = `${swapUsedGB} GB`;

        // Cercle de progression
        const circle = document.getElementById('memoryCircle');
        const circumference = 2 * Math.PI * 85;
        const offset = circumference - (memPercent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    // Disques
    if (data.disk) {
        updateDiskList(data.disk);
    }

    // I/O Disque
    if (data.diskIO) {
        document.getElementById('diskRead').textContent = formatSpeed(data.diskIO.rIO_sec || 0);
        document.getElementById('diskWrite').textContent = formatSpeed(data.diskIO.wIO_sec || 0);
        document.getElementById('diskTotal').textContent = formatSpeed(data.diskIO.tIO_sec || 0);
    }

    // Réseau
    if (data.network) {
        updateNetworkStats(data.network);
    }

    // Processus
    if (data.processes) {
        document.getElementById('processCount').textContent = data.processes.all;
        document.getElementById('processRunning').textContent = data.processes.running;
        document.getElementById('processSleeping').textContent = data.processes.sleeping;
        document.getElementById('processBlocked').textContent = data.processes.blocked;

        updateProcessList(data.processes.list);
    }

    // GPU
    if (data.graphics && data.graphics.length > 0) {
        updateGPUList(data.graphics);
        document.getElementById('gpuPanel').style.display = 'block';
    }

    // Batterie
    if (data.battery && data.battery.hasBattery) {
        updateBattery(data.battery);
        document.getElementById('batteryPanel').style.display = 'block';
    }
}

function updateCoresGrid(cpus) {
    const grid = document.getElementById('coresGrid');
    grid.innerHTML = '';

    cpus.forEach((cpu, index) => {
        const coreDiv = document.createElement('div');
        coreDiv.className = 'core-item';
        coreDiv.innerHTML = `
            <div class="core-label">CORE ${index}</div>
            <div class="core-value">${Math.round(cpu.load)}%</div>
        `;
        grid.appendChild(coreDiv);
    });
}

function updateDiskList(disks) {
    const diskList = document.getElementById('diskList');
    diskList.innerHTML = '';

    disks.forEach(disk => {
        const diskDiv = document.createElement('div');
        diskDiv.className = 'disk-item';
        diskDiv.innerHTML = `
            <div class="disk-header">
                <div class="disk-name">${disk.fs}</div>
                <div class="disk-usage">${disk.usagePercent.toFixed(1)}%</div>
            </div>
            <div class="disk-path">${disk.mount} • ${disk.type}</div>
            <div class="disk-bar">
                <div class="disk-fill" style="width: ${disk.usagePercent}%"></div>
            </div>
            <div class="disk-info">
                <span>Used: ${formatBytes(disk.used)}</span>
                <span>Free: ${formatBytes(disk.available)}</span>
                <span>Total: ${formatBytes(disk.size)}</span>
            </div>
        `;
        diskList.appendChild(diskDiv);
    });
}

function updateNetworkStats(interfaces) {
    let totalRx = 0;
    let totalTx = 0;
    let totalRxBytes = 0;
    let totalTxBytes = 0;

    const interfacesDiv = document.getElementById('networkInterfaces');
    interfacesDiv.innerHTML = '';

    interfaces.forEach(iface => {
        if (iface.operstate === 'up') {
            totalRx += iface.rx_sec || 0;
            totalTx += iface.tx_sec || 0;
            totalRxBytes += iface.rx_bytes || 0;
            totalTxBytes += iface.tx_bytes || 0;

            const ifaceDiv = document.createElement('div');
            ifaceDiv.className = 'network-interface';
            ifaceDiv.innerHTML = `
                <div class="interface-name">${iface.iface} - ${iface.operstate.toUpperCase()}</div>
                <div class="interface-stats">
                    <div class="interface-stat">RX: <strong>${formatSpeed(iface.rx_sec || 0)}</strong></div>
                    <div class="interface-stat">TX: <strong>${formatSpeed(iface.tx_sec || 0)}</strong></div>
                    <div class="interface-stat">Total RX: <strong>${formatBytes(iface.rx_bytes || 0)}</strong></div>
                    <div class="interface-stat">Total TX: <strong>${formatBytes(iface.tx_bytes || 0)}</strong></div>
                </div>
            `;
            interfacesDiv.appendChild(ifaceDiv);
        }
    });

    document.getElementById('downloadSpeed').textContent = formatSpeed(totalRx);
    document.getElementById('uploadSpeed').textContent = formatSpeed(totalTx);
    document.getElementById('downloadTotal').textContent = formatBytes(totalRxBytes);
    document.getElementById('uploadTotal').textContent = formatBytes(totalTxBytes);
}

function updateProcessList(processes) {
    const processList = document.getElementById('processList');
    processList.innerHTML = '';

    processes.forEach(process => {
        const processDiv = document.createElement('div');
        processDiv.className = 'process-item';
        processDiv.innerHTML = `
            <div class="process-name">${process.name}</div>
            <div class="process-cpu">CPU: ${process.cpu.toFixed(1)}%</div>
            <div class="process-mem">MEM: ${process.mem.toFixed(1)}%</div>
        `;
        processList.appendChild(processDiv);
    });
}

function updateGPUList(gpus) {
    const gpuList = document.getElementById('gpuList');
    gpuList.innerHTML = '';

    gpus.forEach(gpu => {
        const gpuDiv = document.createElement('div');
        gpuDiv.className = 'gpu-item';
        gpuDiv.innerHTML = `
            <div class="gpu-model">${gpu.model}</div>
            <div class="gpu-vendor">${gpu.vendor}</div>
            <div class="gpu-stats">
                <div class="gpu-stat">VRAM: <strong>${gpu.vram ? gpu.vram + ' MB' : 'N/A'}</strong></div>
                <div class="gpu-stat">TEMP: <strong>${gpu.temperatureGpu ? gpu.temperatureGpu + ' °C' : 'N/A'}</strong></div>
            </div>
        `;
        gpuList.appendChild(gpuDiv);
    });
}

function updateBattery(battery) {
    const percent = Math.round(battery.percent);
    document.getElementById('batteryLevel').style.width = `${percent}%`;
    document.getElementById('batteryPercent').textContent = `${percent}%`;

    const status = battery.isCharging ? 'CHARGING' : 'DISCHARGING';
    document.getElementById('batteryStatus').textContent = status;

    if (battery.timeRemaining && battery.timeRemaining > 0) {
        const hours = Math.floor(battery.timeRemaining / 60);
        const minutes = battery.timeRemaining % 60;
        document.getElementById('batteryTime').textContent = `${hours}h ${minutes}m remaining`;
    } else {
        document.getElementById('batteryTime').textContent = battery.isCharging ? 'Calculating...' : 'N/A';
    }
}

console.log('🚀 System Monitor Client démarré');
