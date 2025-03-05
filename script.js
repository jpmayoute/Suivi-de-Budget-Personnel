document.getElementById('budget-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Récupération des valeurs du formulaire
    const type = document.getElementById('type').value;
    const montant = parseFloat(document.getElementById('montant').value);
    const categorie = document.getElementById('categorie').value;
    
    // Création de la transaction
    const transaction = {
        type,
        montant,
        categorie
    };

    // Ajout de la transaction à la liste
    const transactionsList = document.getElementById('transactions-list');
    const transactionItem = document.createElement('li');
    transactionItem.textContent = `${categorie} : ${montant} € (${type})`;
    transactionsList.appendChild(transactionItem);

    // Mise à jour des totaux
    updateBudget(type, montant);

    // Réinitialisation du formulaire
    document.getElementById('budget-form').reset();
});

let revenusTotaux = 0;
let depensesTotales = 0;
let transactions = []; // On va stocker toutes les transactions ici

let chart; // Variable pour stocker notre graphique

// Vérifier si des transactions sont déjà sauvegardées
if (localStorage.getItem('transactions')) {
    transactions = JSON.parse(localStorage.getItem('transactions'));
    // Remettre à jour les totaux et le graphique
    transactions.forEach(transaction => {
        updateBudget(transaction.type, transaction.montant, transaction.date);
    });
}


// Fonction pour créer ou mettre à jour le graphique
function updateChart() {
    if (!chart) {
        // Si le graphique n'a pas encore été créé, on le crée
        const ctx = document.getElementById('budgetChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Revenus', 'Dépenses'],
                datasets: [{
                    data: [revenusTotaux, depensesTotales],
                    backgroundColor: ['#4caf50', '#f44336'],
                    borderColor: ['#388e3c', '#c62828'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.raw.toFixed(2) + ' €';
                            }
                        }
                    }
                }
            }
        });
    } else {
        // Si le graphique existe déjà, on le met à jour avec les nouvelles données
        chart.data.datasets[0].data = [revenusTotaux, depensesTotales];
        chart.update();
    }
}

// Fonction pour vérifier si une date appartient à une période spécifique
function isWithinPeriod(transactionDate, period) {
    const date = new Date(transactionDate);
    const today = new Date();

    switch (period) {
        case 'today':
            return date.toDateString() === today.toDateString();
        case 'this-week':
            const firstDayOfWeek = today.getDate() - today.getDay();
            const lastDayOfWeek = firstDayOfWeek + 6;
            const startOfWeek = new Date(today.setDate(firstDayOfWeek));
            const endOfWeek = new Date(today.setDate(lastDayOfWeek));
            return date >= startOfWeek && date <= endOfWeek;
        case 'this-month':
            return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        case 'last-month':
            const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
            return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
        default:
            return true; // Pour "all", on affiche toutes les transactions
    }
}

// Fonction qui met à jour les totaux et sauvegarde les transactions
function updateBudget(type, montant, date) {
    if (type === 'revenu') {
        revenusTotaux += montant;
    } else if (type === 'dépense') {
        depensesTotales += montant;
    }

    const solde = revenusTotaux - depensesTotales;

    // Mise à jour des éléments HTML
    document.getElementById('revenus').textContent = revenusTotaux.toFixed(2);
    document.getElementById('depenses').textContent = depensesTotales.toFixed(2);
    document.getElementById('solde').textContent = solde.toFixed(2);

    // Sauvegarder les transactions dans le localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Mise à jour du graphique
    updateChart();
}

// Fonction pour ajouter une transaction
document.getElementById('budget-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Récupération des valeurs du formulaire
    const type = document.getElementById('type').value;
    const montant = parseFloat(document.getElementById('montant').value);
    const categorie = document.getElementById('categorie').value;
    const date = document.getElementById('date').value; // Date de la transaction

    const transaction = {
        type,
        montant,
        categorie,
        date
    };

    // Ajout de la transaction à la liste des transactions
    transactions.push(transaction);

    // Mettre à jour les totaux et afficher les transactions
    updateBudget(type, montant, date);

    // Réinitialisation du formulaire
    document.getElementById('budget-form').reset();
});

// Fonction pour appliquer un filtre
document.getElementById('filter-date').addEventListener('change', function() {
    const selectedPeriod = this.value;
    const filteredTransactions = transactions.filter(transaction => {
        return isWithinPeriod(transaction.date, selectedPeriod);
    });

    // Réinitialiser les totaux
    revenusTotaux = 0;
    depensesTotales = 0;
    
    // Réinitialiser l'affichage des transactions
    const transactionsList = document.getElementById('transactions-list');
    transactionsList.innerHTML = '';

    // Afficher les transactions filtrées
    filteredTransactions.forEach(transaction => {
        const transactionItem = document.createElement('li');
        transactionItem.textContent = `${transaction.categorie} : ${transaction.montant} € (${transaction.type})`;
        transactionsList.appendChild(transactionItem);
        
        // Mettre à jour les totaux
        updateBudget(transaction.type, transaction.montant, transaction.date);
    });
});



