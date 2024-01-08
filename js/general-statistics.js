let expensesPieChart, incomePieChart, incomeByLabelPieChart, expensesIncomePieChart

const getStatisticsValues = month => {
    showLoadAnimation()

    if (month) {
        month--
    }

    get(`Statistics/general/${loginInfo.companyId}/month/${month || new Date().getMonth() + 1}`).then(response => {
        const statValues = document.querySelectorAll('.general-statistics-info .stat-value span:first-child')
        const generalNumbers = response.generalNumbers

        statValues.item(0).parentNode.classList = `stat-value ${getClassForNumber(generalNumbers[0])}`

        for (let i = 0; i < statValues.length; i++) {
            statValues.item(i).textContent = (+generalNumbers[i]).toFixed(2)
        }

        expensesPieChart.data.datasets[0].data = [generalNumbers[4], generalNumbers[5]]
        expensesPieChart.update()

        incomePieChart.data.datasets[0].data = [generalNumbers[2], generalNumbers[3]]
        incomePieChart.update()

        incomeByLabelPieChart.data.labels = response.internetOrdersIncomeByLabel.map(o => o.labelName || 'Без мітки')
        incomeByLabelPieChart.data.datasets[0].data = response.internetOrdersIncomeByLabel.map(o => o.totalSum)
        incomeByLabelPieChart.update()

        expensesIncomePieChart.data.datasets[0].data = [generalNumbers[1], generalNumbers[4] + generalNumbers[5]]
        expensesIncomePieChart.update()

        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('статистику')))
}

const getPieChart = (selector, title, ...labels) => new Chart(document.querySelector(`#${selector}-pie-chart`), {
    type: 'pie',
    data: {
        labels,
        datasets: [
        {
            data: new Array(labels.length || 10).fill(0),
            borderWidth: 2,
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    family: "'Roboto', 'Helvetica', monospace",
                    size: 14
                }
            },
            legend: {
                position: 'bottom',
                align: 'start'
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    footer: tooltip => `${(tooltip[0].parsed * 100 / tooltip[0].dataset.data.reduce((total, current) => total + current, 0)).toFixed(2)}%`
                }
            }
        },
        scales: {
            y: {
                display: false,
            }
        }
    }
})

const showGeneralStatisticsInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['generalstatistics']
    getStatisticsValues(0)

    expensesPieChart = getPieChart('expenses', 'Розподіл витрат', 'витрати магазину', 'витрати на товар')
    incomePieChart = getPieChart('income', 'Розподіл доходів по Продажам', 'продажі', 'інтернет-замовлення')
    incomeByLabelPieChart = getPieChart('income-by-label', 'Розподіл доходів по Міткам',)
    expensesIncomePieChart = getPieChart('expenses-income', 'Відношення доходів до витрат', 'доходи', 'витрати')
}
