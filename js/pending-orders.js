let pendingOrdersTable, pendingOrders, pendingOrderIntervalId
const reminderModal = document.querySelector('.create-reminder-modal')

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

        pendingOrders.forEach(fillPendingOrdersTable)
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
        settings: { lang: 'uk' },
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

    filteredPendingOrders.forEach(fillPendingOrdersTable)
}

const fillPendingOrdersTable = order => pendingOrdersTable.append(createOrderRow(order, pendingOrdersTable))

const createReminderModal = () => {
    reminderModal.querySelector('input').value = ''
    reminderModal.querySelectorAll('.enter-time-value span:first-child').forEach(t => t.textContent = '--:--')
    imageData = ''
    reminderModal.querySelector('img').src = EMPTY_IMAGE_URL
    reminderModal.querySelector('textarea').value = ''

    hideBodyOverflow()
    reminderModal.style.display = 'flex'

    reminderModal.querySelector('button').onpointerup = () => {
        const dateElement = reminderModal.querySelector('.reminder-date-date')

        if (!dateElement.value) {
            showMessage('error', 'Вкажіть дату нагадування')
            return
        }

        const date = new Date(dateElement.value)

        const remTimeElement = reminderModal.querySelector('.reminder-time .reminder-date-time')
        const remTime = remTimeElement.textContent[0] === '-' ? null : remTimeElement.textContent.replaceAll('-', '0')

        if (!isValidTime(remTime)) {
            showMessage('error', 'Вкажіть коректний час нагадування')
            return
        }

        const comment = reminderModal.querySelector('textarea').value.trim()

        if (!comment) {
            showMessage('error', 'Вкажіть коментар до нагадування')
            return
        }

        const payButton = reminderModal.querySelector('button')
        payButton.disabled = true

        const reminder = {
            companyId: loginInfo.companyId,
            employeeId: loginInfo.employeeId,
            imageData,
            date,
            timeFromString: remTime,
            timeTillString: remTime,
            comment,
        }
    
        // COME HEREEEEEE RESPONSE
    
        post('Order/internet', reminder)
            .then(response => {
                hideModalEnableButton(reminderModal, payButton)
                showMessage('success', createSuccessMessage('нагадування'))
                showPendingOrderInfo()
            }).catch(() => {
                hideModalEnableButton(reminderModal, payButton)
                showMessage('error', createErrorMessage('нагадування'))
            })
    }
}
