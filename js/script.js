const expenseForm = document.getElementById("expenseForm");
const itemName = document.getElementById("itemName");
const amount = document.getElementById("amount");
const category = document.getElementById("category");

const date = document.getElementById("date");

const transactionList = document.getElementById("transactionList");
const balance = document.getElementById("balance");
const searchInput = document.getElementById("searchInput");

const totalTransaction=document.getElementById("totalTransaction");
const totalCategory=document.getElementById("totalCategory");

let transactions = [];
let expenseChart = null;

function updateStats(){

totalTransaction.textContent=transactions.length;

const categories=new Set(
transactions.map(t=>t.category)
);

totalCategory.textContent=categories.size;

}

loadTransactions();

expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const item = itemName.value.trim();
    const price = Number(amount.value);
    const categoryValue = category.value;

    if (item.length < 2) {
        alert("Item name must be at least 2 characters.");
        return;
    }

    if (price <= 0) {
        alert("Amount must be greater than 0.");
        return;
    }

    const transaction = {
        item: item,
        amount: price,
        category: categoryValue,
        date: date.value
    };

    transactions.push(transaction);

    saveTransactions();
    displayTransactions();

    expenseForm.reset();
});

function displayTransactions() {

    transactionList.innerHTML = "";

    const keyword = searchInput.value.toLowerCase();
    const filteredTransactions = transactions.filter(function(transaction){

        return transaction.item.toLowerCase().includes(keyword);

    });

    if(filteredTransactions.length===0){

    transactionList.innerHTML =
    `
    <div class="empty-state">
    🌸<br><br>
    No transactions found.
    </div>
    `;

        updateBalance();
        updateChart();

        return;

    }

    filteredTransactions.forEach(function(transaction,index){

        const originalIndex=transactions.indexOf(transaction);

        const li=document.createElement("li");

        li.className="transaction-item";
        li.innerHTML=`

            <div>

                <strong>${transaction.item}</strong><br>

                Rp ${transaction.amount.toLocaleString("id-ID")}<br>

                <small>
                ${transaction.category}
                <br>
                📅 ${transaction.date}
                </small>

            </div>

            <button
            class="delete-btn"
            onclick="deleteTransaction(${originalIndex})">

            Delete

            </button>

        `;

        transactionList.appendChild(li);
    });

    updateBalance();
    updateChart();

}

updateStats();

function updateBalance() {

    let total = 0;

    transactions.forEach(function (transaction) {

        total += transaction.amount;

    });

    balance.textContent = "Rp " + total.toLocaleString("id-ID");

}

function deleteTransaction(index) {

    const confirmDelete = confirm("Delete this transaction?");

    if (!confirmDelete) {
        return;
    }

    transactions.splice(index, 1);

    saveTransactions();
    displayTransactions();

}

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}

function loadTransactions() {

    const data = localStorage.getItem("transactions");

    if (data) {

        transactions = JSON.parse(data);

    }

    displayTransactions();

}

function updateChart() {

    const categoryTotals = {};

    transactions.forEach(function (transaction) {

        if (categoryTotals[transaction.category]) {
            categoryTotals[transaction.category] += transaction.amount;
        } else {
            categoryTotals[transaction.category] = transaction.amount;
        }

    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    if (expenseChart) {
        expenseChart.destroy();
    }

    const ctx = document.getElementById("expenseChart");

    expenseChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [

                "#F8BBD0",
                "#A8D5BA",
                "#FFD6A5",
                "#BDE0FE",
                "#CDB4DB",
                "#FFC8DD",
                "#D8F3DC"

                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });

}

const clearAllButton = document.getElementById("clearAll");

if (clearAllButton) {

    clearAllButton.addEventListener("click", function () {

        const confirmClear = confirm("Delete all transactions?");

        if (!confirmClear) {
            return;
        }

        transactions = [];

        saveTransactions();
        displayTransactions();

    });

    searchInput.addEventListener("keyup",function(){

        displayTransactions();

    });

    const darkModeBtn = document.getElementById("darkModeBtn");

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }

    darkModeBtn.addEventListener("click", function () {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }

    });

    const exportButton = document.getElementById("exportCSV");

exportButton.addEventListener("click", function () {

    if (transactions.length === 0) {

        alert("No data to export.");

        return;

    }

    let csv = "Item,Amount,Category\n";

    transactions.forEach(function (transaction) {

        csv += `${transaction.item},${transaction.amount},${transaction.category}\n`;

    });

    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "transactions.csv";

    a.click();

    URL.revokeObjectURL(url);

});

}