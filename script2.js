document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
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
    let agencyCounts = {};
    let origineCounts = { 'Agent': 0, 'Courtier': 0, 'Others': 0 };
    let typeCounts = {};
    let totalRows = data.length;

    data.forEach(row => {
        
        let agencyCode = row['CODE AGENCE'];
        if (agencyCode) {
            if (!agencyCounts[agencyCode]) {
                agencyCounts[agencyCode] = 0;
            }
            agencyCounts[agencyCode]++;
        }

        
        let origine = row['Origine_réclamation'];
        if (origine) {
            let trimmedOrigine = origine.trim();
            if (trimmedOrigine === 'Agent') {
                origineCounts['Agent']++;
            } else if (trimmedOrigine === 'Courtier') {
                origineCounts['Courtier']++;
            } else {
                origineCounts['Others']++;
            }
        }

        
        let type = row['TYPE DEMANDE'];
        if (type) {
            let trimmedType = type.trim();
            if (!typeCounts[trimmedType]) {
                typeCounts[trimmedType] = 0;
            }
            typeCounts[trimmedType]++;
        }
    });

    
    window.results = {
        top10Agencies: getTop10Agencies(agencyCounts, totalRows),
        origineCounts: getOrigineCounts(origineCounts, totalRows),
        typeCounts: getTypeCounts(typeCounts, totalRows)
    };
}

function getTop10Agencies(agencyCounts, totalRows) {
    let top10Agencies = Object.entries(agencyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    return top10Agencies.map(([code, count]) => {
        let percentage = ((count / totalRows) * 100).toFixed(2);
        return { label: code, value: count, percentage: percentage };
    });
}

function getOrigineCounts(origineCounts, totalRows) {
    return {
        labels: ['Agents', 'Courtiers', 'Others'],
        data: [
            origineCounts['Agent'],
            origineCounts['Courtier'],
            origineCounts['Others']
        ],
        percentages: [
            ((origineCounts['Agent'] / totalRows) * 100).toFixed(2),
            ((origineCounts['Courtier'] / totalRows) * 100).toFixed(2),
            ((origineCounts['Others'] / totalRows) * 100).toFixed(2)
        ]
    };
}

function getTypeCounts(typeCounts, totalRows) {
    return {
        labels: Object.keys(typeCounts),
        data: Object.values(typeCounts),
        percentages: Object.values(typeCounts).map(count => ((count / totalRows) * 100).toFixed(2))
    };
}

function showChart(chartId, data, labels) {
    const ctx = document.getElementById(chartId).getContext('2d');
    if (window.myChart) {
        window.myChart.destroy(); 
    }
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: 'rgba(30, 144, 255, 0.5)',
                borderColor: 'rgba(30, 144, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.getElementById('top10').addEventListener('click', function() {
    if (window.results && window.results.top10Agencies) {
        document.getElementById('resultTop10').innerHTML = `Top 10 Agencies: <br>${window.results.top10Agencies.map(item => `${item.label}: ${item.value} (${item.percentage}%)`).join('<br>')}`;
        showChart('chartTop10', window.results.top10Agencies.map(item => item.value), window.results.top10Agencies.map(item => item.label));
        document.getElementById('chartContainer').style.display = 'flex'; 
        document.getElementById('chartTop10').style.display = 'block'; 
        document.getElementById('chartDistribution').style.display = 'none'; 
        document.getElementById('chartDistributionT').style.display = 'none'; 
    } else {
        alert('Please upload the CSV file first.');
    }
});

document.getElementById('distribution').addEventListener('click', function() {
    if (window.results && window.results.origineCounts) {
        document.getElementById('resultDistribution').innerHTML = `Distribution of claims by channel: <br>${window.results.origineCounts.labels.map((label, index) => `${label}: ${window.results.origineCounts.data[index]} (${window.results.origineCounts.percentages[index]}%)`).join('<br>')}`;
        showChart('chartDistribution', window.results.origineCounts.data, window.results.origineCounts.labels);
        document.getElementById('chartContainer').style.display = 'flex'; 
        document.getElementById('chartTop10').style.display = 'none'; 
        document.getElementById('chartDistribution').style.display = 'block'; 
        document.getElementById('chartDistributionT').style.display = 'none'; 
    } else {
        alert('Please upload the CSV file first.');
    }
});

document.getElementById('distributionT').addEventListener('click', function() {
    if (window.results && window.results.typeCounts) {
        document.getElementById('resultDistributionT').innerHTML = `Distribution of claims by type: <br>${window.results.typeCounts.labels.map((label, index) => `${label}: ${window.results.typeCounts.data[index]} (${window.results.typeCounts.percentages[index]}%)`).join('<br>')}`;
        showChart('chartDistributionT', window.results.typeCounts.data, window.results.typeCounts.labels);
        document.getElementById('chartContainer').style.display = 'flex'; 
        document.getElementById('chartTop10').style.display = 'none'; 
        document.getElementById('chartDistribution').style.display = 'none'; 
        document.getElementById('chartDistributionT').style.display = 'block'; 
    } else {
        alert('Please upload the CSV file first.');
    }
});







document.getElementById('emailFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                processEmailCSVData(results.data);
            }
        });
    } else {
        alert('Please select a file.');
    }
});

document.getElementById('calculateButton').addEventListener('click', function() {
    if (window.emailResults && window.emailResults.weeklyEmails) {
        document.getElementById('resultEmails').innerHTML = `Number of Emails Per Week: <br>${window.emailResults.weeklyEmails.map(week => `${week.label}: ${week.value}`).join('<br>')}`;
    } else {
        alert('Please upload the email CSV file first.');
    }
});

function processEmailCSVData(data) {
    let weeklyEmails = {};

    data.forEach(row => {
        let date = new Date(row['Date']);
        
        if (!isNaN(date)) { 
            let week = getWeekNumber(date);

            if (!weeklyEmails[week]) {
                weeklyEmails[week] = 0;
            }
            weeklyEmails[week]++;
        }
    });

    window.emailResults = {
        weeklyEmails: Object.keys(weeklyEmails).map(week => {
            return { label: `Week ${week}`, value: weeklyEmails[week] };
        })
    };
}

function getWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7; 
    target.setDate(target.getDate() - dayNr + 3); 
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / (86400000 * 7))); 
    return weekNumber;
}
