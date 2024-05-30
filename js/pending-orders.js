let pendingOrdersTable, pendingOrders, pendingOrderIntervalId

const showPendingOrderInfo = e => {
    main.innerHTML = menuItemsContents['pendingorder']
    fillSelectedMenuItem(e)
    activeMenuItem = 'pendingorder'
    pendingOrdersTable = document.querySelector('.pending-order-table table')

    pendingOrderFilters = {
        date: false,
        status: -1,
        orderNumber: ''
    }

    get(`Order/pending/${loginInfo.companyId}`).then(response => {
        pendingOrders = response

        if (pendingOrders.length) {
            pendingOrdersTable.style.display = 'block'
        }

        pendingOrders.forEach(o => fillPendingOrdersTable(o))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('замовлення')))

    fillDatalistsLabels()

    const pendingTypes = document.querySelectorAll('.pending-type div')

    pendingTypes.forEach((pt, index) => pt.onpointerup = () => {
        if (pt.classList.contains('active')) {
            pt.classList.remove('active')
            pendingOrderFilters.status = -1
            filterPendingOrders()
            return
        }

        pendingTypes.forEach(pt => pt.classList.remove('active'))
        pt.classList.add('active')
        pendingOrderFilters.status = index
        filterPendingOrders()
    })

    const searchPendingOrderCell = document.querySelector('.pending-order-table tr:first-child td:first-child')
    searchPendingOrderCell.onpointerup = () => searchPendingOrder(searchPendingOrderCell)
    pendingOrderIntervalId = updateOrderLeftTime(pendingOrdersTable)

    const pendingOrdersCalendar = new VanillaCalendar('.pending-order-table td:nth-child(3)', {
        input: true,
        settings: {
            lang: 'uk'
        },
        actions: {
            clickDay(_, self) {
                pendingOrdersCalendar.hide()
                pendingOrderFilters.date = self.selectedDates.length ? new Date(self.selectedDates[0]) : false
                filterPendingOrders()
            }
        }
    })

    pendingOrdersCalendar.init()
}

const searchPendingOrder = cell => {
    if (cell.querySelector('span')) {
        cell.textContent = ''
    }

    calculatorNumbers.forEach(n => n.classList.remove('active'))
    enterInput = cell

    const cellRect = cell.getBoundingClientRect()
    calculatorModal.style.display = 'flex'
    calculator.style.top = cellRect.y + cellRect.height + 'px'
    calculator.style.left = cellRect.x + 'px'
    calculator.classList.add('mode-search')

    animateCalculator()
}

let pendingOrderFilters

const filterPendingOrders = () => {
    pendingOrdersTable.querySelectorAll('tr:not(tbody tr)').forEach(tr => tr.remove())
    pendingOrdersTable.querySelector('.table-no-data')?.remove()

    if (pendingOrderFilters.orderNumber) {
        pendingOrdersTable.querySelector('td').textContent = pendingOrderFilters.orderNumber
    }

    animateChange(pendingOrdersTable)
    let filteredPendingOrders = [...pendingOrders]

    if (pendingOrderFilters.date) {
        pendingOrderFilters.date.setHours(0, 0, 0, 0)
        const time = pendingOrderFilters.date.getTime()
        filteredPendingOrders = filteredPendingOrders.filter(o => new Date(o.date).getTime() === time)
    }

    if (pendingOrderFilters.status !== -1) {
        filteredPendingOrders = filteredPendingOrders.filter(o => o.status === pendingOrderFilters.status)
    }

    if (pendingOrderFilters.orderNumber) {
        filteredPendingOrders = filteredPendingOrders.filter(o => {
            const orderIdStr = o.id.toString()
            const orderId = orderIdStr.length > 4 ? orderIdStr.substring(orderIdStr.length - 4) : orderIdStr.toString()
            return orderId.startsWith(pendingOrderFilters.orderNumber)
        })
    }

    if (!filteredPendingOrders.length) {
        pendingOrdersTable.append(createEmptyDataDiv())
        return
    }

    filteredPendingOrders.forEach(o => fillPendingOrdersTable(o))
}

const fillPendingOrdersTable = order => pendingOrdersTable.append(createOrderRow(order, pendingOrdersTable))
