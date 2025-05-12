// Datos de la aplicación
let players = [];
let teams = [];
let matches = [];
let tournament = null;
let courts = [];

// Comprobamos si hay datos guardados localmente
function loadLocalData() {
    const savedPlayers = localStorage.getItem('padelPlayers');
    const savedTournament = localStorage.getItem('padelTournament');
    const savedTeams = localStorage.getItem('padelTeams');
    const savedMatches = localStorage.getItem('padelMatches');
    const savedCourts = localStorage.getItem('padelCourts');
    
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
        renderPlayers();
    }
    
    if (savedTournament) {
        tournament = JSON.parse(savedTournament);
    }
    
    if (savedTeams) {
        teams = JSON.parse(savedTeams);
        renderTeams();
    }
    
    if (savedMatches) {
        matches = JSON.parse(savedMatches);
        renderMatches();
    }
    
    if (savedCourts) {
        courts = JSON.parse(savedCourts);
        renderCourts();
    }
}

// Guardar datos localmente
function saveLocalData() {
    localStorage.setItem('padelPlayers', JSON.stringify(players));
    localStorage.setItem('padelTournament', JSON.stringify(tournament));
    localStorage.setItem('padelTeams', JSON.stringify(teams));
    localStorage.setItem('padelMatches', JSON.stringify(matches));
    localStorage.setItem('padelCourts', JSON.stringify(courts));
}

// Gestión de pestañas
document.querySelectorAll('.tabs li').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remover clase activa de todas las pestañas
        document.querySelectorAll('.tabs li').forEach(t => t.classList.remove('active'));
        // Agregar clase activa al cliqueado
        tab.classList.add('active');
        
        // Ocultar todos los contenidos
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Mostrar el contenido correspondiente
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Formulario de registro de jugadores
document.getElementById('playerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('playerName').value.trim();
    const levelStr = document.getElementById('playerLevel').value;
    
    if (!name || !levelStr) {
        alert('Por favor, completa todos los campos');
        return;
    }
    
    const level = parseInt(levelStr);
    
    // Agregar jugador
    const newPlayer = {
        id: Date.now().toString(),
        name,
        level
    };
    
    players.push(newPlayer);
    saveLocalData();
    
    // Limpiar formulario
    document.getElementById('playerName').value = '';
    document.getElementById('playerLevel').value = '';
    
    // Actualizar lista
    renderPlayers();
});

// Borrar todos los jugadores
document.getElementById('clearPlayers').addEventListener('click', function() {
    if (confirm('¿Estás seguro de que quieres borrar todos los jugadores?')) {
        players = [];
        saveLocalData();
        renderPlayers();
    }
});

// Renderizar lista de jugadores
function renderPlayers() {
    const container = document.getElementById('playersList');
    
    if (players.length === 0) {
        container.innerHTML = '<div class="info-box">No hay jugadores registrados. Agrega jugadores para comenzar.</div>';
        return;
    }
    
    let html = '';
    
    players.forEach(player => {
        let levelClass = '';
        let levelText = '';
        
        if (player.level <= 2) {
            levelClass = 'beginner';
            levelText = 'Principiante';
        } else if (player.level <= 4) {
            levelClass = 'intermediate';
            levelText = 'Intermedio';
        } else {
            levelClass = 'advanced';
            levelText = 'Avanzado';
        }
        
        html += `
            <div class="player-card" data-id="${player.id}">
                <div class="player-info">
                    <strong>${player.name}</strong>
                    <span class="level-indicator ${levelClass}">${levelText} (${player.level})</span>
                </div>
                <div class="player-actions">
                    <button class="delete-player" data-id="${player.id}" style="background-color: #e74c3c;">Eliminar</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Agregar eventos de eliminación
    document.querySelectorAll('.delete-player').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deletePlayer(id);
        });
    });
}

// Eliminar jugador
function deletePlayer(id) {
    players = players.filter(player => player.id !== id);
    saveLocalData();
    renderPlayers();
}

// Mostrar información según el tipo de torneo seleccionado
document.getElementById('tournamentType').addEventListener('change', function() {
    const selectedType = this.value;
    const infoContainer = document.getElementById('tournamentTypeInfo');
    const numGroupsContainer = document.getElementById('numGroupsContainer');
    
    // Ocultar o mostrar número de grupos según el tipo de torneo
    if (selectedType === 'grupos') {
        numGroupsContainer.style.display = 'block';
    } else {
        numGroupsContainer.style.display = 'none';
    }
    
    if (selectedType === '') {
        infoContainer.textContent = 'Selecciona un tipo de torneo para ver su descripción.';
        return;
    }
    
    let info = '';
    
    switch(selectedType) {
        case 'eliminacion':
            info = 'Torneo de eliminación directa: Las parejas se enfrentan según un cuadro de enfrentamientos. Solo los ganadores avanzan a la siguiente ronda hasta determinar un campeón.';
            break;
        case 'grupos':
            info = 'Torneo con fase de grupos: Las parejas se dividen en grupos donde juegan todos contra todos. Los mejores de cada grupo avanzan a una fase final de eliminación directa.';
            break;
        case 'americano':
            info = 'Torneo americano (todos contra todos): Todas las parejas juegan entre sí y se establece una clasificación según los partidos ganados.';
            break;
        case 'americanoExpress':
            info = 'Torneo americano express: Formato dinámico donde los jugadores cambian de pareja en cada ronda. Se juegan partidos cortos y la puntuación es individual.';
            break;
    }
    
    infoContainer.textContent = info;
});

// Formulario de creación de torneo
document.getElementById('tournamentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('tournamentName').value.trim();
    const type = document.getElementById('tournamentType').value;
    const numCourts = parseInt(document.getElementById('numCourts').value);
    const numSets = parseInt(document.getElementById('numSets').value);
    
    if (!name || !type || numCourts < 1) {
        alert('Por favor, completa todos los campos correctamente');
        return;
    }
    
    // Verificar que hay suficientes jugadores
    if (players.length < 4) {
        alert('Necesitas al menos 4 jugadores para crear un torneo');
        return;
    }
    
    // Crear torneo
    tournament = {
        name,
        type,
        numCourts,
        numSets,
        date: new Date().toLocaleDateString()
    };
    
    // Si es torneo de grupos, agregar el número de grupos
    if (type === 'grupos') {
        const numGroups = parseInt(document.getElementById('numGroups').value);
        if (numGroups < 2) {
            alert('Debes tener al menos 2 grupos');
            return;
        }
        tournament.numGroups = numGroups;
    }
    
    // Generar equipos
    generateTeams();
    
    // Generar partidos
    generateMatches();
    
    // Asignar canchas
    assignCourts();
    
    // Guardar datos
    saveLocalData();
    
    // Navegar a la pestaña de partidos
    document.querySelector('[data-tab="matches"]').click();
    
    alert('¡Torneo creado con éxito!');
});

// Generar equipos equilibrados
function generateTeams() {
    teams = [];
    
    // Copia de jugadores para no modificar el original
    const playersCopy = [...players];
    
    // Si es torneo americano express, cada jugador es su propio equipo
    if (tournament.type === 'americanoExpress') {
        playersCopy.forEach(player => {
            teams.push({
                id: 'team_' + player.id,
                players: [player],
                totalLevel: player.level
            });
        });
        renderTeams();
        return;
    }
    
    // Ordenar jugadores por nivel (descendente)
    playersCopy.sort((a, b) => b.level - a.level);
    
    // Para asegurar balance, iremos asignando el mejor y el peor alternativamente
    while (playersCopy.length >= 2) {
        const team = {
            id: 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            players: [
                playersCopy.shift(), // El mejor
                playersCopy.pop()    // El peor
            ]
        };
        
        // Calcular nivel total
        team.totalLevel = team.players.reduce((sum, player) => sum + player.level, 0);
        
        teams.push(team);
    }
    
    // Si sobra algún jugador (número impar), crear un equipo con un solo jugador
    if (playersCopy.length === 1) {
        const team = {
            id: 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            players: [playersCopy[0]],
            totalLevel: playersCopy[0].level
        };
        
        teams.push(team);
    }
    
    // Mezclar equipos para aleatorizar
    teams = shuffleArray(teams);
    
    renderTeams();
}

// Función para mezclar un array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Renderizar equipos
function renderTeams() {
    const container = document.getElementById('teamsContainer');
    
    if (teams.length === 0) {
        container.innerHTML = '<div class="info-box">No hay equipos generados. Crea un torneo para generar equipos.</div>';
        return;
    }
    
    let html = '<div class="tournament-card">';
    
    if (tournament) {
        html += `<h3>Torneo: ${tournament.name}</h3>`;
        html += `<p>Formato: ${getTournamentTypeName(tournament.type)}</p>`;
        html += `<p>Fecha: ${tournament.date}</p>`;
    }
    
    html += '<table>';
    html += '<thead><tr><th>Equipo</th><th>Jugadores</th><th>Nivel</th></tr></thead>';
    html += '<tbody>';
    
    teams.forEach((team, index) => {
        html += '<tr>';
        html += `<td>Equipo ${index + 1}</td>`;
        html += '<td>';
        
        team.players.forEach((player, playerIndex) => {
            html += player.name;
            if (playerIndex < team.players.length - 1) {
                html += ' / ';
            }
        });
        
        html += '</td>';
        html += `<td>${team.totalLevel}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    
    container.innerHTML = html;
}

// Obtener nombre del tipo de torneo
function getTournamentTypeName(type) {
    switch(type) {
        case 'eliminacion': return 'Eliminación Directa';
        case 'grupos': return 'Fase de Grupos';
        case 'americano': return 'Torneo Americano (Todos contra Todos)';
        case 'americanoExpress': return 'Americano Express (Cambiando Parejas)';
        default: return type;
    }
}

// Generar partidos según el tipo de torneo
function generateMatches() {
    matches = [];
    
    switch(tournament.type) {
        case 'eliminacion':
            generateEliminationMatches();
            break;
        case 'grupos':
            generateGroupMatches();
            break;
        case 'americano':
            generateRoundRobinMatches();
            break;
        case 'americanoExpress':
            generateAmericanoExpressMatches();
            break;
    }
    
    renderMatches();
}

// Generar partidos para torneo de eliminación directa
function generateEliminationMatches() {
    // Calcular número de equipos en la primera ronda
    const numTeams = teams.length;
    const rounds = Math.ceil(Math.log2(numTeams));
    const totalMatches = Math.pow(2, rounds) - 1;
    const firstRoundMatches = Math.pow(2, rounds - 1);
    const byes = Math.pow(2, rounds) - numTeams; // Equipos que pasan directo
    
    // Crear estructura de partidos para el torneo completo
    for (let i = 0; i < totalMatches; i++) {
        const round = Math.floor(Math.log2(i + 1)) + 1;
        const matchInRound = i - (Math.pow(2, round - 1) - 1);
        
        const match = {
            id: 'match_' + i,
            round: round,
            matchNumber: matchInRound + 1,
            team1: null,
            team2: null,
            scores: [],
            winner: null,
            court: null,
            completed: false
        };
        
        matches.push(match);
    }
    
    // Asignar equipos a la primera ronda
    let teamIndex = 0;
    
    for (let i = 0; i < firstRoundMatches; i++) {
        const matchIndex = totalMatches - firstRoundMatches + i;
        
        // Comprobar si este partido necesita un bye
        if (i >= firstRoundMatches - byes) {
            // Este partido tiene un bye, el equipo pasa directamente
            const winnerMatchIndex = Math.floor((matchIndex - 1) / 2);
            
            if (teamIndex < numTeams) {
                // Asignar el equipo como ganador en la siguiente ronda
                if (matchIndex % 2 === 1) { // Índice impar
                    matches[winnerMatchIndex].team2 = teams[teamIndex];
                } else { // Índice par
                    matches[winnerMatchIndex].team1 = teams[teamIndex];
                }
                
                teamIndex++;
            }
        } else {
            // Partido normal con dos equipos
            if (teamIndex < numTeams) {
                matches[matchIndex].team1 = teams[teamIndex++];
            }
            
            if (teamIndex < numTeams) {
                matches[matchIndex].team2 = teams[teamIndex++];
            }
        }
    }
}

// Generar partidos para torneo de fase de grupos
function generateGroupMatches() {
    const numGroups = tournament.numGroups || 2;
    const teamsPerGroup = Math.ceil(teams.length / numGroups);
    
    // Distribuir equipos en grupos
    const groups = Array.from({ length: numGroups }, () => []);
    
    for (let i = 0; i < teams.length; i++) {
        const groupIndex = Math.floor(i / teamsPerGroup);
        if (groupIndex < numGroups) {
            groups[groupIndex].push(teams[i]);
        }
    }
    
    // Generar partidos dentro de cada grupo (todos contra todos)
    groups.forEach((group, groupIndex) => {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const match = {
                    id: `match_group${groupIndex + 1}_${i + 1}vs${j + 1}`,
                    group: groupIndex + 1,
                    phase: 'grupos',
                    team1: group[i],
                    team2: group[j],
                    scores: [],
                    winner: null,
                    court: null,
                    completed: false
                };
                
                matches.push(match);
            }
        }
    });
    
    // Crear estructura para fase final (mejores de cada grupo)
    const numTeamsNextRound = numGroups * 2; // 2 equipos avanzan por grupo
    const eliminationRounds = Math.ceil(Math.log2(numTeamsNextRound));
    const totalEliminationMatches = Math.pow(2, eliminationRounds) - 1;
    
    for (let i = 0; i < totalEliminationMatches; i++) {
        const round = Math.floor(Math.log2(i + 1)) + 1;
        const matchInRound = i - (Math.pow(2, round - 1) - 1);
        
        const match = {
            id: 'match_final_' + i,
            round: round,
            phase: 'eliminacion',
            matchNumber: matchInRound + 1,
            team1: null,
            team2: null,
            scores: [],
            winner: null,
            court: null,
            completed: false
        };
        
        matches.push(match);
    }
}

// Generar partidos para torneo americano (todos contra todos)
function generateRoundRobinMatches() {
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            const match = {
                id: `match_${i + 1}vs${j + 1}`,
                team1: teams[i],
                team2: teams[j],
                scores: [],
                winner: null,
                court: null,
                completed: false
            };
            
            matches.push(match);
        }
    }
}

// Generar partidos para torneo americano express (cambiando parejas)
function generateAmericanoExpressMatches() {
    // En este formato, cada jugador juega con diferentes compañeros
    // Vamos a generar rondas donde en cada ronda se mezclan las parejas
    
    // Si hay un número impar de jugadores, agregar un jugador "dummy"
    const playersCopy = [...players];
    if (playersCopy.length % 2 !== 0) {
        playersCopy.push({
            id: 'dummy',
            name: 'Bye',
            level: 0
        });
    }
    
    // Número de rondas: cada jugador debe jugar con/contra todos los demás
    const numRounds = playersCopy.length - 1;
    
    // Aplicamos el algoritmo "Circle Method" para crear las rondas
    // Un jugador fijo, los demás rotan
    const fixed = playersCopy[0];
    const rotating = playersCopy.slice(1);
    
    for (let round = 0; round < numRounds; round++) {
        const matchesInRound = playersCopy.length / 4;
        
        // Para cada ronda, crear las parejas
        for (let i = 0; i < matchesInRound; i++) {
            // Crear primer equipo
            const team1 = {
                id: `team_round${round + 1}_1_${i}`,
                players: [
                    i === 0 ? fixed : rotating[i - 1],
                    rotating[rotating.length - i - 1]
                ],
                isTemporary: true
            };
            
            // Crear segundo equipo
            const team2 = {
                id: `team_round${round + 1}_2_${i}`,
                players: [
                    rotating[i],
                    rotating[rotating.length - i - 2]
                ],
                isTemporary: true
            };
            
            // Si algún equipo tiene al jugador "dummy", este partido no se juega
            if (team1.players.some(p => p.id === 'dummy') || 
                team2.players.some(p => p.id === 'dummy')) {
                continue;
            }
            
            // Crear partido
            const match = {
                id: `match_round${round + 1}_${i + 1}`,
                round: round + 1,
                team1,
                team2,
                scores: [],
                winner: null,
                court: null,
                completed: false
            };
            
            matches.push(match);
        }
        
        // Rotar jugadores para la siguiente ronda
        rotating.unshift(rotating.pop());
    }
}

// Asignar canchas a los partidos
function assignCourts() {
    courts = [];
    
    // Crear canchas
    for (let i = 0; i < tournament.numCourts; i++) {
        courts.push({
            id: `court_${i + 1}`,
            name: `Cancha ${i + 1}`,
            matches: []
        });
    }
    
    // Distribuir partidos en canchas de forma equitativa
    matches.forEach((match, index) => {
        const courtIndex = index % tournament.numCourts;
        match.court = courts[courtIndex].id;
        courts[courtIndex].matches.push(match.id);
    });
    
    renderCourts();
}

// Renderizar canchas
function renderCourts() {
    const container = document.getElementById('courtsContainer');
    
    if (courts.length === 0) {
        container.innerHTML = '<div class="info-box">No hay canchas asignadas. Por favor, crea un torneo primero.</div>';
        return;
    }
    
    let html = '<div class="courts-container">';
    
    courts.forEach(court => {
        html += `
            <div class="court-card">
                <div class="court-header">
                    <h3>${court.name}</h3>
                    <span>${court.matches.length} partidos</span>
                </div>
                <div class="court-matches">
        `;
        
        if (court.matches.length === 0) {
            html += '<p>No hay partidos asignados a esta cancha.</p>';
        } else {
            court.matches.forEach(matchId => {
                const match = matches.find(m => m.id === matchId);
                if (match) {
                    let matchInfo = '';
                    
                    if (match.team1 && match.team2) {
                        // Formatear nombres de equipo
                        const team1Names = match.team1.players.map(p => p.name).join(' / ');
                        const team2Names = match.team2.players.map(p => p.name).join(' / ');
                        
                        matchInfo = `${team1Names} vs ${team2Names}`;
                        
                        if (match.completed) {
                            matchInfo += ' (Completado)';
                        }
                    } else {
                        matchInfo = 'Partido por definir';
                    }
                    
                    html += `<div class="court-match">${matchInfo}</div>`;
                }
            });
        }
        
        html += '</div></div>';
    });
    
    html += '</div>';
    
    container.innerHTML = html;
}

// Renderizar partidos
function renderMatches() {
    const container = document.getElementById('matchesContainer');
    
    if (matches.length === 0) {
        container.innerHTML = '<div class="info-box">No hay partidos programados. Por favor, crea un torneo primero.</div>';
        return;
    }
    
    let html = '';
    
    if (tournament.type === 'eliminacion') {
        // Para torneos de eliminación, mostrar bracket
        html += renderEliminationBracket();
    } else if (tournament.type === 'grupos') {
        // Para torneos de grupos, mostrar grupos y luego bracket
        html += renderGroupMatches();
    } else {
        // Para otros formatos, mostrar lista de partidos
        html += renderMatchList();
    }
    
    container.innerHTML = html;
    
    // Agregar eventos para registrar resultados
    document.querySelectorAll('.save-score').forEach(button => {
        button.addEventListener('click', function() {
            const matchId = this.getAttribute('data-match');
            const match = matches.find(m => m.id === matchId);
            
            if (match) {
                const scoreInputs = document.querySelectorAll(`[data-match="${matchId}"].score-input`);
                const scores = [];
                
                // Recoger puntuaciones
                scoreInputs.forEach(input => {
                    const team = input.getAttribute('data-team');
                    const set = parseInt(input.getAttribute('data-set'));
                    
                    if (!scores[set - 1]) {
                        scores[set - 1] = {};
                    }
                    
                    scores[set - 1][team] = parseInt(input.value) || 0;
                });
                
                // Guardar puntuaciones
                match.scores = scores;
                
                // Determinar ganador
                let team1Sets = 0;
                let team2Sets = 0;
                
                scores.forEach(set => {
                    if (set.team1 > set.team2) {
                        team1Sets++;
                    } else if (set.team2 > set.team1) {
                        team2Sets++;
                    }
                });
                
                if (team1Sets > team2Sets) {
                    match.winner = 'team1';
                } else if (team2Sets > team1Sets) {
                    match.winner = 'team2';
                } else {
                    match.winner = null; // Empate o incompleto
                }
                
                // Marcar como completado si hay un ganador
                match.completed = match.winner !== null;
                
                // Si es torneo de eliminación, actualizar siguiente ronda
                if (tournament.type === 'eliminacion' && match.completed) {
                    updateEliminationBracket(match);
                }
                
                saveLocalData();
                renderMatches();
                renderResults();
            }
        });
    });
}

// Renderizar lista de partidos
function renderMatchList() {
    let html = '';
    
    matches.forEach(match => {
        if (!match.team1 || !match.team2) return;
        
        const team1Names = match.team1.players.map(p => p.name).join(' / ');
        const team2Names = match.team2.players.map(p => p.name).join(' / ');
        
        const courtName = courts.find(c => c.id === match.court)?.name || '';
        
        html += `
            <div class="match-card" data-id="${match.id}">
                <div class="match-header">
                    <span>${match.round ? 'Ronda ' + match.round : ''}</span>
                    <span>${courtName}</span>
                </div>
                <div class="match-teams">
                    <div class="match-team ${match.winner === 'team1' ? 'winner' : ''}">
                        <strong>${team1Names}</strong>
                    </div>
                    <div style="text-align: center; padding: 0 10px;">VS</div>
                    <div class="match-team ${match.winner === 'team2' ? 'winner' : ''}">
                        <strong>${team2Names}</strong>
                    </div>
                </div>
        `;
        
        // Mostrar formulario para puntajes
        html += '<div class="match-score">';
        
        for (let i = 1; i <= tournament.numSets; i++) {
            const setScore = match.scores[i - 1] || { team1: 0, team2: 0 };
            
            html += `
                <div>
                    <label>Set ${i}:</label>
                    <div style="display: flex; gap: 10px; margin-top: 5px;">
                        <input type="number" min="0" class="score-input" value="${setScore.team1 || ''}" 
                            data-match="${match.id}" data-team="team1" data-set="${i}">
                        <input type="number" min="0" class="score-input" value="${setScore.team2 || ''}" 
                            data-match="${match.id}" data-team="team2" data-set="${i}">
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        
        // Botón para guardar resultados
        html += `
            <div style="text-align: center; margin-top: 15px;">
                <button class="save-score" data-match="${match.id}">Guardar Resultado</button>
            </div>
        `;
        
        html += '</div>';
    });
    
    return html;
}

// Renderizar partidos de fase de grupos
function renderGroupMatches() {
    let html = '';
    const numGroups = tournament.numGroups || 2;
    
    // Agrupar partidos por grupo
    for (let i = 0; i < numGroups; i++) {
        const groupMatches = matches.filter(m => m.group === i + 1);
        
        if (groupMatches.length > 0) {
            html += `
                <div class="tournament-card">
                    <h3>Grupo ${i + 1}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Equipo</th>
                                <th>PJ</th>
                                <th>PG</th>
                                <th>PP</th>
                                <th>Puntos</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            // Obtener equipos únicos del grupo
            const groupTeams = [];
            groupMatches.forEach(match => {
                if (match.team1 && !groupTeams.some(t => t.id === match.team1.id)) {
                    groupTeams.push(match.team1);
                }
                if (match.team2 && !groupTeams.some(t => t.id === match.team2.id)) {
                    groupTeams.push(match.team2);
                }
            });
            
            // Calcular estadísticas por equipo
            groupTeams.forEach(team => {
                const teamMatches = groupMatches.filter(m => 
                    (m.team1 && m.team1.id === team.id) || 
                    (m.team2 && m.team2.id === team.id)
                );
                
                const played = teamMatches.filter(m => m.completed).length;
                let won = 0;
                let lost = 0;
                
                teamMatches.forEach(match => {
                    if (!match.completed) return;
                    
                    if ((match.team1 && match.team1.id === team.id && match.winner === 'team1') || 
                        (match.team2 && match.team2.id === team.id && match.winner === 'team2')) {
                        won++;
                    } else {
                        lost++;
                    }
                });
                
                const points = won * 3; // 3 puntos por victoria
                
                const teamNames = team.players.map(p => p.name).join(' / ');
                
                html += `
                    <tr>
                        <td>${teamNames}</td>
                        <td>${played}</td>
                        <td>${won}</td>
                        <td>${lost}</td>
                        <td>${points}</td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            
            // Mostrar partidos del grupo
            html += '<div style="margin-top: 15px;">';
            groupMatches.forEach(match => {
                if (!match.team1 || !match.team2) return;
                
                const team1Names = match.team1.players.map(p => p.name).join(' / ');
                const team2Names = match.team2.players.map(p => p.name).join(' / ');
                
                html += `
                    <div class="match-card" data-id="${match.id}">
                        <div class="match-teams">
                            <div class="match-team ${match.winner === 'team1' ? 'winner' : ''}">
                                <strong>${team1Names}</strong>
                            </div>
                            <div style="text-align: center; padding: 0 10px;">VS</div>
                            <div class="match-team ${match.winner === 'team2' ? 'winner' : ''}">
                                <strong>${team2Names}</strong>
                            </div>
                        </div>
                `;
                
                // Mostrar formulario para puntajes
                html += '<div class="match-score">';
                
                for (let i = 1; i <= tournament.numSets; i++) {
                    const setScore = match.scores[i - 1] || { team1: 0, team2: 0 };
                    
                    html += `
                        <div>
                            <label>Set ${i}:</label>
                            <div style="display: flex; gap: 10px; margin-top: 5px;">
                                <input type="number" min="0" class="score-input" value="${setScore.team1 || ''}" 
                                    data-match="${match.id}" data-team="team1" data-set="${i}">
                                <input type="number" min="0" class="score-input" value="${setScore.team2 || ''}" 
                                    data-match="${match.id}" data-team="team2" data-set="${i}">
                            </div>
                        </div>
                    `;
                }
                
                html += '</div>';
                
                // Botón para guardar resultados
                html += `
                    <div style="text-align: center; margin-top: 15px;">
                        <button class="save-score" data-match="${match.id}">Guardar Resultado</button>
                    </div>
                `;
                
                html += '</div>';
            });
            
            html += '</div></div>';
        }
    }
    
    // Mostrar fase final si hay partidos
    const finalMatches = matches.filter(m => m.phase === 'eliminacion');
    
    if (finalMatches.length > 0) {
        html += '<div class="tournament-card">';
        html += '<h3>Fase Final</h3>';
        html += renderEliminationBracket(finalMatches);
        html += '</div>';
    }
    
    return html;
}

// Renderizar bracket de eliminación
function renderEliminationBracket(matchesToRender = null) {
    const matchesToUse = matchesToRender || matches;
    
    // Agrupar partidos por ronda
    const roundsMap = {};
    matchesToUse.forEach(match => {
        if (!match.round) return;
        
        if (!roundsMap[match.round]) {
            roundsMap[match.round] = [];
        }
        
        roundsMap[match.round].push(match);
    });
    
    const rounds = Object.keys(roundsMap).sort((a, b) => a - b);
    
    // Si no hay rondas, mostrar mensaje
    if (rounds.length === 0) {
        return '<div class="info-box">No hay partidos de eliminación directa configurados.</div>';
    }
    
    let html = '<div class="tournament-bracket"><div class="bracket-container">';
    
    // Renderizar cada ronda
    rounds.forEach(round => {
        const roundMatches = roundsMap[round].sort((a, b) => a.matchNumber - b.matchNumber);
        
        html += `
            <div class="round">
                <div class="round-title">
                    ${getRoundName(round, rounds.length)}
                </div>
        `;
        
        roundMatches.forEach(match => {
            let team1Name = 'Por definir';
            let team2Name = 'Por definir';
            
            if (match.team1) {
                team1Name = match.team1.players.map(p => p.name).join(' / ');
            }
            
            if (match.team2) {
                team2Name = match.team2.players.map(p => p.name).join(' / ');
            }
            
            // Obtener puntuaciones si hay
            let scoreHTML = '';
            if (match.scores && match.scores.length > 0) {
                const sets1 = match.scores.filter(s => s.team1 > s.team2).length;
                const sets2 = match.scores.filter(s => s.team2 > s.team1).length;
                
                scoreHTML = `
                    <span class="bracket-score">${sets1}</span>
                    <span class="bracket-score">${sets2}</span>
                `;
            }
            
            html += `
                <div class="bracket-match" data-id="${match.id}">
                    <div class="bracket-team ${match.winner === 'team1' ? 'bracket-winner' : ''}">
                        <span>${team1Name}</span>
                        ${match.winner === 'team1' ? scoreHTML : ''}
                    </div>
                    <div class="bracket-team ${match.winner === 'team2' ? 'bracket-winner' : ''}">
                        <span>${team2Name}</span>
                        ${match.winner === 'team2' ? scoreHTML : ''}
                    </div>
            `;
            
            // Si no está completado, mostrar formulario para resultados
            if (!match.completed && match.team1 && match.team2) {
                html += `
                    <div style="margin-top: 10px;">
                        <button class="btn-show-score" data-match="${match.id}">Ingresar Resultado</button>
                        <div class="score-form" id="score-form-${match.id}" style="display: none; margin-top: 10px;">
                            <div class="match-score">
                `;
                
                for (let i = 1; i <= tournament.numSets; i++) {
                    const setScore = match.scores[i - 1] || { team1: 0, team2: 0 };
                    
                    html += `
                        <div>
                            <label>Set ${i}:</label>
                            <div style="display: flex; gap: 5px; margin-top: 5px;">
                                <input type="number" min="0" class="score-input" style="width: 40px;" value="${setScore.team1 || ''}" 
                                    data-match="${match.id}" data-team="team1" data-set="${i}">
                                <input type="number" min="0" class="score-input" style="width: 40px;" value="${setScore.team2 || ''}" 
                                    data-match="${match.id}" data-team="team2" data-set="${i}">
                            </div>
                        </div>
                    `;
                }
                
                html += `
                            </div>
                            <div style="text-align: center; margin-top: 10px;">
                                <button class="save-score" data-match="${match.id}">Guardar</button>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            html += '</div>';
        });
        
        html += '</div>';
    });
    
    html += '</div></div>';
    
    // Agregar script para mostrar/ocultar formularios de puntuación
    html += `
        <script>
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('btn-show-score')) {
                    const matchId = e.target.getAttribute('data-match');
                    const form = document.getElementById('score-form-' + matchId);
                    if (form) {
                        form.style.display = form.style.display === 'none' ? 'block' : 'none';
                    }
                }
            });
        </script>
    `;
    
    return html;
}

// Obtener nombre de la ronda
function getRoundName(round, totalRounds) {
    round = parseInt(round);
    
    if (round === totalRounds) {
        return 'Final';
    } else if (round === totalRounds - 1) {
        return 'Semifinal';
    } else if (round === totalRounds - 2) {
        return 'Cuartos';
    } else if (round === totalRounds - 3) {
        return 'Octavos';
    } else {
        return `Ronda ${round}`;
    }
}

// Actualizar bracket de eliminación después de un partido
function updateEliminationBracket(match) {
    if (!match.round || !match.completed || !match.winner) return;
    
    // Buscar el siguiente partido
    const currentRound = parseInt(match.round);
    const currentMatchNumber = parseInt(match.matchNumber);
    
    // Calcular el próximo partido
    const nextRound = currentRound - 1;
    if (nextRound <= 0) return; // Ya es la final
    
    const nextMatchNumber = Math.ceil(currentMatchNumber / 2);
    
    // Buscar el partido
    const nextMatch = matches.find(m => 
        m.round === nextRound && 
        m.matchNumber === nextMatchNumber
    );
    
    if (!nextMatch) return;
    
    // Determinar si es equipo 1 o 2 en el siguiente partido
    const isSecondTeam = currentMatchNumber % 2 === 0;
    
    // Asignar el equipo ganador al siguiente partido
    if (isSecondTeam) {
        nextMatch.team2 = match.winner === 'team1' ? match.team1 : match.team2;
    } else {
        nextMatch.team1 = match.winner === 'team1' ? match.team1 : match.team2;
    }
    
    saveLocalData();
}

// Renderizar resultados
function renderResults() {
    const container = document.getElementById('resultsContainer');
    
    if (!tournament || matches.length === 0) {
        container.innerHTML = '<div class="info-box">No hay resultados disponibles. Por favor, completa los partidos del torneo.</div>';
        return;
    }
    
    // Si es torneo americano express, mostrar ranking individual
    if (tournament.type === 'americanoExpress') {
        renderAmericanoExpressResults(container);
        return;
    }
    
    // Para otros formatos, mostrar ganadores o ranking
    if (tournament.type === 'eliminacion' || tournament.type === 'grupos') {
        renderEliminationResults(container);
    } else if (tournament.type === 'americano') {
        renderRoundRobinResults(container);
    }
}

// Renderizar resultados de torneo americano express
function renderAmericanoExpressResults(container) {
    // Calcular puntos por jugador
    const playerStats = {};
    
    players.forEach(player => {
        playerStats[player.id] = {
            player,
            played: 0,
            won: 0,
            sets: 0,
            points: 0
        };
    });
    
    // Contabilizar partidos
    matches.filter(m => m.completed).forEach(match => {
        // Identificar jugadores del equipo 1
        match.team1.players.forEach(player => {
            if (playerStats[player.id]) {
                playerStats[player.id].played++;
                
                if (match.winner === 'team1') {
                    playerStats[player.id].won++;
                    playerStats[player.id].points += 3; // 3 puntos por victoria
                }
                
                // Contar sets ganados
                match.scores.forEach(set => {
                    if (set.team1 > set.team2) {
                        playerStats[player.id].sets++;
                        playerStats[player.id].points += 1; // 1 punto adicional por set ganado
                    }
                });
            }
        });
        
        // Identificar jugadores del equipo 2
        match.team2.players.forEach(player => {
            if (playerStats[player.id]) {
                playerStats[player.id].played++;
                
                if (match.winner === 'team2') {
                    playerStats[player.id].won++;
                    playerStats[player.id].points += 3; // 3 puntos por victoria
                }
                
                // Contar sets ganados
                match.scores.forEach(set => {
                    if (set.team2 > set.team1) {
                        playerStats[player.id].sets++;
                        playerStats[player.id].points += 1; // 1 punto adicional por set ganado
                    }
                });
            }
        });
    });
    
    // Ordenar jugadores por puntos
    const playerRanking = Object.values(playerStats).sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        } else if (b.won !== a.won) {
            return b.won - a.won;
        } else {
            return b.sets - a.sets;
        }
    });
    
    // Generar HTML
    let html = `
        <div class="tournament-card">
            <h3>Ranking Individual - ${tournament.name}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Jugador</th>
                        <th>Nivel</th>
                        <th>PJ</th>
                        <th>PG</th>
                        <th>Sets</th>
                        <th>Puntos</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    playerRanking.forEach((stat, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${stat.player.name}</td>
                <td>${stat.player.level}</td>
                <td>${stat.played}</td>
                <td>${stat.won}</td>
                <td>${stat.sets}</td>
                <td><strong>${stat.points}</strong></td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    
    // Mostrar partidos completados
    html += renderCompletedMatches();
    
    container.innerHTML = html;
}

// Renderizar resultados de torneo eliminación o grupos
function renderEliminationResults(container) {
    let html = '';
    
    // Buscar el partido final
    let finalMatch = null;
    
    if (tournament.type === 'eliminacion') {
        finalMatch = matches.find(m => m.round === 1);
    } else if (tournament.type === 'grupos') {
        finalMatch = matches.find(m => m.phase === 'eliminacion' && m.round === 1);
    }
    
    // Si hay final y está completada, mostrar ganadores
    if (finalMatch && finalMatch.completed) {
        const winnerTeam = finalMatch.winner === 'team1' ? finalMatch.team1 : finalMatch.team2;
        const runnerUpTeam = finalMatch.winner === 'team1' ? finalMatch.team2 : finalMatch.team1;
        
        const winnerNames = winnerTeam.players.map(p => p.name).join(' / ');
        const runnerUpNames = runnerUpTeam.players.map(p => p.name).join(' / ');
        
        html += `
            <div class="tournament-card">
                <h3>Resultado Final - ${tournament.name}</h3>
                <div style="margin: 20px 0; text-align: center;">
                    <div style="margin-bottom: 20px;">
                        <h4>🏆 Campeones 🏆</h4>
                        <p style="font-size: 24px; font-weight: bold;">${winnerNames}</p>
                    </div>
                    <div>
                        <h4>🥈 Subcampeones 🥈</h4>
                        <p style="font-size: 20px;">${runnerUpNames}</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="alert-info">
                El torneo aún no ha finalizado. Completa todos los partidos para ver los resultados finales.
            </div>
        `;
    }
    
    // Mostrar partidos completados
    html += renderCompletedMatches();
    
    container.innerHTML = html;
}

// Renderizar resultados de torneo round robin (todos contra todos)
function renderRoundRobinResults(container) {
    // Calcular estadísticas por equipo
    const teamStats = {};
    
    teams.forEach(team => {
        teamStats[team.id] = {
            team,
            played: 0,
            won: 0,
            lost: 0,
            setsFavor: 0,
            setsContra: 0,
            points: 0
        };
    });
    
    // Contabilizar partidos
    matches.filter(m => m.completed).forEach(match => {
        if (!match.team1 || !match.team2) return;
        
        // Equipo 1
        if (teamStats[match.team1.id]) {
            teamStats[match.team1.id].played++;
            
            if (match.winner === 'team1') {
                teamStats[match.team1.id].won++;
                teamStats[match.team1.id].points += 3; // 3 puntos por victoria
            } else {
                teamStats[match.team1.id].lost++;
            }
            
            // Contar sets
            match.scores.forEach(set => {
                if (set.team1 > set.team2) {
                    teamStats[match.team1.id].setsFavor++;
                    teamStats[match.team1.id].points += 1; // 1 punto adicional por set ganado
                }
                if (set.team2 > 0) {
                    teamStats[match.team1.id].setsContra++;
                }
            });
        }
        
        // Equipo 2
        if (teamStats[match.team2.id]) {
            teamStats[match.team2.id].played++;
            
            if (match.winner === 'team2') {
                teamStats[match.team2.id].won++;
                teamStats[match.team2.id].points += 3; // 3 puntos por victoria
            } else {
                teamStats[match.team2.id].lost++;
            }
            
            // Contar sets
            match.scores.forEach(set => {
                if (set.team2 > set.team1) {
                    teamStats[match.team2.id].setsFavor++;
                    teamStats[match.team2.id].points += 1; // 1 punto adicional por set ganado
                }
                if (set.team1 > 0) {
                    teamStats[match.team2.id].setsContra++;
                }
            });
        }
    });
    
    // Ordenar equipos por puntos
    const teamRanking = Object.values(teamStats).sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        } else if (b.won !== a.won) {
            return b.won - a.won;
        } else {
            return (b.setsFavor - b.setsContra) - (a.setsFavor - a.setsContra);
        }
    });
    
    // Generar HTML
    let html = `
        <div class="tournament-card">
            <h3>Clasificación - ${tournament.name}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Equipo</th>
                        <th>PJ</th>
                        <th>PG</th>
                        <th>PP</th>
                        <th>Sets</th>
                        <th>Puntos</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    teamRanking.forEach((stat, index) => {
        const teamNames = stat.team.players.map(p => p.name).join(' / ');
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${teamNames}</td>
                <td>${stat.played}</td>
                <td>${stat.won}</td>
                <td>${stat.lost}</td>
                <td>${stat.setsFavor}-${stat.setsContra}</td>
                <td><strong>${stat.points}</strong></td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    
    // Mostrar partidos completados
    html += renderCompletedMatches();
    
    container.innerHTML = html;
}

// Renderizar partidos completados
function renderCompletedMatches() {
    const completedMatches = matches.filter(m => m.completed);
    
    if (completedMatches.length === 0) {
        return '<div class="info-box">No hay partidos completados todavía.</div>';
    }
    
    let html = `
        <div class="tournament-card">
            <h3>Partidos Completados</h3>
            <table>
                <thead>
                    <tr>
                        <th>Equipo 1</th>
                        <th>Resultado</th>
                        <th>Equipo 2</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    completedMatches.forEach(match => {
        if (!match.team1 || !match.team2) return;
        
        const team1Names = match.team1.players.map(p => p.name).join(' / ');
        const team2Names = match.team2.players.map(p => p.name).join(' / ');
        
        // Formatear resultado
        let resultText = '';
        match.scores.forEach((set, index) => {
            resultText += `${set.team1}-${set.team2}`;
            if (index < match.scores.length - 1) {
                resultText += ', ';
            }
        });
        
        html += `
            <tr>
                <td class="${match.winner === 'team1' ? 'winner' : ''}">${team1Names}</td>
                <td>${resultText}</td>
                <td class="${match.winner === 'team2' ? 'winner' : ''}">${team2Names}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    
    return html;
}

// Generar imagen de resultados
document.getElementById('generateImage').addEventListener('click', function() {
    if (!tournament || matches.filter(m => m.completed).length === 0) {
        alert('No hay resultados para exportar. Completa algunos partidos primero.');
        return;
    }
    
    const canvas = document.getElementById('resultsCanvas');
    const ctx = canvas.getContext('2d');
    
    // Mostrar el contenedor del canvas
    document.getElementById('canvas-container').style.display = 'block';
    document.querySelector('.export-buttons').style.display = 'flex';
    
    // Limpiar canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar título
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(tournament.name, canvas.width / 2, 50);
    
    ctx.fillStyle = '#666';
    ctx.font = '20px Arial';
    ctx.fillText('Resultados del Torneo', canvas.width / 2, 80);
    
    // Dibujar resultados según tipo de torneo
    if (tournament.type === 'eliminacion' || tournament.type === 'grupos') {
        drawEliminationResults(ctx);
    } else if (tournament.type === 'americano') {
        drawRoundRobinResults(ctx);
    } else if (tournament.type === 'americanoExpress') {
        drawAmericanoExpressResults(ctx);
    }
    
    // Dibujar fecha y firma
    ctx.fillStyle = '#999';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Fecha: ${tournament.date}`, canvas.width - 20, canvas.height - 20);
    
    // Mostrar mensaje
    document.getElementById('exportResult').innerHTML = `
        <div class="alert-success">
            Imagen de resultados generada con éxito.
        </div>
    `;
});

// Dibujar resultados de eliminación en el canvas
function drawEliminationResults(ctx) {
    // Buscar el partido final
    let finalMatch = null;
    
    if (tournament.type === 'eliminacion') {
        finalMatch = matches.find(m => m.round === 1);
    } else if (tournament.type === 'grupos') {
        finalMatch = matches.find(m => m.phase === 'eliminacion' && m.round === 1);
    }
    
    if (finalMatch && finalMatch.completed) {
        const winnerTeam = finalMatch.winner === 'team1' ? finalMatch.team1 : finalMatch.team2;
        const runnerUpTeam = finalMatch.winner === 'team1' ? finalMatch.team2 : finalMatch.team1;
        
        const winnerNames = winnerTeam.players.map(p => p.name).join(' / ');
        const runnerUpNames = runnerUpTeam.players.map(p => p.name).join(' / ');
        
        // Dibujar podio
        drawPodium(ctx, winnerNames, runnerUpNames);
    } else {
        // Dibujar partidos completados
        drawCompletedMatches(ctx);
    }
}

// Dibujar resultados de round robin en el canvas
function drawRoundRobinResults(ctx) {
    // Calcular estadísticas por equipo
    const teamStats = {};
    
    teams.forEach(team => {
        teamStats[team.id] = {
            team,
            played: 0,
            won: 0,
            lost: 0,
            points: 0
        };
    });
    
    // Contabilizar partidos
    matches.filter(m => m.completed).forEach(match => {
        if (!match.team1 || !match.team2) return;
        
        // Equipo 1
        if (teamStats[match.team1.id]) {
            teamStats[match.team1.id].played++;
            
            if (match.winner === 'team1') {
                teamStats[match.team1.id].won++;
                teamStats[match.team1.id].points += 3; // 3 puntos por victoria
            } else {
                teamStats[match.team1.id].lost++;
            }
        }
        
        // Equipo 2
        if (teamStats[match.team2.id]) {
            teamStats[match.team2.id].played++;
            
            if (match.winner === 'team2') {
                teamStats[match.team2.id].won++;
                teamStats[match.team2.id].points += 3; // 3 puntos por victoria
            } else {
                teamStats[match.team2.id].lost++;
            }
        }
    });
    
    // Ordenar equipos por puntos
    const teamRanking = Object.values(teamStats).sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        } else {
            return b.won - a.won;
        }
    });
    
    // Dibujar tabla de clasificación
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Clasificación', canvas.width / 2, 130);
    
    // Cabecera de tabla
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Pos', 50, 170);
    ctx.fillText('Equipo', 100, 170);
    ctx.fillText('PJ', 400, 170);
    ctx.fillText('PG', 450, 170);
    ctx.fillText('PP', 500, 170);
    ctx.fillText('Pts', 550, 170);
    
    // Línea de división
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(50, 180);
    ctx.lineTo(750, 180);
    ctx.stroke();
    
    // Contenido de la tabla (limitar a top 10)
    const maxTeams = Math.min(10, teamRanking.length);
    
    for (let i = 0; i < maxTeams; i++) {
        const y = 210 + (i * 30);
        const stat = teamRanking[i];
        const teamNames = stat.team.players.map(p => p.name).join(' / ');
        
        ctx.font = '16px Arial';
        ctx.fillStyle = i === 0 ? '#2ecc71' : '#333';
        ctx.textAlign = 'left';
        ctx.fillText((i + 1).toString(), 50, y);
        ctx.fillText(teamNames, 100, y);
        ctx.fillText(stat.played.toString(), 400, y);
        ctx.fillText(stat.won.toString(), 450, y);
        ctx.fillText(stat.lost.toString(), 500, y);
        ctx.fillText(stat.points.toString(), 550, y);
    }
    
    // Si hay podio, dibujarlo
    if (teamRanking.length >= 2) {
        const winnerNames = teamRanking[0].team.players.map(p => p.name).join(' / ');
        const runnerUpNames = teamRanking[1].team.players.map(p => p.name).join(' / ');
        
        // Dibujar podio más pequeño en la parte inferior
        drawPodium(ctx, winnerNames, runnerUpNames, 400);
    }
}

// Dibujar resultados de americano express en el canvas
function drawAmericanoExpressResults(ctx) {
    // Calcular puntos por jugador
    const playerStats = {};
    
    players.forEach(player => {
        playerStats[player.id] = {
            player,
            played: 0,
            won: 0,
            points: 0
        };
    });
    
    // Contabilizar partidos
    matches.filter(m => m.completed).forEach(match => {
        // Identificar jugadores del equipo 1
        match.team1.players.forEach(player => {
            if (playerStats[player.id]) {
                playerStats[player.id].played++;
                
                if (match.winner === 'team1') {
                    playerStats[player.id].won++;
                    playerStats[player.id].points += 3; // 3 puntos por victoria
                }
            }
        });
        
        // Identificar jugadores del equipo 2
        match.team2.players.forEach(player => {
            if (playerStats[player.id]) {
                playerStats[player.id].played++;
                
                if (match.winner === 'team2') {
                    playerStats[player.id].won++;
                    playerStats[player.id].points += 3; // 3 puntos por victoria
                }
            }
        });
    });
    
    // Ordenar jugadores por puntos
    const playerRanking = Object.values(playerStats).sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        } else {
            return b.won - a.won;
        }
    });
    
    // Dibujar tabla de clasificación
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Ranking Individual', canvas.width / 2, 130);
    
    // Cabecera de tabla
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Pos', 50, 170);
    ctx.fillText('Jugador', 100, 170);
    ctx.fillText('Nivel', 350, 170);
    ctx.fillText('PJ', 450, 170);
    ctx.fillText('PG', 500, 170);
    ctx.fillText('Pts', 550, 170);
    
    // Línea de división
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(50, 180);
    ctx.lineTo(750, 180);
    ctx.stroke();
    
    // Contenido de la tabla (limitar a top 10)
    const maxPlayers = Math.min(10, playerRanking.length);
    
    for (let i = 0; i < maxPlayers; i++) {
        const y = 210 + (i * 30);
        const stat = playerRanking[i];
        
        ctx.font = '16px Arial';
        ctx.fillStyle = i === 0 ? '#2ecc71' : '#333';
        ctx.textAlign = 'left';
        ctx.fillText((i + 1).toString(), 50, y);
        ctx.fillText(stat.player.name, 100, y);
        ctx.fillText(stat.player.level.toString(), 350, y);
        ctx.fillText(stat.played.toString(), 450, y);
        ctx.fillText(stat.won.toString(), 500, y);
        ctx.fillText(stat.points.toString(), 550, y);
    }
    
    // Si hay podio, dibujarlo
    if (playerRanking.length >= 2) {
        const winnerName = playerRanking[0].player.name;
        const runnerUpName = playerRanking[1].player.name;
        
        // Dibujar podio más pequeño en la parte inferior
        drawPodium(ctx, winnerName, runnerUpName, 400);
    }
}

// Dibujar podio en el canvas
function drawPodium(ctx, winnerName, runnerUpName, yOffset = 200) {
    // Dibujar podio
    ctx.fillStyle = '#f39c12'; // Dorado para el ganador
    ctx.fillRect(canvas.width / 2 - 80, yOffset, 160, 80);
    
    ctx.fillStyle = '#bdc3c7'; // Plateado para el segundo
    ctx.fillRect(canvas.width / 2 - 200, yOffset + 30, 100, 50);
    
    // Dibujar ganadores
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('1°', canvas.width / 2, yOffset + 25);
    ctx.fillText('2°', canvas.width / 2 - 150, yOffset + 55);
    
    // Nombres
    ctx.font = '14px Arial';
    ctx.fillText(winnerName, canvas.width / 2, yOffset + 50);
    ctx.fillText(runnerUpName, canvas.width / 2 - 150, yOffset + 75);
    
    // Dibujar trofeo
    drawTrophy(ctx, canvas.width / 2, yOffset - 30);
}

// Dibujar trofeo simple
function drawTrophy(ctx, x, y) {
    ctx.fillStyle = '#f1c40f';
    
    // Copa
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI, true);
    ctx.fill();
    
    // Base
    ctx.fillRect(x - 5, y, 10, 25);
    ctx.fillRect(x - 15, y + 25, 30, 5);
}

// Dibujar partidos completados en el canvas
function drawCompletedMatches(ctx) {
    const completedMatches = matches.filter(m => m.completed);
    
    if (completedMatches.length === 0) {
        return;
    }
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Partidos Completados', canvas.width / 2, 170);
    
    // Cabecera de tabla
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Equipo 1', 100, 210);
    ctx.fillText('Resultado', 350, 210);
    ctx.fillText('Equipo 2', 550, 210);
    
    // Línea de división
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(50, 220);
    ctx.lineTo(750, 220);
    ctx.stroke();
    
    // Contenido de la tabla (limitar a últimos 10)
    const maxMatches = Math.min(10, completedMatches.length);
    const recentMatches = completedMatches.slice(-maxMatches);
    
    for (let i = 0; i < recentMatches.length; i++) {
        const y = 250 + (i * 30);
        const match = recentMatches[i];
        
        if (!match.team1 || !match.team2) continue;
        
        const team1Names = match.team1.players.map(p => p.name).join(' / ');
        const team2Names = match.team2.players.map(p => p.name).join(' / ');
        
        // Formatear resultado
        let resultText = '';
        match.scores.forEach((set, index) => {
            resultText += `${set.team1}-${set.team2}`;
            if (index < match.scores.length - 1) {
                resultText += ', ';
            }
        });
        
        ctx.font = '16px Arial';
        ctx.fillStyle = match.winner === 'team1' ? '#2ecc71' : '#333';
        ctx.textAlign = 'left';
        ctx.fillText(team1Names, 100, y);
        
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(resultText, 350, y);
        
        ctx.fillStyle = match.winner === 'team2' ? '#2ecc71' : '#333';
        ctx.textAlign = 'left';
        ctx.fillText(team2Names, 550, y);
    }
}

// Descargar imagen
document.getElementById('downloadImage').addEventListener('click', function() {
    const canvas = document.getElementById('resultsCanvas');
    const link = document.createElement('a');
    link.download = `${tournament.name.replace(/\s+/g, '_')}_resultados.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Compartir imagen (simulado)
document.getElementById('shareImage').addEventListener('click', function() {
    const canvas = document.getElementById('resultsCanvas');
    
    // Verificar si la API de compartir está disponible
    if (navigator.share) {
        canvas.toBlob(function(blob) {
            const file = new File([blob], `${tournament.name}_resultados.png`, { type: 'image/png' });
            
            navigator.share({
                title: `Resultados del Torneo: ${tournament.name}`,
                text: 'Resultados del torneo de pádel',
                files: [file]
            }).catch(error => {
                console.error('Error al compartir', error);
                alert('No se pudo compartir la imagen. Puede descargarla y compartirla manualmente.');
            });
        });
    } else {
        alert('La función de compartir no está disponible en tu dispositivo. Puedes descargar la imagen y compartirla manualmente.');
    }
});

// Cargar datos al iniciar
window.addEventListener('DOMContentLoaded', function() {
    loadLocalData();
    
    // Inicializar pestaña de resultados
    renderResults();
});
