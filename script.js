document.getElementById('uploadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                processCSVData(results.data);
            }
        });
    } else {
        alert('Please select a file.');
    }
});

function processCSVData(data) {
    let totalRows = data.length;
    let nonTreatedCount = 0;

    data.forEach(row => {
        if (row.Statut !== 'fermé') {
            nonTreatedCount++;
        }
    });
    
    let rowscount = data.length;
    let treatementcount = 0;
    let treatementcount4824 = 0;
    let treatementcountsup48=0;

    data.forEach(row => {
        let traitementValue = parseInt(row.TRAITEMENT, 10);
        if (traitementValue === 0 || traitementValue === 1) {
            treatementcount++;
        }
        if (traitementValue === 2){
            treatementcount4824++;
        }
        else if (traitementValue > 2)  {
            treatementcountsup48++;
        }
    });

    const percentage = ((treatementcount / rowscount) * 100).toFixed(2);
    document.getElementById('results1').innerText = `Pourcentage des Réclamations traitées dans un délai < à  24h:  ${percentage}%`;

    const percentage4824 = ((treatementcount4824 / rowscount) * 100).toFixed(2);
    document.getElementById('results2').innerText = `Pourcentage de Réclamations traitées dans un délai entre 24 h et  48 h : ${percentage4824}%`;

    const percentageNonTreated = ((nonTreatedCount / totalRows) * 100).toFixed(2);
    document.getElementById('results').innerText = `Pourcentage des Réclamation non traitées: ${percentageNonTreated}%`;

    const percentage48 = ((treatementcountsup48 / rowscount) * 100).toFixed(2);
    document.getElementById('results3').innerText = `Pourcentage de Réclamations traitées dans un délai > 48h: ${percentage48}%`;

    let acceptanceCounts = {}; 
    let totalAcceptedRows = 0;

    data.forEach(row => {
        if (row.Statut === 'accepté') {
            const acceptanceValue = parseInt(row.ACCEPTATION, 10);
            if (!isNaN(acceptanceValue)) {
                if (!acceptanceCounts[acceptanceValue]) {
                    acceptanceCounts[acceptanceValue] = 0;
                }
                acceptanceCounts[acceptanceValue]++;
                totalAcceptedRows++;
            }
        }
    });

    let weightedSum = 0;
    for (const value in acceptanceCounts) {
        if (acceptanceCounts.hasOwnProperty(value)) {
            const count = acceptanceCounts[value];
            weightedSum += count * parseInt(value, 10); 
        }
    }

    const averageAcceptanceValue = totalAcceptedRows > 0 ? (weightedSum / totalAcceptedRows).toFixed(2) : 'N/A';
    document.getElementById('results4').innerText = `Délai moyen d'accepation d'un ticket: ${averageAcceptanceValue}`;

    let traitementCounts = {}; 
    let totalClosedRows = 0;

    data.forEach(row => {
        if (row.Statut === 'fermé') {
            const traitementValue = parseInt(row.TRAITEMENT, 10);
            if (!isNaN(traitementValue)) {
                if (!traitementCounts[traitementValue]) {
                    traitementCounts[traitementValue] = 0;
                }
                traitementCounts[traitementValue]++;
                totalClosedRows++;
            }
        }
    });

    let traitementWeightedSum = 0;
    for (const value in traitementCounts) {
        if (traitementCounts.hasOwnProperty(value)) {
            const count = traitementCounts[value];
            traitementWeightedSum += count * parseInt(value, 10); 
        }
    }

    const averageTraitementValue = totalClosedRows > 0 ? (traitementWeightedSum / totalClosedRows).toFixed(2) : 'N/A';
    document.getElementById('results5').innerText = `Temps moyen de résolution d'une réclamation en jours : ${averageTraitementValue}`;

    calculateStatistics();
}

function calculateStatistics() {
    const percentageTreatedLess24h = parseFloat(document.getElementById('results1').innerText.split(': ')[1]);
    const percentageTreated24h48h = parseFloat(document.getElementById('results2').innerText.split(': ')[1]);
    const percentageNonTreated = parseFloat(document.getElementById('results').innerText.split(': ')[1]);
    const percentageTreatedMore48h = parseFloat(document.getElementById('results3').innerText.split(': ')[1]);
    const averageAcceptanceValue = parseFloat(document.getElementById('results4').innerText.split(': ')[1]);
    const averageTraitementValue = parseFloat(document.getElementById('results5').innerText.split(': ')[1]);

    
    const treatmentTimesData = {
        labels: ['Temps de Traitement'],
        datasets: [
            {
                label: '<24h',
                data: [percentageTreatedLess24h],
                backgroundColor: '#00f'
            },
            {
                label: '24-48h',
                data: [percentageTreated24h48h],
                backgroundColor: '#ff0'
            },
            {
                label: '>48h',
                data: [percentageTreatedMore48h],
                backgroundColor: '#f00'
            }
        ]
    };

    const treatmentTimesChartCtx = document.getElementById('treatmentTimesChart').getContext('2d');
    new Chart(treatmentTimesChartCtx, {
        type: 'bar',
        data: treatmentTimesData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    
    const treatedData = 100 - percentageNonTreated;
    const nonTreatedData = {
        labels: ['Traité', 'Non-Traité'],
        datasets: [{
            data: [treatedData, percentageNonTreated],
            backgroundColor: ['#0f0', '#f00']
        }]
    };

    const nonTreatedChartCtx = document.getElementById('nonTreatedChart').getContext('2d');
    new Chart(nonTreatedChartCtx, {
        type: 'doughnut',
        data: nonTreatedData,
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    
    const averagesData = {
        labels: ['Délai moyen daccepation dun ticket', 'Temps moyen de résolution dune réclamation en jours'],
        datasets: [{
            label: 'Averages',
            data: [averageAcceptanceValue, averageTraitementValue],
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            borderColor: '#00f',
            borderWidth: 1
        }]
    };

    const averagesChartCtx = document.getElementById('averagesChart').getContext('2d');
    new Chart(averagesChartCtx, {
        type: 'bar',
        data: averagesData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true, 
                    ticks: {
                        color: '#fff' 
                    }
                },
                x: {
                    ticks: {
                        color: '#fff' 
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,  
                    labels: {
                        color: '#fff' 
                    }
                }
            }
        }
    });

}
