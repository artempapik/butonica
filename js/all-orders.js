let allOrdersTable, internetProductsOptions, internetFlavorsOptions, allOrdersPages, allOrderIntervalId, orderTippy, surchargeTippy

const orderInfoModal = document.querySelector('.order-info-modal')
const reminderInfoModal = document.querySelector('.reminder-info-modal')
const internetOrderModal = document.querySelector('.create-internet-order-modal')
const internetTotalSumElement = internetOrderModal.querySelector('.sale-order-total-sum input')

const updateOrderLeftTime = table => setInterval(() => {
    for (const td of table.querySelectorAll('td:not(tbody td):nth-child(2)')) {
        if (!td.dataset.timeFrom) {
            continue
        }

        const timeLeft = convertMsToTime(new Date(td.dataset.date.replace('00', td.dataset.timeFrom.substring(0, 2)).replace('00', td.dataset.timeFrom.substring(3))) - new Date())

        if ('background' in timeLeft) {
            td.style.background = timeLeft.background
            td.style.color = 'rgb(240, 240, 240)'
            td.style.fontWeight = 'bold'
            td.style.fontSize = '.9rem'
            td.textContent = timeLeft.text
        }
    }
}, 60 * 1000)

const fillDatalistsLabels = () => {
    get(`Label/${loginInfo.companyId}`)
        .then(response => labels = response)
        .catch(() => showMessage('error', getErrorMessage('мітки')))

    get(`Product/ids-names-costs/${loginInfo.companyId}`).then(response => internetProductsOptions = response)
    get(`Flavor/ids-names-costs/${loginInfo.companyId}`).then(response => internetFlavorsOptions = response)
}

const firstAllOrderPage = e => {
    if (currentPage === 1) {
        return
    }

    currentPage = 1
    document.querySelector('.change-page .page-number span:nth-child(2)').textContent = currentPage
    e.target.parentNode.parentNode.querySelector('span:nth-child(2)').classList.add('last-page')
    e.target.parentNode.parentNode.querySelector('.arrow-group:last-child span').classList.remove('last-page')
    showLoadAnimation()

    get(`Order/${loginInfo.companyId}/page/${currentPage}`).then(response => {
        allOrdersTable.querySelectorAll('tr:not(tbody tr)').forEach(tr => tr.remove())
        response.forEach(fillAllOrdersTable)
        animateChange(allOrdersTable)
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('замовлення')))
}

const lastAllOrderPage = e => {
    if (currentPage === allOrdersPages) {
        return
    }
    
    currentPage = allOrdersPages
    document.querySelector('.change-page .page-number span:nth-child(2)').textContent = currentPage
    e.target.parentNode.parentNode.querySelector('.arrow-group:last-child span').classList.add('last-page')
    e.target.parentNode.parentNode.querySelector('span:nth-child(2)').classList.remove('last-page')
    showLoadAnimation()

    get(`Order/${loginInfo.companyId}/page/${currentPage}`).then(response => {
        allOrdersTable.querySelectorAll('tr:not(tbody tr)').forEach(tr => tr.remove())
        response.forEach(fillAllOrdersTable)
        animateChange(allOrdersTable)
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('замовлення')))
}

const previousAllOrderPage = e => {
    if (e.target.classList.contains('last-page') || currentPage === 1) {
        return
    }

    e.target.parentNode.parentNode.querySelector('.arrow-group:last-child span').classList.remove('last-page')
    currentPage--

    if (currentPage === 1) {
        e.target.classList.add('last-page')
    }

    document.querySelector('.change-page .page-number span:nth-child(2)').textContent = currentPage
    showLoadAnimation()

    get(`Order/${loginInfo.companyId}/page/${currentPage}`).then(response => {
        allOrdersTable.querySelectorAll('tr:not(tbody tr)').forEach(tr => tr.remove())
        response.forEach(fillAllOrdersTable)
        animateChange(allOrdersTable)
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('замовлення')))
}

const nextAllOrderPage = e => {
    if (e.target.classList.contains('last-page') || currentPage === allOrdersPages) {
        return
    }

    e.target.parentNode.parentNode.querySelector('span:nth-child(2)').classList.remove('last-page')
    currentPage++

    if (currentPage === allOrdersPages) {
        e.target.classList.add('last-page')
    }

    document.querySelector('.change-page .page-number span:nth-child(2)').textContent = currentPage
    showLoadAnimation()

    get(`Order/${loginInfo.companyId}/page/${currentPage}`).then(response => {
        allOrdersTable.querySelectorAll('tr:not(tbody tr)').forEach(tr => tr.remove())
        response.forEach(fillAllOrdersTable)
        animateChange(allOrdersTable)
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('замовлення')))
}

const showAllOrderInfo = e => {
    main.innerHTML = menuItemsContents['allorder']
    fillSelectedMenuItem(e)
    allOrdersTable = document.querySelector('.all-order-table table')

    get(`Order/${loginInfo.companyId}/pages-count`).then(response => {
        if (!response) {
            return
        }

        document.querySelector('.change-page').style.display = response === 1 ? 'none' : 'flex'
        allOrdersPages = response
        document.querySelector('.change-page .page-number span:last-child').textContent = 'з ' + allOrdersPages
    })

    get(`Order/${loginInfo.companyId}/page/1`).then(response => {
        allOrdersTable.style.display = 'block'

        if (!response.length) {
            allOrdersTable.append(createEmptyDataDiv())
        }

        response.forEach(fillAllOrdersTable)
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('замовлення')))

    fillDatalistsLabels()
    allOrderIntervalId = updateOrderLeftTime(allOrdersTable)

    const allOrdersCalendar = new VanillaCalendar('.all-order-table td:nth-child(3)', {
        input: true,
        settings: { lang: 'uk' },
        actions: {
            clickDay(_, self) {
                allOrdersCalendar.hide()

                if (!self.selectedDates.length) {
                    showLoadAnimation()

                    get(`Order/${loginInfo.companyId}/page/${currentPage}`).then(response => {
                        document.querySelector('.change-page').style.display = 'flex'
                        allOrdersTable.querySelectorAll('tr:not(tbody tr)').forEach(tr => tr.remove())
                        allOrdersTable.querySelector('.table-no-data')?.remove()
                        response.forEach(fillAllOrdersTable)
                        animateChange(allOrdersTable)
                        replaceLoadIcons()
                    }).catch(() => showMessage('error', getErrorMessage('замовлення')))

                    return
                }

                const date = self.selectedDates[0].split('-')

                showLoadAnimation()

                get(`Order/${loginInfo.companyId}/${date[2]}/${date[1]}/${date[0]}`).then(response => {
                    document.querySelector('.change-page').style.display = 'none'
                    allOrdersTable.querySelectorAll('tr:not(tbody tr)').forEach(tr => tr.remove())
                    allOrdersTable.querySelector('.table-no-data')?.remove()
                    replaceLoadIcons()

                    if (!response.length) {
                        allOrdersTable.append(createEmptyDataDiv())
                        return
                    }

                    response.forEach(fillAllOrdersTable)
                    animateChange(allOrdersTable)
                }).catch(() => showMessage('error', getErrorMessage('замовлення за цією датою')))
            }
        }
    })

    allOrdersCalendar.init()
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
    0: 'linear-gradient(180deg, #4B91F7 0%, #367AF6 100%)',
    1: 'rgb(48, 133, 108)',
    2: 'rgb(230, 80, 25)'
}

const calculateDaysLeft = date => {
    const daysLeft = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) {
        return '!'
    }

    if (!daysLeft) {
        const img = document.createElement('img')
        img.src = 'img/today.png'
        return img
    }

    return daysLeft + 'д'
}

const convertMsToTime = milliseconds => {
    let seconds = Math.floor(milliseconds / 1000)
    let minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    seconds %= 60
    minutes %= 60
    const days = Math.floor(hours / 24)

    if (days < 0 || hours < 0) {
        return {
            text: '!',
            background: 'rgb(240, 0, 0)'
        }
    }

    if (days) {
        return { text: days + 'д' }
    }

    if (hours) {
        return {
            text: hours + 'г',
            background: 'rgb(48, 133, 108)',
        }
    }

    return {
        text: (minutes || 1) + 'хв',
        background: 'rgb(230, 80, 25)',
    }
}

const createOrderRow = (order, table) => {
    const actionsColumn = document.createElement('td')
    actionsColumn.classList = 'order-actions'

    const tr = document.createElement('tr')
    tr.onpointerup = e => {
        const tagName = e.target.tagName.toLowerCase()
        if (tagName === 'a' || tagName === 'span' && e.target.className) {
            return
        }

        showPageLoad()
        hideBodyOverflow()

        get(`Order/order/${order.id}`).then(response => {
            hidePageLoad()

            if (!order.customer) {
                const reminderNumberDate = reminderInfoModal.querySelector('.reminder-number-date')

                if (orderTippy) {
                    orderTippy.destroy()
                }

                orderTippy = tippy(reminderNumberDate.querySelector('.reminder-number span'), {
                    content: 'нагадування створено',
                    placement: 'right'
                })

                const reminderId = order.id.toString()
                const reminderNumber = reminderNumberDate.querySelector('.reminder-number .number')
                reminderNumber.textContent = reminderId.length > 4 ? reminderId.substring(reminderId.length - 4) : reminderId
                reminderNumber.onpointerup = () => reminderNumber.textContent = reminderNumber.textContent.length <= 4 ? reminderId : reminderId.substring(reminderId.length - 4)

                reminderNumberDate.querySelector('.reminder-date input').value = getDate(response.date)
                reminderInfoModal.querySelector('.reminder-time .enter-time-value span').textContent = order.timeFrom || '--:--'
                
                imageData = ''
                reminderInfoModal.querySelector('img').src = response.imageData ? response.imageData : EMPTY_IMAGE_URL
                reminderInfoModal.querySelector('.comment textarea').value = response.comment

                reminderInfoModal.style.display = 'flex'
                reminderInfoModal.querySelector('.reminder-info-modal-content').scroll(0, 0)

                return
            }

            const fillClient = (selector, text) => {
                const clientBlock = orderInfoModal.querySelector('.' + selector)
                const nameBlock = clientBlock.querySelector('.name span:last-child')
                orderInfoModal.querySelector('.name span').textContent = 'Замовник'
                
                if (!text) {
                    nameBlock.textContent = 'Не вказано'
                } else if (text === '\t') {
                    orderInfoModal.querySelector('.name span').textContent += ' і отримувач'
                    clientBlock.style.display = 'none'
                } else {
                    const customerInfo = createOrderClientTd(text)
                    nameBlock.textContent = customerInfo[0]

                    if (customerInfo.length === 2) {
                        nameBlock.append(customerInfo[1])
                    }
                }

                const phonesBlock = clientBlock.querySelector('.phones')
                phonesBlock.innerHTML = ''

                if (!response[selector + 'Phone']) {
                    phonesBlock.style.display = 'none'
                    return
                }

                for (const phone of response[selector + 'Phone'].split('\n')) {
                    if (!phone) {
                        continue
                    }
                    
                    const callIcon = document.createElement('span')
                    callIcon.classList = 'material-symbols-outlined'
                    callIcon.textContent = 'call'

                    const phoneLink = document.createElement('a')
                    phoneLink.href = 'tel:' + phone
                    phoneLink.textContent = formatPhoneNumber(phone)

                    const getSocialIconLink = (name, p) => {
                        let phone

                        if (p.length === 10) {
                            phone = '%2b38' + p
                        } else {
                            phone = '%2b' + (p[0] === '+' ? p.substring(1) : p)
                        }

                        if (name.endsWith('\ttgl')) {
                            return ['telegram', `https://t.me/${phone}`]
                        }

                        if (name.endsWith('\tvbl')) {
                            return ['viber', `viber://chat?number=${phone}`]
                        }

                        if (name.endsWith('\twal')) {
                            return ['whatsapp', `https://wa.me/${phone}`]
                        }

                        return ''
                    }

                    const phoneBlock = document.createElement('div')
                    phoneBlock.classList = 'phone'

                    if (/^\d+$/.test(phone)) {
                        phoneBlock.append(callIcon, phoneLink)
                    } else {
                        const phoneSpan = createSpan(phone)
                        phoneSpan.classList = 'alternate'
                        phoneBlock.append(phoneSpan)
                    }

                    const [icon, link] = getSocialIconLink(text, phone)

                    if (icon) {
                        const socialLink = document.createElement('img')
                        socialLink.src = `img/${icon}.png`
                        socialLink.onpointerup = () => window.open(link)
                        phoneBlock.append(socialLink)
                    }

                    phonesBlock.append(phoneBlock)
                }

                phonesBlock.style.display = ''
            }

            const orderNumberDate = orderInfoModal.querySelector('.order-number-date')
            const orderTypeIcon = orderNumberDate.querySelector('.order-number span')
            orderTypeIcon.textContent = order.isInternet ? 'credit_card' : 'shopping_bag'

            if (orderTippy) {
                orderTippy.destroy()
            }

            orderTippy = tippy(orderTypeIcon, {
                content: order.isInternet ? 'online-замовлення створено' : 'замовлення на зміні',
                placement: 'right'
            })

            const orderId = order.id.toString()
            const orderNumber = orderNumberDate.querySelector('.order-number .number span')
            orderNumber.textContent = orderId.length > 4 ? orderId.substring(orderId.length - 4) : orderId
            orderNumber.onpointerup = () => orderNumber.textContent = orderNumber.textContent.length <= 4 ? orderId : orderId.substring(orderId.length - 4)

            const printSheets = orderNumberDate.querySelector('.order-number .number .print-sheets')

            if (order.status !== 2) {
                printSheets.style.display = ''
                const printRequest = sheet => window.open(`${Environment.PROD}/Order/${loginInfo.companyId}/pdf/${sheet}/${orderId}`)
                
                printSheets.querySelector('span').onpointerup = () => printRequest('a4')
                printSheets.querySelector('span:last-child').onpointerup = () => printRequest('a5')
            } else {
                printSheets.style.display = 'none'
            }

            orderNumberDate.querySelector('.order-date input').value = getDate(response.date)

            const orderTime = orderInfoModal.querySelectorAll('.order-time .enter-time-value span:first-child')
            orderTime.item(0).textContent = order.timeFrom || '--:--'
            orderTime.item(1).textContent = order.timeTill || '--:--'

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
            const payedBlock = orderInfoModal.querySelector('.payed-block')

            if (response.surcharge) {
                const surcharge = response.surcharge
                surchargeBlock.querySelector('.surcharge span').textContent = surcharge.toFixed(2)

                const performSurcharge = (isCash, cashText) => {
                    showPageLoad()

                    get(`Shift/last-any/${loginInfo.companyId}`).then(response => {
                        hidePageLoad()
                        
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

                        showConfirm(`Доплатити ${cashText} ${surcharge.toFixed(2)} грн за\nзамовлення ${order.id}?`, () =>
                            put(`Order${order.isInternet ? '/internet' : ''}/surcharge`, orderSurcharge).then(() => {
                                setTimeout(() => hideModal(confirmModal), 1)
                                surchargeBlock.style.display = 'none'
                                payedBlock.style.display = ''
                                showMessage('info', `Замовлення ${order.id} доплачено`)
                            }).catch(() => showMessage('error', `${ERROR_TEXT} доплатити`))
                        )
                    }).catch(() => {
                        hidePageLoad()
                        getErrorMessage('зміну')
                    })
                }

                surchargeBlock.querySelector('.surcharge-button').onpointerup = () => performSurcharge(true, 'готівкою')
                surchargeBlock.querySelector('.surcharge-button:last-child').onpointerup = () => performSurcharge(false, 'терміналом')
                surchargeBlock.style.display = ''
                payedBlock.style.display = 'none'
            } else {
                surchargeBlock.style.display = 'none'
                payedBlock.style.display = ''

                if (surchargeTippy) {
                    surchargeTippy.destroy()
                }
                
                surchargeTippy = tippy(payedBlock, {
                    content: 'оплачено нещодавно',
                    placement: 'bottom'
                })
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

                for (const product of internetProductsOptions) {
                    const option = document.createElement('option')
                    option.text = product.name
                    option.dataset.id = product.id
                    productSelect.add(option)
                }

                for (const option of productSelect.options) {
                    if (+option.dataset.id === product.productId) {
                        option.selected = true
                        break
                    }
                }

                const productSelectTd = document.createElement('td')
                productSelectTd.append(productSelect)
                $(productSelect).select2(select2NoResults('', '14rem'))

                const amount = document.createElement('input')
                amount.type = 'number'
                amount.min = '0'
                amount.max = '1000'
                amount.value = product.amount
                amount.inputMode = 'decimal'
    
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
            orderInfoModal.querySelector('table').scrollLeft = 0
        }).catch(() => {
            hidePageLoad()
            showMessage('error', getErrorMessage('замовлення'))
        })
    }

    if (loginInfo.title < 2 || loginInfo.employeeId === order.employeeId) {
        const cancelAction = createDeleteSpan('order')
        cancelAction.textContent = 'cancel'
        actionsColumn.append(cancelAction)
        
        cancelAction.onpointerup = () => {
            const oType = order.customer ? 'замовлення' : 'нагадування'

            showConfirm(`Скасувати ${oType} ${order.id}?`, () => {
                delete order.timeFrom
                delete order.timeTill

                remove(`Order${order.isInternet ? '/internet' : ''}`, order).then(() => {
                    setTimeout(() => hideModal(confirmModal), 1)
                    showMessage('info', `${capitalize(oType)} скасовано`)
                    table.removeChild(tr)

                    if (table.children.length === 1) {
                        table.append(createEmptyDataDiv())
                    }
                }).catch(() => showMessage('error', `${ERROR_TEXT} скасувати ${oType}`))
            })
        }
    }

    const formatOrderDate = (date, from, till) => {
        let orderDate = formatWeekDate(date, true, false)

        if (!from && !till) {
            return orderDate
        }

        if (from && till) {
            if (from === till) {
                return `${orderDate}, ${from}`
            }

            return `${orderDate}, з ${from} до ${till}`
        }

        orderDate += ', '
        return from ? orderDate + 'з ' + from : orderDate + 'до ' + till
    }

    const statusTd = document.createElement('td')
    const span = createSpan(statusTypeToText[order.status])
    span.style.background = statusTypeToBackground[order.status]
    statusTd.append(span)

    const labelsTd = document.createElement('td')

    for (const label of order.labels) {
        const span = document.createElement('span')
        span.textContent = label.name
        span.style.background = `rgb(${labelIndexToBackground[label.color]})`
        span.style.color = `rgb(${labelIndexToColor[label.color]})`
        labelsTd.append(span)
    }

    const timeLeft = order.status === 2 ?
        { text: '–' } :
        order.timeFrom ?
            convertMsToTime(new Date(order.date.replace('00', order.timeFrom.substring(0, 2)).replace('00', order.timeFrom.substring(3))) - new Date()) :
            { text: calculateDaysLeft(order.date) }

    const timeLeftTd = createTd(timeLeft.text)
    
    if (timeLeft.text !== '–' && order.timeFrom) {
        timeLeftTd.dataset.timeFrom = order.timeFrom
        timeLeftTd.dataset.date = order.date
    }

    if ('background' in timeLeft || timeLeft.text === '!') {
        timeLeftTd.style.background = timeLeft.background
        timeLeftTd.style.color = 'rgb(240, 240, 240)'
        timeLeftTd.style.fontWeight = 'bold'
        timeLeftTd.style.fontSize = '.9rem'
    }

    if (timeLeft.text === '!') {
        timeLeftTd.style.background = 'rgb(240, 0, 0)'
    }

    const orderTypeTd = createTd()
    if (order.customer) {
        const img = document.createElement('img')
        img.src = `img/${order.isPickup ? 'pickup' : 'delivery'}.png`
        orderTypeTd.append(img)
    } else {
        const span = createSpan('notifications')
        span.classList = 'material-symbols-outlined'
        orderTypeTd.append(span)
    }

    const customerInfo = createOrderClientTd(order.customer)
    const customerTd = createTd(customerInfo[0])

    if (customerInfo.length === 2) {
        customerTd.append(customerInfo[1])
    }

    const orderId = order.id.toString()

    if (!order.customer) {
        tr.classList = 'reminder'
    }

    tr.append(
        createTd(orderId.length > 4 ? order.id.toString().substring(orderId.length - 4) : orderId),
        timeLeftTd,
        createTd(formatOrderDate(order.date, order.timeFrom, order.timeTill)),
        customerTd,
        orderTypeTd,
        statusTd,
        labelsTd,
        actionsColumn
    )
    return tr
}

const createOrderClientTd = customer => {
    if (customer === '\t') {
        // reminder
    }
    
    if (!customer) {
        return ['–']
    }

    const fCustomer = customer.includes('\t') ? customer.slice(0, -4) : customer

    if (fCustomer.includes('@')) {
        const customerInfo = fCustomer.split('@')

        const link = document.createElement('a')
        link.textContent = customerInfo[1]
        link.href = 'https://www.instagram.com/' + link.textContent
        link.target = 'blank'
        
        return [customerInfo[0], link]
    }

    return [fCustomer]
}

const fillAllOrdersTable = order => allOrdersTable.append(createOrderRow(order, allOrdersTable))

const editOrderStatus = (order, shouldSurcharge, oldRow, table) => {
    const dateElement = orderInfoModal.querySelector('.order-date input')

    if (!dateElement.value) {
        showMessage('error', 'Вкажіть дату замовлення')
        return
    }

    const date = new Date(dateElement.value)

    const times = orderInfoModal.querySelectorAll('.enter-time-value span:first-child')
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
        showMessage('error', 'Доплатіть замовлення перед переведенням до статусу «доставлене»')
        return
    }

    const address = orderInfoModal.querySelector('.address textarea').value.trim()
    const comment = orderInfoModal.querySelector('.comment textarea').value.trim()

    const timeFrom = timeFromElement.textContent[0] === '-' ? null : timeFromElement.textContent.replaceAll('-', '0')
    const timeTill = timeTillElement.textContent[0] === '-' ? null : timeTillElement.textContent.replaceAll('-', '0')

    if (!isValidTime(timeFrom) || !isValidTime(timeTill)) {
        showMessage('error', 'Вкажіть коректний час замовлення')
        return
    }

    if (timeTill && !timeFrom) {
        showMessage('error', 'Вкажіть час «від»')
        return
    }

    const payButton = orderInfoModal.querySelector('button:not(.one-more-product)')
    payButton.disabled = true

    put('Order', {
        id: order.id,
        date,
        timeFromString: timeFrom,
        timeTillString: timeTill,
        status: activeOrderStatus,
        address,
        comment
    }).then(() => {
        order.date = dateElement.value + 'T00:00:00'
        order.timeFrom = timeFrom
        order.timeTill = timeTill
        order.status = activeOrderStatus
        order.address = address
        order.comment = comment

        showMessage('info', 'Замовлення відредаговано')

        if (order.status === 2 && activeMenuItem === 'pendingorder') {
            table.removeChild(oldRow)
        } else {
            const newRow = createOrderRow(order, table)
            table.replaceChild(newRow, oldRow)
        }

        hideModalEnableButton(orderInfoModal, payButton)
    }).catch(() => {
        hideModalEnableButton(orderInfoModal, payButton)
        showMessage('error', 'Не вдалося відредагувати замовлення')
    })
}

const createInternetOrderModal = () => {
    internetOrderModal.querySelector('.free-payment input').checked = false
    internetOrderModal.querySelector('.payment-content').classList.remove('free-payment')
    const internetOrderClientsBlock = internetOrderModal.querySelector('.internet-client-info')

    const internetOrderClients = internetOrderClientsBlock.querySelector('select')
    $(internetOrderClients).select2(select2NoResults('Обрати клієнта'))
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
            $(internetOrderClients).val('').select2(select2NoResults('Обрати клієнта'))
            clientNames.forEach(cn => cn.value = '')
            clientPhones.forEach(ch => ch.value = '')
            cashbackBlock.style.cssText = 'display:none !important'
            cashbackBlock.querySelector('.client span:last-child').textContent = ''
            cashbackBlock.querySelector('.balance span:last-child').textContent = ''
            cashbackBlock.style.display = ''
        }
    }

    const sameAsCust = internetOrderModal.querySelector('.same-as-cust input')
    sameAsCust.onclick = () => {
        if (sameAsCust.checked) {
            internetOrderModal.querySelector('.sale-order-recipient-name').classList.add('disabled')
            sameAsCust.parentNode.parentNode.querySelectorAll('.phone-input').forEach(i => i.classList.add('disabled'))
            return
        }

        internetOrderModal.querySelector('.sale-order-recipient-name').classList.remove('disabled')
        sameAsCust.parentNode.parentNode.querySelectorAll('.phone-input').forEach(i => i.classList.remove('disabled'))
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

        $(internetOrderStocks).select2(select2NoSearch())
    })

    hideBodyOverflow()
    internetOrderModal.style.display = 'flex'
    const buttons = internetOrderModal.querySelectorAll('.sale-order-type span')

    buttons.forEach(b => {
        b.style.background = '#fff'
        b.style.color = '#000'
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
        internetOrderModal.querySelectorAll('img:not([class$=social-buttons] img)').forEach(i => i.src = EMPTY_IMAGE_URL)

        buttons.forEach(b => {
            b.style.background = '#fff'
            b.style.color = '#000'
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
                    unselectLabelDiv(div)
                    return
                }

                labelsBlock.querySelectorAll('.sale-order-label').forEach(unselectLabelDiv)
                div.style.background = backgroundColor
                div.style.color = `rgb(${labelIndexToColor[label.color]})`
                div.style.boxShadow = 'rgba(0, 0, 0, .16) 0 3px 6px, rgba(0, 0, 0, .23) 0 3px 6px'
            }

            labelsBlock.append(div)
        }

        sameAsCust.checked = false
        internetOrderModal.querySelector('.sale-order-recipient-name').classList.remove('disabled')
        sameAsCust.parentNode.parentNode.querySelectorAll('.phone-input').forEach(i => i.classList.remove('disabled'))

        const socialButons = internetOrderModal.querySelectorAll('.social-buttons img')
        socialButons.forEach(sb => sb.classList.remove('selected'))

        socialButons.forEach(sb => sb.onpointerup = () => {
            if (sb.classList.contains('selected')) {
                sb.classList.remove('selected')
                return
            }

            socialButons.forEach(sb => sb.classList.remove('selected'))
            sb.classList.add('selected')
        })

        const paymentIcons = internetOrderModal.querySelectorAll('.payment-content li span:first-child')
        paymentIcons.forEach(paymentIcon => paymentIcon.onpointerup = () => {
            paymentIcons.forEach(pi => pi.parentNode.classList.remove('active-payment-type'))
            paymentIcon.parentNode.classList.add('active-payment-type')
        })

        internetOrderModal.querySelectorAll('input:not(input[type=radio])').forEach(i => i.value = '')
        internetOrderModal.querySelectorAll('.enter-time-value span:first-child').forEach(t => t.textContent = '--:--')
        internetOrderModal.querySelectorAll('textarea').forEach(t => t.value = '')
        internetOrderModal.querySelector('input[type=checkbox]').checked = false

        const cashbackBlock = internetOrderModal.querySelector('.cashback')
        cashbackBlock.style.cssText = 'display:none !important'
        cashbackBlock.querySelector('.client span:last-child').textContent = ''
        cashbackBlock.querySelector('.balance span:last-child').textContent = ''
        cashbackBlock.style.display = ''

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
    freePaymentCheckbox.onclick = () => freePaymentCheckbox.checked ? paymentContent.classList.add('free-payment') : paymentContent.classList.remove('free-payment')

    internetOrderModal.querySelector('button:not(.one-more-product)').onpointerup = () => {
        const saleOrderType = buttons.item(0).style.background === 'rgb(40, 40, 40)' ? 'delivery' : 'pickup'
        createInternetOrder(saleOrderType)
    }
}

const getSelectedSocialSuffix = modal => {
    const socialButtons = modal.querySelectorAll('.social-buttons img')

    for (let i = 0; i < 6; i++) {
        if (socialButtons.item(i).classList.contains('selected')) {
            return '\t' + {
                0: 'tgl',
                1: 'vbl',
                2: 'wal'
            }[i % 3]
        }
    }

    return ''
}

const createInternetOrder = saleOrderType => {
    const dateInfo = internetOrderModal.querySelector(`#${saleOrderType}-date`)
    const dateElement = dateInfo.querySelector('.sale-order-date-date')

    if (!dateElement.value) {
        showMessage('error', 'Вкажіть дату замовлення')
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

    if (saleOrderType === 'pickup' && (timeFromElement.textContent[0] === '-' || timeTillElement.textContent[0] === '-')) {
        showMessage('error', 'Оберіть час для самовивозу')
        return
    }

    const customerInfo = internetOrderModal.querySelector(`#${saleOrderType}-customer-recipient-info`)
    const customerNameElement = customerInfo.querySelector('.sale-order-customer-name')

    if (!customerNameElement.value) {
        showMessage('error', 'Вкажіть замовника')
        return
    }

    let customerName = customerNameElement.value.trim()
    const customerPhone = readTwoPhones(customerInfo)

    if (customerPhone) {
        customerName += getSelectedSocialSuffix(internetOrderModal, 'customer')
    }

    let recipientName, recipientPhone
    if (saleOrderType === 'delivery') {
        recipientName = customerInfo.querySelector('.sale-order-recipient-name').value.trim()
        recipientPhone = readTwoPhones(customerInfo, 'last')
    }

    const shortRN = recipientName?.toLowerCase()
    if (document.querySelector('.same-as-cust input').checked ||
        shortRN === 'тот же' ||
        shortRN === 'той самий') {
        recipientName = '\t'
        recipientPhone = ''
    }

    if (customerPhone === null || recipientPhone === null) {
        showMessage('error', 'Невірний формат номеру')
        return
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

    const totalSum = +internetOrderModal.querySelector('.sale-order-total-sum input').value
    
    if (paidBonusSum > totalSum / 2) {
        showMessage('error', 'Сума бонусів не може перевищувати половину суми замовлення')
        return
    }

    const flavors = []

    for (const tr of internetOrderModal.querySelectorAll('.sale-order-flavors tr:not(:first-child)')) {
        const flavorSelect = tr.querySelector('td:first-child select')

        if (!flavorSelect.value) {
            showMessage('error', 'Оберіть букет(и) або видаліть їх')
            return
        }

        const flavorId = +flavorSelect.selectedOptions[0].dataset.id
        flavors.push({ flavorId })
    }

    const products = []

    for (const tr of internetOrderModal.querySelectorAll('.sale-order-products tr:not(:first-child)')) {
        const productSelect = tr.querySelector('td:first-child select')

        if (!productSelect.value) {
            showMessage('error', 'Введіть дані для всіх товарів')
            return
        }

        const productId = +productSelect.selectedOptions[0].dataset.id
        const amount = +tr.querySelector('td:nth-child(2) input').value
        const price = +tr.querySelector('td:nth-child(3)').textContent
        const sum = +tr.querySelector('td:nth-child(4) span').textContent

        if (!amount || !price || !sum) {
            showMessage('error', 'Введіть дані для всіх товарів')
            return
        }

        products.push({
            productId,
            amount,
            price,
            sum
        })
    }

    if (!flavors.length && !products.length) {
        showMessage('error', 'Додайте товар або букет')
        return
    }

    const timeFrom = timeFromElement.textContent[0] === '-' ? null : timeFromElement.textContent.replaceAll('-', '0')
    const timeTill = timeTillElement.textContent[0] === '-' ? null : timeTillElement.textContent.replaceAll('-', '0')

    if (!isValidTime(timeFrom) || !isValidTime(timeTill)) {
        showMessage('error', 'Вкажіть коректний час замовлення')
        return
    }

    if (timeTill && !timeFrom) {
        showMessage('error', 'Вкажіть час «від»')
        return
    }

    const payButton = internetOrderModal.querySelector('button:not(.one-more-product)')
    payButton.disabled = true
    
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
        timeFromString: timeFrom,
        timeTillString: timeTill,
        customerName,
        customerPhone,
        recipientName,
        recipientPhone,
        address: addressElement.value.trim(),
        comment: internetOrderModal.querySelector(`#${saleOrderType}-comment textarea`).value.trim(),
        flavors,
        products,
        totalSum,
        payType: internetOrderModal.querySelector('.free-payment input').checked ?
            2 :
            internetOrderModal.querySelector('.payment-content li').classList.contains('active-payment-type') ? 0 : 1,
        paidBonusSum,
        paidSum: +internetOrderModal.querySelector('.cash input').value || 0
    }

    // COME HEREEEEEE RESPONSE

    post('Order/internet', order)
        .then(response => {
            hideModalEnableButton(internetOrderModal, payButton)
            showMessage('success', createSuccessMessage('online-замовлення'))
            showPendingOrderInfo()
        }).catch(() => {
            hideModalEnableButton(internetOrderModal, payButton)
            showMessage('error', createErrorMessage('online-замовлення'))
        })
}

const addInternetOrderProduct = () => {
    const internetProductsTable = internetOrderModal.querySelector('.sale-order-products table')
    const internetProductSelect = document.createElement('select')

    for (const product of internetProductsOptions) {
        const option = document.createElement('option')
        option.text = product.name
        option.value = product.name
        option.dataset.id = product.id
        option.dataset.cost = product.cost
        internetProductSelect.add(option)
    }

    internetProductSelect.value = ''
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
    productAmount.oninput = () => changeSum()
    productAmount.type = 'number'
    productAmount.min = '0'
    productAmount.max = '1000'
    productAmount.inputMode = 'decimal'

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
    $(internetProductSelect).select2(select2NoResults('Обрати товар'))

    internetProductSelect.onchange = () => {
        for (const option of internetProductsOptions) {
            if (+option.id === +internetProductSelect.selectedOptions[0].dataset.id) {
                productPriceColumn.textContent = (+option.cost).toFixed(2)
                changeSum()
                break
            }
        }
    }
}

const addInternetOrderFlavor = () => {
    const internetFlavorsTable = internetOrderModal.querySelector('.sale-order-flavors table')
    const internetFlavorSelect = document.createElement('select')

    for (const flavor of internetFlavorsOptions) {
        const option = document.createElement('option')
        option.text = getFlavorName(flavor)
        option.value = getFlavorName(flavor)
        option.dataset.id = flavor.id
        option.dataset.cost = flavor.totalSum
        internetFlavorSelect.append(option)
    }

    internetFlavorSelect.value = ''
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
    $(internetFlavorSelect).select2(select2NoResults('Обрати букет'))

    internetFlavorSelect.onchange = () => {
        for (const option of internetFlavorsOptions) {
            if (+option.id === +internetFlavorSelect.selectedOptions[0].dataset.id) {
                flavorSumColumn.querySelector('span').textContent = (+option.totalSum).toFixed(2)
                calculateInternetOrderTotalSum()
                break
            }
        }
    }
}

const printEmptySheetModal = document.querySelector('.print-empty-sheet-modal')

const printEmptyOrderSheet = () => {
    hideBodyOverflow()
    printEmptySheetModal.style.display = 'flex'

    printEmptySheetModal.querySelector('button').onpointerup = () => {
        const sheet = printEmptySheetModal.querySelector('input[name=sheet-type]:first-child').checked ? 'a4' : 'a5'
        const orderId = printEmptySheetModal.querySelector('input[name=order-type]:first-child').checked ? '85125' : '85126'
        window.open(`${Environment.PROD}/Order/5cc9f842-f3df-4855-adfd-5a113e3ebc04/pdf/${sheet}/${orderId}`)
    }
}
