let expensesPieChart, incomePieChart, incomeByLabelPieChart, expensesIncomePieChart, yearGainBarChart, yearIncomeExpenseBarChart, yearProfitabilityLineChart

const getStatisticsValues = () => {
    showLoadAnimation()

    let month = document.querySelector('.statistics-date-filter .month-filter select').selectedIndex
    const year = document.querySelector('.statistics-date-filter .year-filter select').value

    if (month === 1) {
        get(`Statistics/general/${loginInfo.companyId}/${year}`).then(response => {
            const statValues = document.querySelectorAll('.general-statistics-info .stat-value span:first-child')
            const yearGain = response.reduce((total, current) => total + current.generalNumbers[0], 0)

            statValues.item(0).parentNode.classList = `stat-value ${getClassForNumber(yearGain)}`
    
            for (let i = 0; i < statValues.length; i++) {
                statValues.item(i).textContent = (response.reduce((total, current) => total + current.generalNumbers[i], 0)).toFixed(2)
            }
            
            expensesPieChart.data.datasets[0].data = [
                response.reduce((total, current) => total + current.generalNumbers[4], 0),
                response.reduce((total, current) => total + current.generalNumbers[5], 0)
            ]
            expensesPieChart.update()
    
            incomePieChart.data.datasets[0].data = [
                response.reduce((total, current) => total + current.generalNumbers[2], 0),
                response.reduce((total, current) => total + current.generalNumbers[3], 0)
            ]
            incomePieChart.update()

            const labelsIncome = Array.from(new Set(response.map(r => r.internetOrdersIncomeByLabel.map(io => io.labelName)).flat())).map(l => ({
                name: l,
                income: 0
            }))

            for (const monthData of response) {
                if (!monthData.internetOrdersIncomeByLabel.length) {
                    continue
                }

                for (let i = 0; i < labelsIncome.length; i++) {
                    for (const income of monthData.internetOrdersIncomeByLabel) {
                        if (income.labelName === labelsIncome[i].name) {
                            labelsIncome[i].income += income.totalSum
                            break
                        }
                    }
                }
            }

            incomeByLabelPieChart.data.labels = labelsIncome.map(l => l.name || 'Без мітки')
            incomeByLabelPieChart.data.datasets[0].data = labelsIncome.map(l => l.income)
            incomeByLabelPieChart.update()
    
            expensesIncomePieChart.data.datasets[0].data = [
                response.reduce((total, current) => total + current.generalNumbers[1], 0),
                response.reduce((total, current) => total + current.generalNumbers[4], 0) + response.reduce((total, current) => total + current.generalNumbers[5], 0)
            ]
            expensesIncomePieChart.update()

            document.querySelector('.bar-charts').style.display = 'flex'

            yearGainBarChart.data.datasets[0].label = 'прибуток'
            yearGainBarChart.data.datasets[0].data = response.map(r => r.generalNumbers[0])
            yearGainBarChart.update()

            yearIncomeExpenseBarChart.data.datasets[0].label = 'доходи'
            yearIncomeExpenseBarChart.data.datasets[0].data = response.map(r => r.generalNumbers[1])
            yearIncomeExpenseBarChart.data.datasets[1].label = 'витрати'
            yearIncomeExpenseBarChart.data.datasets[1].data = response.map(r => r.generalNumbers[4] + r.generalNumbers[5])
            yearIncomeExpenseBarChart.update()

            yearProfitabilityLineChart.data.datasets[0].label = 'рентабельність'
            yearProfitabilityLineChart.data.datasets[0].data = response.map(r => {
                const expenses = r.generalNumbers[4] + r.generalNumbers[5]
                return expenses ? r.generalNumbers[1] / expenses : 0
            })
            yearProfitabilityLineChart.update()

            replaceLoadIcons()
        }).catch(() => showMessage('error', getErrorMessage('статистику')))

        return
    }

    if (month) {
        month--
    }

    get(`Statistics/general/${loginInfo.companyId}/${year}/${month || new Date().getMonth() + 1}`).then(response => {
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

        document.querySelector('.bar-charts').style.display = ''
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('статистику')))
}

const getBarChartDatasets = size => {
    const datasets = []

    for (let i = 0; i < size; i++) {
        datasets.push({ borderWidth: 1 })
    }

    return datasets
}

const getBarChart = (selector, title, datasetsAmount = 1) => new Chart(document.querySelector(`#${selector}-bar-chart`), {
    type: 'bar',
    data: {
        labels: ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'],
        datasets: getBarChartDatasets(datasetsAmount)
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    family: "'Roboto', 'Helvetica', monospace",
                    size: 24
                }
            },
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
})

const getLineChart = (selector, title, datasetsAmount = 1) => new Chart(document.querySelector(`#${selector}-line-chart`), {
    type: 'line',
    data: {
        labels: ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'],
        datasets: getBarChartDatasets(datasetsAmount)
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    family: "'Roboto', 'Helvetica', monospace",
                    size: 24
                }
            },
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
})

const getPieChart = (selector, title, ...labels) => new Chart(document.querySelector(`#${selector}-pie-chart`), {
    type: 'pie',
    data: {
        labels,
        datasets: [
        {
            data: new Array(labels.length).fill(0),
            borderWidth: 2
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    family: "'Roboto', 'Helvetica', monospace",
                    size: 16
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

    expensesPieChart = getPieChart('expenses', 'Розподіл витрат', 'витрати магазину', 'витрати на товар')
    incomePieChart = getPieChart('income', 'Розподіл доходів по Продажам', 'продажі', 'інтернет-замовлення')
    expensesIncomePieChart = getPieChart('expenses-income', 'Відношення доходів до витрат', 'всі доходи магазину', 'всі витрати магазину')

    yearGainBarChart = getBarChart('year-gain', 'Прибуток за рік')
    yearIncomeExpenseBarChart = getBarChart('year-income-expense', 'Доходи та витрати за рік', 2)
    yearProfitabilityLineChart = getLineChart('year-profitability', 'Рентабельність')

    get(`Label/${loginInfo.companyId}/ids`).then(response => {
        incomeByLabelPieChart = getPieChart('income-by-label', 'Розподіл доходів по Міткам', ...response)
        getStatisticsValues()
    })
}
