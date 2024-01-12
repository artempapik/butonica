let expensesPieChart, incomePieChart, incomeByLabelPieChart, expensesIncomePieChart, yearGainBarChart, yearIncomeExpenseBarChart, yearProfitabilityLineChart

const getStatisticsValues = () => {
    showLoadAnimation()

    let month = document.querySelector('.statistics-date-filter .month-filter select').selectedIndex
    const year = document.querySelector('.statistics-date-filter .year-filter select').value

    const pieCharts = document.querySelector('.pie-charts')

    if (month === 1) {
        get(`Statistics/general/${loginInfo.companyId}/${year}`).then(response => {
            pieCharts.style.display = ''

            const statValues = document.querySelectorAll('.general-statistics-info .stat-value span:first-child')
            const yearGain = response.reduce((total, current) => total + current.generalNumbers[0], 0)

            statValues.item(0).parentNode.classList = `stat-value gain ${getClassForNumber(yearGain)}`
    
            for (let i = 0; i < statValues.length; i++) {
                statValues.item(i).textContent = (response.reduce((total, current) => total + current.generalNumbers[i], 0)).toFixed(0)
            }
            
            expensesPieChart.data.labels = ['продажі на магазині', 'інтернет-замовлення'].map((l, i) => {
                const current = response.reduce((total, current) => total + current.generalNumbers[i + 4], 0)
                const total = response.reduce((total, current) => total + current.generalNumbers[4], 0) + response.reduce((total, current) => total + current.generalNumbers[5], 0)
                return `${l} (${(current / total * 100).toFixed(2)}%)`
            })
            expensesPieChart.data.datasets[0].data = [
                response.reduce((total, current) => total + current.generalNumbers[4], 0),
                response.reduce((total, current) => total + current.generalNumbers[5], 0)
            ]
            expensesPieChart.update()

            incomePieChart.data.labels = ['продажі на магазині', 'інтернет-замовлення'].map((l, i) => {
                const current = response.reduce((total, current) => total + current.generalNumbers[i + 2], 0)
                const total = response.reduce((total, current) => total + current.generalNumbers[2], 0) + response.reduce((total, current) => total + current.generalNumbers[3], 0)
                return `${l} (${(current / total * 100).toFixed(2)}%)`
            })
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

            const labelsIncomeTotal = labelsIncome.reduce((total, current) => total + current.income, 0)

            incomeByLabelPieChart.data.labels = labelsIncome.map(l => `${(l.name || 'Без мітки')} (${l.income} – ${(l.income / labelsIncomeTotal * 100).toFixed(2)}%)`)
            incomeByLabelPieChart.data.datasets[0].data = labelsIncome.map(l => l.income)
            incomeByLabelPieChart.update()

            const allExpensesIncome =
                response.reduce((total, current) => total + current.generalNumbers[1], 0) +
                response.reduce((total, current) => total + current.generalNumbers[4], 0) + response.reduce((total, current) => total + current.generalNumbers[5], 0)

            expensesIncomePieChart.data.labels = [
                `всі доходи (${(response.reduce((total, current) => total + current.generalNumbers[1], 0) / allExpensesIncome * 100).toFixed(2)}%)`,
                `всі витрати (${((response.reduce((total, current) => total + current.generalNumbers[4], 0) + response.reduce((total, current) => total + current.generalNumbers[5], 0)) / allExpensesIncome * 100).toFixed(2)}%)`
            ]
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
                return expenses ? r.generalNumbers[1] / expenses : 1
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

        if (response.generalNumbers.every(n => n)) {
            pieCharts.style.display = ''
            const generalNumbers = response.generalNumbers
    
            statValues.item(0).parentNode.classList = `stat-value gain ${getClassForNumber(generalNumbers[0])}`
    
            for (let i = 0; i < statValues.length; i++) {
                statValues.item(i).textContent = (+generalNumbers[i]).toFixed(0)
            }

            const totalExpenses = generalNumbers[4] + generalNumbers[5]

            expensesPieChart.data.labels = ['витрати магазину', 'витрати на товар'].map((l, i) => `${l} (${(generalNumbers[i + 4] / totalExpenses * 100).toFixed(2)}%)`)
            expensesPieChart.data.datasets[0].data = [generalNumbers[4], generalNumbers[5]]
            expensesPieChart.update()

            incomePieChart.data.labels = ['продажі на магазині', 'інтернет-замовлення'].map((l, i) => `${l} (${(generalNumbers[i + 2] / generalNumbers[1] * 100).toFixed(2)}%)`)
            incomePieChart.data.datasets[0].data = [generalNumbers[2], generalNumbers[3]]
            incomePieChart.update()

            const internetOrdersIncome = response.internetOrdersIncomeByLabel.reduce((total, current) => total + current.totalSum, 0)
    
            incomeByLabelPieChart.data.labels = response.internetOrdersIncomeByLabel.map((o, index) => {
                const totalSum = response.internetOrdersIncomeByLabel[index].totalSum
                return `${(o.labelName || 'Без мітки')} (${totalSum} – ${(totalSum / internetOrdersIncome * 100).toFixed(2)}%)`
            })
            incomeByLabelPieChart.data.datasets[0].data = response.internetOrdersIncomeByLabel.map(o => o.totalSum)
            incomeByLabelPieChart.update()

            const expensesIncome = generalNumbers[1] + totalExpenses

            expensesIncomePieChart.data.labels = [
                `всі доходи (${(generalNumbers[1] / expensesIncome * 100).toFixed(2)}%)`,
                `всі витрати (${(totalExpenses / expensesIncome * 100).toFixed(2)}%)`
            ]
            expensesIncomePieChart.data.datasets[0].data = [generalNumbers[1], totalExpenses]
            expensesIncomePieChart.update()
        } else {
            pieCharts.style.display = 'none'
            statValues.forEach(s => s.textContent = '–')
            statValues.item(0).parentNode.classList = 'stat-value gain'
            showMessage('info', 'Дані за місяць відсутні')
        }

        document.querySelector('.bar-charts').style.display = ''
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('статистику')))
}

const getChartDatasets = (size, isLine = false) => {
    const colors = ['26, 83, 255', '90, 212, 90']
    const datasets = []

    for (let i = 0; i < size; i++) {
        datasets.push({
            borderWidth: 2,
            borderRadius: window.innerWidth <= 900 ? 2 : 4,
            barPercentage: window.innerWidth <= 900 ? 0.9 : 0.6,
            backgroundColor: `rgba(${colors[i]}, .45)`,
            borderColor: isLine ? 'rgba(68, 33, 175, .7)' : `rgb(${colors[i]})`
        })
    }

    return datasets
}

const getBarChart = (selector, title, datasetsAmount = 1) => new Chart(document.querySelector(`#${selector}-bar-chart`), {
    type: 'bar',
    data: {
        labels: ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'],
        datasets: getChartDatasets(datasetsAmount)
    },
    options: {
        events: null,
        responsive: isMobile,
        layout: {
            padding: {
                top: 15,
                bottom: 15,
                left: 20,
                right: 20
            }
        },
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    family: "'Roboto', 'Helvetica', monospace"
                },
                padding: {
                    bottom: 20
                }
            },
            tooltip: {
                enabled: false
            },
            legend: {
                display: false
            },
            datalabels: {
                anchor: 'end',
                align: 'top',
                font: {
                    family: "monospace, 'SF Mono', Roboto",
                    weight: 'bold',
                    size: 14
                },
                formatter: value => value ? value.toFixed(0) : ''
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grace: '10%',
                ticks: {
                    padding: 15
                }
            }
        }
    }
})

const getLineChart = (selector, title, datasetsAmount = 1) => new Chart(document.querySelector(`#${selector}-line-chart`), {
    type: 'line',
    data: {
        labels: ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'],
        datasets: getChartDatasets(datasetsAmount, true)
    },
    options: {
        events: null,
        scales: {
            y: {
                ticks: {
                    padding: 15
                }
            }
        },
        responsive: isMobile,
        layout: {
            padding: {
                top: 15,
                bottom: 15,
                left: 20,
                right: 20
            }
        },
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    family: "Roboto, Helvetica, monospace"
                },
                padding: {
                    bottom: 25
                }
            },
            tooltip: {
                enabled: false
            },
            legend: {
                display: false
            },
            datalabels: {
                anchor: 'end',
                align: 'top',
                font: {
                    family: "monospace, 'SF Mono', Roboto",
                    weight: 'bold',
                    size: 14
                },
                formatter: value => !value || value === 1 ? '' : (value * 100).toFixed(1) + '%',
                color: context => context.dataset.data[context.dataIndex] < 1 ? 'rgb(240, 0, 0)' : 'rgb(34, 139, 34)'
            }
        }
    }
})

const getPieChartFontSize = (s1, s2, s3, s4) => {
    if ((!isMobile && window.innerWidth <= 1500) || (isMobile && window.innerWidth >= 900 && window.innerWidth <= 1500)) {
        return s1
    }

    if (isMobile) {
        if (window.innerWidth > 500 && window.innerWidth < 900) {
            return s2
        }

        if (window.innerWidth <= 500) {
            return s3
        }
    }

    return s4
}

const getPieChart = (selector, title, size) => new Chart(document.querySelector(`#${selector}-pie-chart`), {
    type: 'pie',
    data: {
        datasets: [
        {
            data: new Array(size).fill(0),
            borderWidth: 3,
            backgroundColor: ['#ffb55a', '#7eb0d5', '#b2e061', '#bd7ebe']
        }]
    },
    options: {
        events: null,
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    family: "Roboto, Helvetica, monospace, 'SF Mono'"
                }
            },
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: getPieChartFontSize(28, 24, 14, 13)
                    }
                }
            },
            tooltip: {
                enabled: false
            },
            datalabels: {
                font: {
                    family: "monospace, 'SF Mono', Roboto",
                    weight: 'bold',
                    size: getPieChartFontSize(42, 28, 18, 15)
                },
                formatter: value => value.toFixed(0),
                color: context => context.dataIndex ? 'rgb(250, 250, 250)' : 'rgb(50, 50, 50)'
            }
        },
        scales: {
            y: {
                display: false
            }
        }
    }
})

const showGeneralStatisticsInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['generalstatistics']

    expensesPieChart = getPieChart('expenses', 'Розподіл витрат', 2)
    incomePieChart = getPieChart('income', 'Розподіл доходів по Продажам', 2)
    expensesIncomePieChart = getPieChart('expenses-income', 'Відношення доходів до витрат', 2)

    yearGainBarChart = getBarChart('year-gain', 'Прибуток за рік')
    yearGainBarChart.options.plugins.datalabels.color = context => context.dataset.data[context.dataIndex] < 1 ? 'rgb(240, 0, 0)' : 'rgb(34, 139, 34)'

    yearIncomeExpenseBarChart = getBarChart('year-income-expense', 'Доходи та витрати за рік', 2)
    yearIncomeExpenseBarChart.options.plugins.datalabels.font.size = 12
    yearIncomeExpenseBarChart.options.plugins.legend.display = true

    yearProfitabilityLineChart = getLineChart('year-profitability', 'Рентабельність')

    get(`Label/${loginInfo.companyId}/ids`).then(response => {
        incomeByLabelPieChart = getPieChart('income-by-label', 'Розподіл доходів по Міткам', response.length)
        incomeByLabelPieChart.options.plugins.datalabels = null
        updateChartsFontSize()
        getStatisticsValues()
    })
}

const updateChartsFontSize = () => {
    const pieCharts = [
        expensesPieChart,
        incomePieChart,
        expensesIncomePieChart,
        incomeByLabelPieChart
    ]

    const barCharts = [
        yearGainBarChart,
        yearIncomeExpenseBarChart,
        yearProfitabilityLineChart
    ]

    if (window.innerWidth <= 900) {
        barCharts.forEach(c => {
            c.options.plugins.datalabels = null
            c.options.scales.y.ticks.padding = 0
        })
    }

    const setFontSize = (charts, size) => charts.forEach(c => c.options.plugins.title.font.size = size)

    setFontSize(pieCharts, 18)
    setFontSize(barCharts, 24)

    if (window.innerWidth <= 1500) {
        setFontSize(pieCharts, 38)
    }

    if (isMobile) {
        if (window.innerWidth <= 1400) {
            setFontSize(pieCharts, 38)
            setFontSize(barCharts, 28)
            barCharts.forEach(c => {
                c.options.layout.padding = { top: 5 }
                c.options.plugins.title.padding = { bottom: 10 }
            })
        }

        if (window.innerWidth <= 900) {
            setFontSize(pieCharts, 36)
            setFontSize(barCharts, 24)
        }

        if (window.innerWidth <= 500) {
            setFontSize(pieCharts, 20)
            setFontSize(barCharts, 20)
        }
    }

    pieCharts.forEach(c => c.update())
    barCharts.forEach(c => c.update())
}
