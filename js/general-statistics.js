let expensesPieChart, incomePieChart, incomeByLabelPieChart, expensesIncomePieChart, incomeByShiftLineChart, yearGainBarChart, yearIncomeExpenseBarChart, yearProfitabilityLineChart
let statMonth, statYear
const statDate = new Date()

const getStatisticsValues = () => {
    const animate = (localStorage.getItem('animations-disabled') || false) ? 'none' : ''
    showLoadAnimation()

    let month = statMonth === 0 ? 0 : statMonth ? statMonth + 2 : null
    const year = statYear
    const pieCharts = document.querySelector('.pie-charts')

    if (month === null) {
        get(`Statistics/general/${loginInfo.companyId}/${year}`).then(response => {
            pieCharts.style.display = ''
            document.querySelector('.bar-charts').style.display = 'none'

            const statValues = document.querySelectorAll('.general-statistics-info .stat-value span:first-child')
            const yearGain = response.reduce((total, current) => total + current.generalNumbers[0], 0)

            statValues.item(0).parentNode.classList = `stat-value gain ${getClassForNumber(yearGain)}`
    
            for (let i = 0; i < statValues.length; i++) {
                const statValue = (response.reduce((total, current) => total + current.generalNumbers[i], 0)).toFixed(0)
                statValues.item(i).textContent = i > 1 ? '-' + statValue : statValue
            }
            
            expensesPieChart.data.labels = ['витрати магазину', 'витрати на товар'].map((l, i) => {
                const current = response.reduce((total, current) => total + current.generalNumbers[i + 4], 0)
                const total = response.reduce((total, current) => total + current.generalNumbers[4], 0) + response.reduce((total, current) => total + current.generalNumbers[5], 0) || 1
                return `${l} (${(current / total * 100).toFixed(2)}%)`
            })
            expensesPieChart.data.datasets[0].data = [
                response.reduce((total, current) => total + current.generalNumbers[4], 0),
                response.reduce((total, current) => total + current.generalNumbers[5], 0)
            ]
            expensesPieChart.update(animate)

            incomePieChart.data.labels = ['продажі на магазині', 'online-замовлення'].map((l, i) => {
                const current = response.reduce((total, current) => total + current.generalNumbers[i + 2], 0)
                const total = response.reduce((total, current) => total + current.generalNumbers[2], 0) + response.reduce((total, current) => total + current.generalNumbers[3], 0) || 1
                return `${l} (${(current / total * 100).toFixed(2)}%)`
            })
            incomePieChart.data.datasets[0].data = [
                response.reduce((total, current) => total + current.generalNumbers[2], 0),
                response.reduce((total, current) => total + current.generalNumbers[3], 0)
            ]
            incomePieChart.update(animate)

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
            incomeByLabelPieChart.update(animate)

            const allExpensesIncome =
                response.reduce((total, current) => total + current.generalNumbers[1], 0) +
                response.reduce((total, current) => total + current.generalNumbers[4], 0) + response.reduce((total, current) => total + current.generalNumbers[5], 0)

            expensesIncomePieChart.data.labels = [
                `всі доходи (${(response.reduce((total, current) => total + current.generalNumbers[1], 0) / (allExpensesIncome || 1) * 100).toFixed(2)}%)`,
                `всі витрати (${((response.reduce((total, current) => total + current.generalNumbers[4], 0) + response.reduce((total, current) => total + current.generalNumbers[5], 0)) / (allExpensesIncome || 1) * 100).toFixed(2)}%)`
            ]
            expensesIncomePieChart.data.datasets[0].data = [
                response.reduce((total, current) => total + current.generalNumbers[1], 0),
                response.reduce((total, current) => total + current.generalNumbers[4], 0) + response.reduce((total, current) => total + current.generalNumbers[5], 0)
            ]
            expensesIncomePieChart.update(animate)

            document.querySelector('.bar-charts:last-child').style.display = 'flex'

            yearGainBarChart.data.datasets[0].label = 'прибуток'
            yearGainBarChart.data.datasets[0].data = response.map(r => r.generalNumbers[0])
            yearGainBarChart.update(animate)

            yearIncomeExpenseBarChart.data.datasets[0].label = 'доходи'
            yearIncomeExpenseBarChart.data.datasets[0].data = response.map(r => r.generalNumbers[1])
            yearIncomeExpenseBarChart.data.datasets[1].label = 'витрати'
            yearIncomeExpenseBarChart.data.datasets[1].data = response.map(r => r.generalNumbers[4] + r.generalNumbers[5])
            yearIncomeExpenseBarChart.update(animate)

            yearProfitabilityLineChart.data.datasets[0].label = 'рентабельність'
            yearProfitabilityLineChart.data.datasets[0].data = response.map(r => {
                const expenses = r.generalNumbers[4] + r.generalNumbers[5]
                return expenses ? r.generalNumbers[1] / expenses : 1
            })
            yearProfitabilityLineChart.update(animate)

            replaceLoadIcons()
        }).catch(() => showMessage('error', getErrorMessage('статистику')))

        return
    }

    if (month) {
        month--
    }

    get(`Statistics/general/${loginInfo.companyId}/${year}/${month || new Date().getMonth() + 1}`).then(response => {
        const statValues = document.querySelectorAll('.general-statistics-info .stat-value span:first-child')

        if (response.generalNumbers.some(n => n)) {
            pieCharts.style.display = ''
            document.querySelector('.bar-charts').style.display = ''
            const generalNumbers = response.generalNumbers
    
            statValues.item(0).parentNode.classList = `stat-value gain ${getClassForNumber(generalNumbers[0])}`
    
            for (let i = 0; i < statValues.length; i++) {
                if (!generalNumbers[i]) {
                    statValues.item(i).textContent = '-'
                    continue
                }
                
                const statValue = (+generalNumbers[i]).toFixed(0)
                statValues.item(i).textContent = i > 1 ? '-' + statValue : statValue
            }

            const totalExpenses = generalNumbers[4] + generalNumbers[5]

            expensesPieChart.data.labels = ['витрати магазину', 'витрати на товар'].map((l, i) => `${l} (${(generalNumbers[i + 4] / (totalExpenses || 1) * 100).toFixed(2)}%)`)
            expensesPieChart.data.datasets[0].data = [generalNumbers[4], generalNumbers[5]]
            expensesPieChart.update(animate)

            incomePieChart.data.labels = ['продажі на магазині', 'online-замовлення'].map((l, i) => `${l} (${(generalNumbers[i + 2] / generalNumbers[1] * 100).toFixed(2)}%)`)
            incomePieChart.data.datasets[0].data = [generalNumbers[2], generalNumbers[3]]
            incomePieChart.update(animate)

            const internetOrdersIncome = response.internetOrdersIncomeByLabel.reduce((total, current) => total + current.totalSum, 0)
    
            incomeByLabelPieChart.data.labels = response.internetOrdersIncomeByLabel.map((o, index) => {
                const totalSum = response.internetOrdersIncomeByLabel[index].totalSum
                return `${(o.labelName || 'Без мітки')} (${totalSum} – ${(totalSum / internetOrdersIncome * 100).toFixed(2)}%)`
            })
            incomeByLabelPieChart.data.datasets[0].data = response.internetOrdersIncomeByLabel.map(o => o.totalSum)
            incomeByLabelPieChart.update(animate)

            const expensesIncome = generalNumbers[1] + totalExpenses

            expensesIncomePieChart.data.labels = [
                `всі доходи (${(generalNumbers[1] / expensesIncome * 100).toFixed(2)}%)`,
                `всі витрати (${(totalExpenses / expensesIncome * 100).toFixed(2)}%)`
            ]
            expensesIncomePieChart.data.datasets[0].data = [generalNumbers[1], totalExpenses]
            expensesIncomePieChart.update(animate)

            const monthNumbers = Array.from({ length: new Date(year, month || new Date().getMonth() + 1, 0).getDate() }, (_, i) => i + 1)
            const monthToIncome = []

            for (const monthNumber of monthNumbers) {
                let found = false

                for (const shiftIncome of response.shiftsIncome) {
                    if (shiftIncome.day === monthNumber) {
                        found = true
                        monthToIncome.push(shiftIncome.sum % 1 === 0 ? shiftIncome.sum : shiftIncome.sum.toFixed(2))
                        break
                    }
                }

                if (!found) {
                    monthToIncome.push(0)
                }
            }

            incomeByShiftLineChart.data.datasets[0].data = monthToIncome
            updateShiftsLineChartLabels(month || new Date().getMonth() + 1, year)
            incomeByShiftLineChart.update(animate)
        } else {
            pieCharts.style.display = 'none'
            document.querySelector('.bar-charts').style.display = 'none'
            statValues.forEach(s => s.textContent = '–')
            statValues.item(0).parentNode.classList = 'stat-value gain'
            showMessage('info', 'Дані за місяць відсутні')
        }

        document.querySelector('.bar-charts:last-child').style.display = ''
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
            barPercentage: window.innerWidth <= 900 ? 0.9 : 0.5,
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
                    family: "'Roboto', 'Helvetica', 'Roboto Mono', monospace"
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
                    family: "'Roboto Mono', monospace, Roboto",
                    weight: 'bold',
                    size: 12
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
                    padding: 25
                }
            }
        },
        responsive: isMobile,
        layout: {
            padding: {
                top: 15,
                bottom: 15,
                right: 20
            }
        },
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    family: "Roboto, Helvetica, 'Roboto Mono', monospace"
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
                    family: "'Roboto Mono', monospace",
                    weight: 'bold',
                    size: 12
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
            data: new Array(size).fill(null),
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
                    family: "Roboto, Helvetica, 'Roboto Mono', monospace"
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
                    family: "'Roboto Mono', monospace",
                    weight: 'bold',
                    size: getPieChartFontSize(39, 26, 16, 13)
                },
                formatter: value => value ? value.toFixed(0) : '',
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

const updateShiftsLineChartLabels = (month, year) => {
    month--
    const monthName = calendarMonthIndexToName[month]
    incomeByShiftLineChart.data.labels = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => (i + 1) + ' ' + monthName)
}

const showGeneralStatisticsInfo = e => {
    main.innerHTML = menuItemsContents['generalstatistics']
    fillSelectedMenuItem(e)

    statMonth = statDate.getMonth()
    statYear = statDate.getFullYear()
    const statTitles = document.querySelectorAll('.stat-switcher-title div')
    statTitles.item(0).textContent = statDate.toLocaleString('uk', { month: 'long' })
    statTitles.item(1).textContent = statYear

    const statSwitcher = document.querySelectorAll('.stat-switcher div')
    statSwitcher.forEach((ss, i) => ss.onpointerup = () => {
        if (ss.classList.contains('active')) {
            return
        }

        statSwitcher.forEach(ss => ss.classList.remove('active'))
        ss.classList.add('active')

        const statTitles = document.querySelectorAll('.stat-switcher-title div')
        statTitles.item(0).style.display = i ? 'none' : ''

        statYear = statDate.getFullYear()
        statMonth = i ? null : statDate.getMonth()
        statTitles.item(0).textContent = statDate.toLocaleString('uk', { month: 'long' })
        statTitles.item(1).textContent = statYear
        getStatisticsValues()
    })

    expensesPieChart = getPieChart('expenses', 'Розподіл витрат', 2)
    incomePieChart = getPieChart('income', 'Розподіл доходів по Продажам', 2)
    expensesIncomePieChart = getPieChart('expenses-income', 'Відношення доходів до витрат', 2)

    incomeByShiftLineChart = getLineChart('income-by-shift', 'Виручка змін за місяць')
    incomeByShiftLineChart.options.layout.padding = { top: 10, right: 20 }
    incomeByShiftLineChart.options.plugins.datalabels.formatter = value => value || null
    incomeByShiftLineChart.update()

    yearGainBarChart = getBarChart('year-gain', 'Прибуток за рік')
    yearGainBarChart.options.plugins.datalabels.color = context => context.dataset.data[context.dataIndex] < 1 ? 'rgb(240, 0, 0)' : 'rgb(34, 139, 34)'

    yearIncomeExpenseBarChart = getBarChart('year-income-expense', 'Доходи та витрати за рік', 2)
    yearIncomeExpenseBarChart.options.plugins.datalabels.font.size = 11
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
        incomeByShiftLineChart,
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
    pieCharts.forEach(c => {
        c.options.plugins.legend.labels.font.size = getPieChartFontSize(28, 24, 14, 13)
        
        if (c.options.plugins.datalabels) {
            c.options.plugins.datalabels.font.size = getPieChartFontSize(42, 28, 18, 15)
        }
    })

    if (window.innerWidth <= 1500) {
        setFontSize(pieCharts, 38)
    }

    if (isMobile) {
        if (window.innerWidth <= 1400) {
            setFontSize(pieCharts, 38)
            setFontSize(barCharts, 28)
            barCharts.forEach(c => {
                c.options.layout.padding = { top: 5 }
                c.options.plugins.title.padding = { bottom: 5 }
            })
        }

        if (window.innerWidth <= 900) {
            setFontSize(pieCharts, 36)
            setFontSize(barCharts, 24)
            barCharts.forEach(c => {
                c.options.layout.padding = { top: 1 }
                c.options.plugins.title.padding = { bottom: 1 }
            })
        }

        if (window.innerWidth <= 500) {
            setFontSize(pieCharts, 20)
            setFontSize(barCharts, 15)
        }
    }

    pieCharts.forEach(c => c.update('none'))
    barCharts.forEach(c => c.update('none'))
}

const previousStatPeriod = () => {
    if (statMonth === null) {
        document.querySelector('.stat-switcher-title div:last-of-type').textContent = --statYear
        getStatisticsValues()
        return
    }

    if (statMonth === 0) {
        statMonth = 11
        statYear--
    } else {
        statMonth--
    }

    const statTitles = document.querySelectorAll('.stat-switcher-title div')
    statTitles.item(0).textContent = new Date(null, statMonth).toLocaleString('uk', { month: 'long' })
    statTitles.item(1).textContent = statYear
    getStatisticsValues()
}

const nextStatPeriod = () => {
    if (statMonth === null) {
        document.querySelector('.stat-switcher-title div:last-of-type').textContent = ++statYear
        getStatisticsValues()
        return
    }

    if (statMonth === 11) {
        statMonth = 0
        statYear++
    } else {
        statMonth++
    }

    const statTitles = document.querySelectorAll('.stat-switcher-title div')
    statTitles.item(0).textContent = new Date(null, statMonth).toLocaleString('uk', { month: 'long' })
    statTitles.item(1).textContent = statYear
    getStatisticsValues()
}
