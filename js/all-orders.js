let allOrdersTable, orderProducts, internetProductsOptions, internetFlavorsOptions

const orderInfoModal = document.querySelector('.order-info-modal')
const internetOrderModal = document.querySelector('.create-internet-order-modal')
const internetTotalSumElement = internetOrderModal.querySelector('.sale-order-total-sum input')

const fillDatalists = () => {
    get(`Product/ids-names-costs/${loginInfo.companyId}`).then(response => {
        orderProducts = response

        const internetProductsList = internetOrderModal.querySelector('#internet-product')
        internetProductsList.innerHTML = ''

        for (const product of response) {
            const option = document.createElement('option')
            option.value = product.name
            option.dataset.id = product.id
            option.dataset.cost = product.cost
            internetProductsList.append(option)
        }

        internetProductsOptions = internetOrderModal.querySelectorAll(`#internet-product option`)
    })

    get(`Flavor/ids-names-costs/${loginInfo.companyId}`).then(response => {
        const internetFlavorsList = internetOrderModal.querySelector('#internet-flavor')
        internetFlavorsList.innerHTML = ''

        for (const flavor of response) {
            const option = document.createElement('option')
            option.value = getFlavorName(flavor)
            option.dataset.id = flavor.id
            option.dataset.cost = flavor.totalSum
            internetFlavorsList.append(option)
        }

        internetFlavorsOptions = internetOrderModal.querySelectorAll(`#internet-flavor option`)
    })
}

const showAllOrderInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['allorder']
    allOrdersTable = document.querySelector('.all-order-table table')

    get(`Order/${loginInfo.companyId}`).then(response => {
        if (response.length) {
            allOrdersTable.style.display = 'block'
        }

        response.forEach(o => fillAllOrdersTable(o))
        document.querySelector('#loader').remove()
    }).catch(() => showMessage('error', getErrorMessage(ORDER)))

    fillDatalists()
}

const calculateInternetOrderTotalSum = () => {
    let totalSum = 0

    for (const td of internetOrderModal.querySelectorAll('.sale-order-flavors tr:not(:first-child) td:nth-child(2)')) {
        totalSum += +td.textContent
    }

    for (const td of internetOrderModal.querySelectorAll('.sale-order-products tr:not(:first-child) td:nth-child(4)')) {
        totalSum += +td.querySelector('span').textContent
    }

    internetTotalSumElement.value = totalSum.toFixed(2)
}

const statusTypeToText = {
    0: 'Прийняте в обробку',
    1: 'Зібране флористом',
    2: 'Доставлене замовнику'
}

const statusTypeToBackground = {
    0: '0, 119, 204',
    1: '48, 133, 108',
    2: '230, 80, 25'
}

const createOrderRow = (order, table) => {
    const actionsColumn = document.createElement('td')
    actionsColumn.classList = 'order-actions'

    const tr = document.createElement('tr')
    tr.onpointerup = e => {
        if (e.target.tagName.toLowerCase() === 'span' && e.target.className) {
            return
        }

        hideBodyOverflow()

        get(`Order/order/${order.id}`).then(response => {
            const fillClient = (selector, text) => {
                const clientBlock = orderInfoModal.querySelector('.' + selector)
                clientBlock.querySelector('.name span:last-child').textContent = text
                const phonesBlock = clientBlock.querySelector('.phones')
                phonesBlock.innerHTML = ''

                if (response[selector + 'Phone']) {
                    for (const phone of response[selector + 'Phone'].split('\n')) {
                        const callIcon = document.createElement('span')
                        callIcon.classList = 'material-symbols-outlined'
                        callIcon.textContent = 'call'
        
                        const phoneText = document.createElement('span')
                        phoneText.textContent = formatPhoneNumber(phone)
        
                        const phoneBlock = document.createElement('div')
                        phoneBlock.classList = 'phone'
                        phoneBlock.append(callIcon, phoneText)
                        phonesBlock.append(phoneBlock)
                    }
                }
            }

            const orderNumberDate = orderInfoModal.querySelector('.order-number-date')
            orderNumberDate.querySelector('.order-number span').textContent = order.id
            orderNumberDate.querySelector('.order-date input').value = getDate(response.date)

            const orderTime = orderInfoModal.querySelectorAll('.order-time input')
            orderTime.item(0).value = order.timeFrom
            orderTime.item(1).value = order.timeTill

            imageData = ''
            orderInfoModal.querySelector('img').src = response.imageData ? response.imageData : EMPTY_IMAGE_URL

            const orderStatuses = orderInfoModal.querySelectorAll('.status')
            orderStatuses.forEach(os => os.classList.remove('active-order-status'))
            orderStatuses.item(order.status).classList.add('active-order-status')

            orderStatuses.forEach(orderStatus => orderStatus.onpointerup = () => {
                orderStatuses.forEach(os => os.classList.remove('active-order-status'))
                orderStatus.classList.add('active-order-status')
            })

            const surchargeBlock = orderInfoModal.querySelector('.surcharge-block')
            if (response.surcharge) {
                const surcharge = response.surcharge
                surchargeBlock.querySelector('.surcharge span').textContent = surcharge.toFixed(2)

                const performSurcharge = (isCash, cashText) => get(`Shift/last-any/${loginInfo.companyId}`)
                    .then(response => {
                        if (!response) {
                            showMessage('error', 'Відкрийте зміну, щоб доплатити')
                            return
                        }

                        const orderSurcharge = {
                            orderId: order.id,
                            shiftId: response,
                            surcharge,
                            isCash
                        }

                        if (confirm(`Бажаєте доплатити ${cashText} ${surcharge.toFixed(2)} грн за замовлення №${order.id}?`)) {
                            put(`Order${order.isInternet ? '/internet' : ''}/surcharge`, orderSurcharge).then(() => {
                                surchargeBlock.style.display = 'none'
                                showMessage('info', `Замовлення №${order.id} доплачено`)
                            }).catch(() => showMessage('error', `${ERROR_TEXT} доплатити`))
                        }
                    })
                    .catch(() => getErrorMessage('зміну'))

                surchargeBlock.querySelector('.surcharge-button').onpointerup = () => performSurcharge(true, 'готівкою')
                surchargeBlock.querySelector('.surcharge-button:last-child').onpointerup = () => performSurcharge(false, 'терміналом')
                surchargeBlock.style.display = ''
            } else {
                surchargeBlock.style.display = 'none'
            }
            
            fillClient('customer', order.customer)

            const setDisplayForPickupOrder = display => {
                orderInfoModal.querySelector('.recipient').style.display = display
                orderInfoModal.querySelector('.address').style.display = display
            }

            if (order.isPickup) {
                setDisplayForPickupOrder('none')
            } else {
                setDisplayForPickupOrder('')
                fillClient('recipient', response.recipient)
            }

            orderInfoModal.querySelector('.address textarea').value = response.address
            orderInfoModal.querySelector('.comment textarea').value = response.comment

            const productsTable = orderInfoModal.querySelector('.order-products table')
            productsTable.innerHTML = productsTable.querySelector('tbody').innerHTML

            for (const product of response.products) {
                const productSelect = document.createElement('select')

                for (const product of orderProducts) {
                    const option = document.createElement('option')
                    option.text = product.name
                    option.dataset.id = product.id
                    productSelect.append(option)
                }

                for (const option of productSelect.options) {
                    if (+option.dataset.id === product.productId) {
                        option.selected = true
                        break
                    }
                }

                const productSelectTd = document.createElement('td')
                productSelectTd.append(productSelect)

                const amount = document.createElement('input')
                amount.type = 'number'
                amount.min = '0'
                amount.max = '1000'
                amount.value = product.amount
    
                const amountTd = document.createElement('td')
                amountTd.append(amount)

                const removeIcon = document.createElement('span')
                removeIcon.classList = 'material-symbols-outlined'
                removeIcon.textContent = 'remove_circle_outline'

                const removeIconTd = document.createElement('td')
                removeIconTd.classList = 'remove-order-product'
                removeIconTd.append(removeIcon)

                const tr = document.createElement('tr')
                tr.append(
                    productSelectTd,
                    amountTd,
                    createTd(product.sellingCost.toFixed(2)),
                    createTd(product.sum.toFixed(2)),
                    removeIconTd
                )
                productsTable.append(tr)
            }

            orderInfoModal.querySelector('.total-sum span:last-child').textContent = response.totalSum.toFixed(2) + ' грн'

            const saveOrderButton = orderInfoModal.querySelector('button:not(.one-more-product)')
            if (order.status === 2) {
                saveOrderButton.style.display = 'none'
            } else {
                saveOrderButton.style.display = ''
                saveOrderButton.onpointerup = () => editOrderStatus(order, !!response.surcharge, tr, table)
            }

            orderInfoModal.style.display = 'flex'
            orderInfoModal.querySelector('.order-info-modal-content').scroll(0, 0)
        }).catch(() => showMessage('error', getErrorMessage(ORDER)))
    }

    if (loginInfo.title < 2 || loginInfo.employeeId === order.employeeId) {
        const cancelAction = createDeleteSpan('order')
        cancelAction.textContent = 'cancel'
        actionsColumn.append(cancelAction)

        cancelAction.onpointerup = () => {
            if (confirm(`Ви дійсно бажаєте скасувати замовлення №${order.id}?`)) {
                delete order.timeFrom
                delete order.timeTill
                
                remove(`Order${order.isInternet ? '/internet' : ''}`, order).then(() => {
                    showMessage('info', 'Замовлення скасовано')
                    table.removeChild(tr)
    
                    if (table.children.length === 1) {
                        table.style.display = ''
                    }
                }).catch(() => showMessage('error', `${ERROR_TEXT} скасувати ${ORDER}`))
            }
        }
    }

    const formatOrderDate = (date, from, till) => {
        let orderDate = formatDate(date, false)

        if (!from && !till) {
            return orderDate
        }

        if (from && till) {
            return `${orderDate}, з ${from} до ${till}`
        }

        orderDate += ', '
        return from ? orderDate + 'з ' + from : orderDate + 'до ' + till
    }

    const span = document.createElement('span')
    span.textContent = statusTypeToText[order.status]
    span.style.background = `rgb(${statusTypeToBackground[order.status]})`

    const statusTd = document.createElement('td')
    statusTd.append(span)

    const labelsTd = document.createElement('td')

    for (const label of order.labels) {
        const span = document.createElement('span')
        span.textContent = label.name
        span.style.background = `rgb(${labelIndexToBackground[label.color]})`
        span.style.color = `rgb(${labelIndexToColor[label.color]})`
        labelsTd.append(span)
    }

    const convertMsToTime = milliseconds => {
        let seconds = Math.floor(milliseconds / 1000)
        let minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)

        seconds %= 60

        if (seconds >= 30) {
            minutes++
        }

        minutes %= 60
        const days = Math.floor(hours / 24)

        if (days < 0 || hours < 0) {
            return {
                text: '!',
                background: 'rgb(255, 0, 0)'
            }
        }

        if (days) {
            return { text: days + 'д' }
        }

        if (hours) {
            return {
                text: hours + 'г',
                background: 'rgb(48, 133, 108)'
            }
        }

        return {
            text: minutes + 'хв',
            background: 'rgb(230, 80, 25)'
        }
    }

    const timeLeft = order.status === 2 ?
        { text: '–' } :
        convertMsToTime(new Date(order.date.replace('00', order.timeFrom.substring(0, 2)).replace('00', order.timeFrom.substring(3))) - new Date())

    const timeLeftTd = createTd(timeLeft.text)

    if ('background' in timeLeft) {
        timeLeftTd.style.background = timeLeft.background
        timeLeftTd.style.color = 'rgb(240, 240, 240)'
        timeLeftTd.style.fontWeight = 'bold'
    }

    tr.append(
        createTd(order.id),
        timeLeftTd,
        createTd(formatOrderDate(order.date, order.timeFrom, order.timeTill)),
        createTd(order.customer),
        createTd(order.isPickup ? 'Самовивіз' : 'Доставка'),
        statusTd,
        labelsTd,
        actionsColumn
    )
    return tr
}

const fillAllOrdersTable = order => allOrdersTable.append(createOrderRow(order, allOrdersTable))

const editOrderStatus = (order, shouldSurcharge, oldRow, table) => {
    const dateElement = orderInfoModal.querySelector('.order-date input')

    if (!dateElement.value) {
        showMessage('error', 'Введіть дату замовлення')
        return
    }

    const date = new Date(dateElement.value)

    const times = orderInfoModal.querySelectorAll('.order-time input')
    const timeFromElement = times.item(0)
    const timeTillElement = times.item(1)

    const orderStatuses = orderInfoModal.querySelectorAll('.status')
    let activeOrderStatus = 0

    for (const orderStatus of orderStatuses) {
        if (orderStatus.classList.contains('active-order-status')) {
            break
        }

        activeOrderStatus++
    }

    if (activeOrderStatus === 2 && shouldSurcharge) {
        showMessage('error', 'Доплатіть замовлення перед переведенням до статусу "доставлене"')
        return
    }

    const address = orderInfoModal.querySelector('.address textarea').value.trim()
    const comment = orderInfoModal.querySelector('.comment textarea').value.trim()

    put('Order', {
        id: order.id,
        date,
        timeFromString: timeFromElement.value,
        timeTillString: timeTillElement.value,
        status: activeOrderStatus,
        address,
        comment
    }).then(() => {
        order.date = dateElement.value + 'T00:00:00'
        order.timeFrom = timeFromElement.value
        order.timeTill = timeTillElement.value
        order.status = activeOrderStatus
        order.address = address
        order.comment = comment

        showMessage('info', 'Статус замовлення змінено')
        const newRow = createOrderRow(order, table)
        table.replaceChild(newRow, oldRow)
        orderInfoModal.style.display = ''
    }).catch(() => showMessage('error', 'Не вдалося відредагувати замовлення'))
}

const createInternetOrderModal = () => {
    get(`Label/${loginInfo.companyId}`)
        .then(response => labels = response)
        .catch(() => showMessage('error', getErrorMessage('мітки')))

    const internetOrderClientsBlock = internetOrderModal.querySelector('.internet-client-info')

    const internetOrderClients = internetOrderClientsBlock.querySelector('select')
    const clientNames = internetOrderModal.querySelectorAll('.sale-order-customer-name')
    const cashbackBlock = internetOrderModal.querySelector('.cashback')

    const clientPhones = internetOrderModal.querySelectorAll('.sale-order-customer-phone')
    let clientsWithPhones

    const fillInternetClientsSelect = clients => {
        internetOrderClients.innerHTML = ''

        for (const client of clients) {
            const option = document.createElement('option')
            option.text = client.fullName + ' ' + client.phone.split('\n')[0]
            option.dataset.id = client.id
            option.dataset.name = client.fullName
            option.dataset.phone = client.phone
            option.dataset.bonusCash = client.bonusCash
            internetOrderClients.add(option)
        }
    }

    clientPhones.forEach(ch => ch.oninput = () => {
        const searchQuery = ch.value.trim()

        if (!searchQuery) {
            fillInternetClientsSelect(clientsWithPhones)
            internetOrderClients.value = ''
            clientNames.forEach(cn => cn.value = '')
            cashbackBlock.style.cssText = 'display:none !important'
            cashbackBlock.querySelector('.client span:last-child').textContent = ''
            cashbackBlock.querySelector('.balance span:last-child').textContent = ''
            cashbackBlock.style.display = ''
            saveClient.checked = false
            return
        }

        fillInternetClientsSelect(clientsWithPhones.filter(c => c.phone.split('\n').some(p => p.includes(searchQuery))))

        if (internetOrderClients.value) {
            saveClient.checked = false
            clientNames.forEach(cn => cn.value = internetOrderClients.selectedOptions[0].dataset.name)
            cashbackBlock.style.cssText = 'display:flex !important'
            cashbackBlock.querySelector('.client span:last-child').textContent = internetOrderClients.selectedOptions[0].dataset.name
            cashbackBlock.querySelector('.balance span:last-child').textContent = (+internetOrderClients.selectedOptions[0].dataset.bonusCash).toFixed(2) + ' грн'
            return
        }
        
        clientNames.forEach(cn => cn.value = '')
        cashbackBlock.style.cssText = 'display:none !important'
        cashbackBlock.querySelector('.client span:last-child').textContent = ''
        cashbackBlock.querySelector('.balance span:last-child').textContent = ''
        cashbackBlock.style.display = ''
    })

    get(`Client/phones/${loginInfo.companyId}`).then(response => {
        clientsWithPhones = response
        fillInternetClientsSelect(clientsWithPhones)
        internetOrderClients.value = ''
    })

    internetOrderClients.onchange = e => {
        saveClient.checked = false
        clientNames.forEach(cn => cn.value = e.target.selectedOptions[0].dataset.name)
        clientPhones.forEach(ch => ch.value = e.target.selectedOptions[0].dataset.phone)
        cashbackBlock.style.cssText = 'display:flex !important'
        cashbackBlock.querySelector('.client span:last-child').textContent = e.target.selectedOptions[0].dataset.name
        cashbackBlock.querySelector('.balance span:last-child').textContent = (+e.target.selectedOptions[0].dataset.bonusCash).toFixed(2) + ' грн'
    }

    const saveClient = internetOrderClientsBlock.querySelector('input')
    saveClient.onclick = () => {
        if (saveClient.checked) {
            internetOrderClients.value = ''
            clientNames.forEach(cn => cn.value = '')
            clientPhones.forEach(ch => ch.value = '')
            cashbackBlock.style.cssText = 'display:none !important'
            cashbackBlock.querySelector('.client span:last-child').textContent = ''
            cashbackBlock.querySelector('.balance span:last-child').textContent = ''
            cashbackBlock.style.display = ''
        }
    }

    const internetOrderStocks = internetOrderModal.querySelector('.sale-order-stock select')
    internetOrderStocks.innerHTML = ''

    get(`Stock/ids-names/${loginInfo.companyId}`).then(response => {
        for (const stock of response) {
            const option = document.createElement('option')
            option.text = stock.name
            option.dataset.id = stock.id
            internetOrderStocks.add(option)
        }
    })

    hideBodyOverflow()
    internetOrderModal.style.display = 'flex'
    const buttons = internetOrderModal.querySelectorAll('.sale-order-type span')

    buttons.forEach(b => {
        b.style.background = 'rgb(255, 255, 255)'
        b.style.color = 'rgb(0, 0, 0)'
    })

    const labelsBlock = internetOrderModal.querySelector('.sale-order-labels')
    const internetClientBlock = internetOrderModal.querySelector('.internet-client-info')
    const orderStockBlock = internetOrderModal.querySelector('.sale-order-stock')
    const orderFlavorsBlock = internetOrderModal.querySelector('.sale-order-flavors')
    const deliveryBlocks = internetOrderModal.querySelectorAll('[id^=delivery]')
    const pickupBlocks = internetOrderModal.querySelectorAll('[id^=pickup]')

    labelsBlock.style.display = 'none'
    internetClientBlock.style.display = 'none'
    orderStockBlock.style.display = 'none'
    orderFlavorsBlock.style.display = 'none'
    deliveryBlocks.forEach(b => b.style.display = 'none')
    pickupBlocks.forEach(b => b.style.display = 'none')

    const saleOrderProducts = internetOrderModal.querySelector('.sale-order-products')
    const checkout = internetOrderModal.querySelector('.sale-order-checkout')
    const payment = internetOrderModal.querySelector('.payment')

    saleOrderProducts.style.display = 'none'
    checkout.style.display = 'none'
    payment.style.display = 'none'
    
    buttons.forEach(b => b.onpointerup = () => {
        imageData = ''
        internetOrderModal.querySelectorAll('img').forEach(i => i.src = EMPTY_IMAGE_URL)

        buttons.forEach(b => {
            b.style.background = 'rgb(255, 255, 255)'
            b.style.color = 'rgb(0, 0, 0)'
        })

        b.style.background = 'rgb(40, 40, 40)'
        b.style.color = 'rgb(245, 245, 245)'

        labelsBlock.innerHTML = ''
        labelsBlock.style.display = 'flex'
        internetClientBlock.style.display = 'flex'
        orderStockBlock.style.display = 'flex'
        orderFlavorsBlock.style.display = ''

        for (const label of labels) {
            const div = document.createElement('div')
            div.classList = 'sale-order-label'
            div.textContent = label.name
            div.dataset.id = label.id

            const backgroundColor = `rgb(${labelIndexToBackground[label.color]})`
            div.style.outline = `.15rem ${backgroundColor} solid`

            div.onpointerup = () => {
                if (div.style.background === backgroundColor) {
                    div.style.background = ''
                    div.style.color = ''
                    div.style.boxShadow = ''
                    return
                }

                div.style.background = backgroundColor
                div.style.color = `rgb(${labelIndexToColor[label.color]})`
                div.style.boxShadow = 'rgba(0, 0, 0, .16) 0 3px 6px, rgba(0, 0, 0, .23) 0 3px 6px'
            }

            labelsBlock.append(div)
        }

        const paymentIcons = internetOrderModal.querySelectorAll('.payment-content li span:first-child')
        paymentIcons.forEach(paymentIcon => paymentIcon.onpointerup = () => {
            paymentIcons.forEach(pi => pi.parentNode.classList.remove('active-payment-type'))
            paymentIcon.parentNode.classList.add('active-payment-type')
        })

        internetOrderModal.querySelectorAll('input:not(input[type=radio])').forEach(i => i.value = '')
        internetOrderModal.querySelectorAll('textarea').forEach(t => t.value = '')

        saleOrderProducts.style.display = 'flex'
        checkout.style.display = 'flex'
        payment.style.display = 'flex'

        if (b.textContent === 'Доставка') {
            deliveryBlocks.forEach(b => b.style.display = 'flex')
            pickupBlocks.forEach(b => b.style.display = 'none')
            return
        }

        deliveryBlocks.forEach(b => b.style.display = 'none')
        pickupBlocks.forEach(b => b.style.display = 'flex')
    })

    const orderProducts = internetOrderModal.querySelectorAll('table')
    orderProducts.forEach(op => op.innerHTML = op.querySelector('tbody').innerHTML)

    const paymentContent = internetOrderModal.querySelector('.payment-content')
    const freePaymentCheckbox = internetOrderModal.querySelector('.free-payment input')
    freePaymentCheckbox.onclick = () => paymentContent.style.display = freePaymentCheckbox.checked ? 'none' : ''

    internetOrderModal.querySelector('button:not(.one-more-product)').onpointerup = () => {
        const saleOrderType = buttons.item(0).style.background === 'rgb(40, 40, 40)' ? 'delivery' : 'pickup'
        createInternetOrder(saleOrderType)
    }
}

const createInternetOrder = saleOrderType => {
    const dateInfo = internetOrderModal.querySelector(`#${saleOrderType}-date`)
    const dateElement = dateInfo.querySelector('.sale-order-date-date')

    if (!dateElement.value) {
        showMessage('error', 'Введіть дату замовлення')
        return
    }

    const clientOption = internetOrderModal.querySelector('.internet-client-info select').selectedOptions[0]
    let clientId = null

    if (clientOption) {
        clientId = +clientOption.dataset.id
    }

    const date = new Date(dateElement.value)

    const timeFromElement = dateInfo.querySelector('.sale-order-date-time-from')
    const timeTillElement = dateInfo.querySelector('.sale-order-date-time-till')

    if (saleOrderType === 'pickup' && (!timeFromElement.value || !timeTillElement.value)) {
        showMessage('error', 'Оберіть час для самовивозу')
        return
    }

    const customerInfo = internetOrderModal.querySelector(`#${saleOrderType}-customer-recipient-info`)
    const customerNameElement = customerInfo.querySelector('.sale-order-customer-name')

    if (!customerNameElement.value) {
        showMessage('error', "Введіть ім'я замовника")
        return
    }

    const customerName = customerNameElement.value.trim()
    const customerPhone = customerInfo.querySelector('.sale-order-customer-phone').value.trim()

    let recipientName, recipientPhone
    if (saleOrderType === 'delivery') {
        recipientName = customerInfo.querySelector('.sale-order-recipient-name').value.trim()
        recipientPhone = customerInfo.querySelector('.sale-order-recipient-phone').value.trim()
    }

    const addressElement = internetOrderModal.querySelector('.sale-order-address')

    if (saleOrderType === 'delivery' && !addressElement.value) {
        showMessage('error', 'Введіть адресу доставки')
        return
    }

    const paidBonusSum = +internetOrderModal.querySelector('.cashback input').value || 0
    const checkoutClient = internetOrderModal.querySelector('.internet-client-info select').selectedOptions[0]

    if (checkoutClient && paidBonusSum > +checkoutClient.dataset.bonusCash) {
        showMessage('error', 'Клієнт не має стільки бонусів на рахунку')
        return
    }
    
    if (paidBonusSum > +internetOrderModal.querySelector('.sale-order-paid-sum').value / 2) {
        showMessage('error', 'Сума бонусів не може перевищувати половину суми замовлення')
        return
    }

    const flavors = []

    for (const tr of internetOrderModal.querySelectorAll('.sale-order-flavors tr:not(:first-child)')) {
        flavors.push({ flavorId: +tr.querySelector('td:first-child input').dataset.id })
    }

    const products = []

    for (const tr of internetOrderModal.querySelectorAll('.sale-order-products tr:not(:first-child)')) {
        const product = tr.querySelector('td:first-child input')
        const amount = +tr.querySelector('td:nth-child(2) input').value
        const price = +tr.querySelector('td:nth-child(3)').textContent
        const sum = +tr.querySelector('td:nth-child(4) span').textContent

        products.push({
            productId: +product.dataset.id,
            amount,
            price,
            sum
        })
    }

    const order = {
        companyId: loginInfo.companyId,
        employeeId: loginInfo.employeeId,
        imageData,
        labels: [...internetOrderModal.querySelectorAll('.sale-order-label')]
            .filter(l => l.style.outlineColor === l.style.background)
            .map(l => ({ labelId: +l.dataset.id })),
        stockId: +internetOrderModal.querySelector('.sale-order-stock select').selectedOptions[0].dataset.id,
        clientId,
        saveClient: internetOrderModal.querySelector('.internet-client-info input').checked,
        date,
        timeFromString: timeFromElement.value,
        timeTillString: timeTillElement.value,
        customerName,
        customerPhone,
        recipientName,
        recipientPhone,
        address: addressElement.value.trim(),
        comment: internetOrderModal.querySelector(`#${saleOrderType}-comment textarea`).value.trim(),
        flavors,
        products,
        totalSum: internetOrderModal.querySelector('.sale-order-total-sum input').value,
        payType: internetOrderModal.querySelector('.free-payment input').checked ?
            2 :
            internetOrderModal.querySelector('.payment-content li').classList.contains('active-payment-type') ? 0 : 1,
        paidBonusSum,
        paidSum: +internetOrderModal.querySelector('.cash input').value || 0
    }

    post('Order/internet', order).then(() => {
        internetOrderModal.style.display = ''
        showMessage('success', createSuccessMessage('online-замовлення'))
    }).catch(() => {
        internetOrderModal.style.display = ''
        showMessage('error', createErrorMessage('online-замовлення'))
    })
}

const addInternetOrderProduct = () => {
    const internetProductsTable = internetOrderModal.querySelector('.sale-order-products table')

    const internetProductSelect = document.createElement('input')
    const selector = 'internet-product'
    internetProductSelect.setAttribute('list', selector)

    const productPriceColumn = createTd()

    const internetProductColumn = document.createElement('td')
    internetProductColumn.append(internetProductSelect)

    const changeSum = () => {
        const sum = +productAmount.value * +productPriceColumn.textContent
        productSum.textContent = sum.toFixed(2)
        calculateInternetOrderTotalSum()
    }

    const productAmount = document.createElement('input')
    productAmount.classList = 'product-amount'

    productAmount.oninput = e => {
        handlePriceInput(e)
        changeSum()
    }

    productAmount.type = 'number'
    productAmount.min = '0'
    productAmount.max = '1000'
    const productAmountColumn = document.createElement('td')
    productAmountColumn.append(productAmount)

    const productSum = document.createElement('span')
    productSum.textContent = '0.00'

    const productSumColumn = document.createElement('td')
    productSumColumn.append(productSum)

    const removeInternetProduct = document.createElement('span')
    removeInternetProduct.classList = 'material-symbols-outlined'

    removeInternetProduct.onpointerup = e => {
        internetTotalSumElement.value = (+internetTotalSumElement.value - +productSum.textContent).toFixed(2)
        e.target.parentNode.parentNode.remove()

        const table = internetOrderModal.querySelector('.sale-order-products table')

        if (table.children.length === 1) {
            table.querySelector('tbody').style.display = ''
        }
    }

    removeInternetProduct.textContent = 'remove_circle_outline'
    const removeInternetProductColumn = document.createElement('td')
    removeInternetProductColumn.classList = 'remove-internet-product'
    removeInternetProductColumn.append(removeInternetProduct)

    const tr = document.createElement('tr')

    tr.append(
        internetProductColumn,
        productAmountColumn,
        productPriceColumn,
        productSumColumn,
        removeInternetProductColumn
    )

    internetProductsTable.append(tr)
    internetProductsTable.querySelector('tbody').style.display = 'contents'
    keepDatalistOptions(selector)

    internetProductSelect.addEventListener('change', () => {
        for (const option of internetProductsOptions) {
            if (+option.dataset.id === +internetProductSelect.dataset.id) {
                productPriceColumn.textContent = (+option.dataset.cost).toFixed(2)
                changeSum()
                break
            }
        }
    })
}

const addInternetOrderFlavor = () => {
    const internetFlavorsTable = internetOrderModal.querySelector('.sale-order-flavors table')

    const internetFlavorSelect = document.createElement('input')
    const selector = 'internet-flavor'
    internetFlavorSelect.setAttribute('list', selector)

    const internetFlavorColumn = document.createElement('td')
    internetFlavorColumn.append(internetFlavorSelect)

    const flavorSum = document.createElement('span')
    flavorSum.textContent = '0.00'

    const flavorSumColumn = document.createElement('td')
    flavorSumColumn.append(flavorSum)

    const removeInternetFlavor = document.createElement('span')
    removeInternetFlavor.classList = 'material-symbols-outlined'

    removeInternetFlavor.onpointerup = e => {
        internetTotalSumElement.value = (+internetTotalSumElement.value - +flavorSum.textContent).toFixed(2)
        e.target.parentNode.parentNode.remove()

        const table = internetOrderModal.querySelector('.sale-order-flavors table')

        if (table.children.length === 1) {
            table.querySelector('tbody').style.display = ''
        }
    }

    removeInternetFlavor.textContent = 'remove_circle_outline'
    const removeInternetFlavorColumn = document.createElement('td')
    removeInternetFlavorColumn.classList = 'remove-internet-flavor'
    removeInternetFlavorColumn.append(removeInternetFlavor)

    const tr = document.createElement('tr')

    tr.append(
        internetFlavorColumn,
        flavorSumColumn,
        removeInternetFlavorColumn
    )

    internetFlavorsTable.append(tr)
    internetFlavorsTable.querySelector('tbody').style.display = 'contents'
    keepDatalistOptions(selector)

    internetFlavorSelect.addEventListener('change', () => {
        for (const option of internetFlavorsOptions) {
            if (+option.dataset.id === +internetFlavorSelect.dataset.id) {
                flavorSumColumn.querySelector('span').textContent = (+option.dataset.cost).toFixed(2)
                calculateInternetOrderTotalSum()
                break
            }
        }
    })
}

const getAllOrdersByDate = e => {
    const date = e.target.value ? new Date(e.target.value) : false
    const query = date ?
        `${loginInfo.companyId}/${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` :
        `${loginInfo.companyId}`

    get('Order/' + query)
        .then(response => {
            allOrdersTable.innerHTML = allOrdersTable.querySelector('tbody').innerHTML

            if (!response.length) {
                allOrdersTable.append(createEmptyDataDiv())
                return
            }

            response.forEach(o => fillAllOrdersTable(o))
        })
        .catch(() => showMessage('error', getErrorMessage('замовлення за цією датою')))
}
