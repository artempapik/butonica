let pendingOrdersTable, pendingOrders, pendingOrderIntervalId

const showPendingOrderInfo = (e, menuContent) => {
    if (activeMenuItem === menuContent) {
        pressSameMenuItem()
        return
    }

    activeMenuItem = menuContent
    main.innerHTML = menuItemsContents[menuContent]
    fillSelectedMenuItem(e)
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
    searchPendingOrderCell.onpointerup = e => searchPendingOrder(searchPendingOrderCell, e)
    pendingOrderIntervalId = updateOrderLeftTime(pendingOrdersTable)
}

const searchPendingOrder = (cell, e) => {
    if (cell.querySelector('span')) {
        cell.textContent = ''
    }

    calculatorNumbers.forEach(n => n.classList.remove('active'))
    enterInput = cell

    calculatorModal.style.display = 'flex'
    const calculatorRect = calculator.getBoundingClientRect()
    calculator.style.top = (e.clientY + calculatorRect.height * .15) + 'px'
    calculator.style.left = (e.clientX + calculatorRect.width * -.15) + 'px'
    calculator.classList.add('mode-search')

    if (e.clientX - calculatorRect.width < 0) {
        calculator.style.left = '0px'
    }
}

let pendingOrderFilters

const filterPendingOrders = () => {
    pendingOrdersTable.innerHTML = pendingOrdersTable.querySelector('tbody').innerHTML
    const cell = pendingOrdersTable.querySelector('td')

    if (pendingOrderFilters.orderNumber) {
        cell.textContent = pendingOrderFilters.orderNumber
    }

    cell.onpointerup = e => searchPendingOrder(cell, e)

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

const getPendingOrdersByDate = e => {
    pendingOrderFilters.date = e.target.value ? new Date(e.target.value) : false
    filterPendingOrders()
}
