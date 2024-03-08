let movingOrder

const showOrderCalendarInfo = e => {
    main.innerHTML = menuItemsContents['ordercalendar']
    fillSelectedMenuItem(e)

    const calendarDays = document.querySelectorAll('.calendar-day')

    calendarDays.forEach(day => day.onpointerup = () => {
        if (day.classList.contains('active')) {
            return
        }
        
        showLoadAnimation()
        calendarDays.forEach(day => day.classList.remove('active'))
        day.classList.add('active')

        const daySpan = day.querySelector('span:last-child')

        if (!daySpan) {
            const firstDay = calendarDays.item(1).querySelector('span:last-child').textContent
            fillOrderCalendar(firstDay.substring(0, firstDay.indexOf(' ')), 3, 2024, true)
            return
        }

        fillOrderCalendar(daySpan.textContent.substring(0, daySpan.textContent.indexOf(' ')), 3, 2024)
    })

    fillOrderCalendar(4, 3, 2024)
    fillDatalistsLabels()
}

const fillOrderCalendar = (day, month, year, isWeek = false) => {
    const categories = document.querySelectorAll('.order-calendar-category')
    categories.forEach(c => {
        const category = c.firstElementChild
        c.innerHTML = ''
        c.append(category)
    })

    const animationsDisabled = (localStorage.getItem('animations-disabled') || false)

    get(`Order/calendar/${isWeek ? 'week/' : ''}${loginInfo.companyId}/${day}/${month}/${year}`)
        .then(response => {
            replaceLoadIcons()

            const formatOrderTime = (orderDate, from, till) => {
                const date = isWeek ? formatDate(orderDate, false) : ''

                if (!from && !till) {
                    return isWeek ? date : 'час відсутній'
                }

                if (from && till) {
                    if (from === till) {
                        return isWeek ? `${date}, ${from}` : from
                    }
        
                    return isWeek ? `${date}, ${from} – ${till}` : `${from} – ${till}`
                }

                if (isWeek) {
                    return from ? `${date}, з ${from}` : `${date}, до ${till}`
                }

                return from ? 'з ' + from : 'до ' + till
            }

            for (let i = 0; i < 3; i++) {
                if (!response[i].length) {
                    const emptyDataDiv = createEmptyDataDiv()

                    if (!animationsDisabled) {
                        emptyDataDiv.classList.add('animate')
                    }

                    categories.item(i).append(emptyDataDiv)
                    continue
                }

                for (const order of response[i]) {
                    const orderNumber = createSpan(order.id)
                    orderNumber.classList = 'number'
    
                    const orderNumberImg = document.createElement('img')
                    orderNumberImg.src = `img/${order.isPickup ? 'pickup' : 'delivery'}.png`
    
                    const orderNumberBlock = document.createElement('div')
                    orderNumberBlock.classList = 'order-number'
                    orderNumberBlock.append(orderNumber, orderNumberImg)
    
                    const orderTimeIcon = createSpan('schedule')
                    orderTimeIcon.classList = 'material-symbols-outlined'
    
                    const orderTimeSpan = document.createElement('span')
                    orderTimeSpan.classList = 'time'
                    orderTimeSpan.append(orderTimeIcon, createSpan(formatOrderTime(order.date, order.timeFrom, order.timeTill)))
    
                    const leftTime = document.createElement('span')
                    leftTime.classList = 'left'

                    const timeLeft = i === 2 ?
                        { text: '–' } :
                        order.timeFrom ?
                            convertMsToTime(new Date(order.date.replace('00', order.timeFrom.substring(0, 2)).replace('00', order.timeFrom.substring(3))) - new Date()) :
                            { text: calculateDaysLeft(order.date) }

                    leftTime.textContent = timeLeft.text

                    if ('background' in timeLeft) {
                        leftTime.style.background = timeLeft.background
                    } else {
                        if (timeLeft.text === '–') {
                            leftTime.style.visibility = 'hidden'
                        } else {
                            leftTime.style.fontWeight = 'bold'
                            leftTime.style.color = 'rgb(50, 50, 50)'
                        }
                    }

                    const orderTimeBlock = document.createElement('div')
                    orderTimeBlock.classList = 'order-time'
                    orderTimeBlock.append(orderTimeSpan, leftTime)
    
                    const getClientMarkup = selector => {
                        const clientNameSpan = createSpan(selector === 'customer' ? 'Замовник:' : 'Отримувач:')
                        const clientNameText = createSpan(order[selector] || 'Не вказано')
                        
                        const clientNameBlock = document.createElement('div')
                        clientNameBlock.classList = 'name'
                        clientNameBlock.append(clientNameSpan, clientNameText)
    
                        const phonesBlock = document.createElement('div')
                        phonesBlock.classList = 'phones'
    
                        const clientBlock = document.createElement('div')
                        clientBlock.classList = 'order-' + selector

                        if (order[selector + 'Phone']) {
                            for (const phone of order[selector + 'Phone'].split('\n')) {
                                const callIcon = createSpan('call')
                                callIcon.classList = 'material-symbols-outlined'

                                const phoneLink = document.createElement('a')
                                phoneLink.href = 'tel:' + phone
                                phoneLink.textContent = formatPhoneNumber(phone)

                                const phoneBlock = document.createElement('div')
                                phoneBlock.classList = 'phone'
                                phoneBlock.append(callIcon, phoneLink)
                                phonesBlock.append(phoneBlock)
                            }
    
                            clientBlock.append(clientNameBlock, phonesBlock)
                        } else {
                            clientBlock.append(clientNameBlock)
                        }
    
                        return clientBlock
                    }
    
                    const cancelButton = createSpan('close')
                    cancelButton.classList = 'material-symbols-outlined'

                    const doneButton = createSpan(i ? 'local_shipping' : 'done')
                    doneButton.style.background = i ? 'rgb(255, 100, 30)' : 'rgb(48, 133, 108)'
                    doneButton.classList = 'material-symbols-outlined'

                    if (i === 2) {
                        doneButton.style.visibility = 'hidden'
                    }

                    const buttons = document.createElement('div')
                    buttons.classList = 'buttons'
                    buttons.append(cancelButton, createSpan(order.totalSum + ' грн'), doneButton)
    
                    const orderBody = document.createElement('div')
                    orderBody.classList = 'order-body'
    
                    if (order.isPickup) {
                        orderBody.append(orderTimeBlock, getClientMarkup('customer'), getClientMarkup('recipient'))
                    } else {
                        const addressIcon = createSpan('location_on')
                        addressIcon.classList = 'material-symbols-outlined'
    
                        const addressBlock = document.createElement('div')
                        addressBlock.classList = 'order-address'
                        addressBlock.append(addressIcon, createSpan(order.address))
                        orderBody.append(orderTimeBlock, getClientMarkup('customer'), getClientMarkup('recipient'), addressBlock)
                    }
    
                    if (order.labels.length) {
                        const labelsBlock = document.createElement('div')
                        labelsBlock.classList = 'order-labels'
    
                        for (const label of order.labels) {
                            const labelSpan = createSpan(label.name)
                            labelSpan.classList = 'order-label'
                            labelSpan.style.background = `rgb(${labelIndexToBackground[label.color]})`
                            labelSpan.style.color = `rgb(${labelIndexToColor[label.color]})`
                            labelsBlock.append(labelSpan)
                        }
    
                        orderBody.append(labelsBlock)
                    }
    
                    orderBody.append(buttons)
    
                    const orderCard = document.createElement('div')
                    orderCard.classList = 'order animate'
                    orderCard.id = order.id
                    orderCard.draggable = true

                    orderCard.ondragstart = e => {
                        movingOrder = order

                        categories.forEach(c => {
                            c.classList.remove('not-moving')
                            c.classList.add('moving')
                        })

                        for (const category of categories) {
                            if (category.contains(orderCard)) {
                                category.classList.remove('moving')
                                category.classList.add('not-moving')
                                break
                            }
                        }

                        orderCard.classList.add('moving')
                        e.dataTransfer.setData('order-id', order.id)
                        showMessage('info', e.dataTransfer.getData('order-id'))
                    }

                    orderCard.ondragend = () => {
                        categories.forEach(c => {
                            c.classList.remove('not-moving')
                            c.classList.remove('moving')
                        })

                        orderCard.classList.remove('moving')
                    }

                    if (animationsDisabled) {
                        orderCard.classList.remove('animate')
                    }

                    orderCard.append(orderNumberBlock, orderBody)
                    categories.item(i).append(orderCard)
                }
            }
        })
        .catch(() => showMessage('error', 'Не вдалося завантажити календар'))
}

const indexToMovedOrderStatus = {
    0: 'прийняті',
    1: 'зроблені',
    2: 'доставлені'
}

const moveOrder = (e, index) => {
    e.preventDefault()

    const categories = document.querySelectorAll('.order-calendar-category')
    categories.forEach(c => c.classList.remove('moving'))
    const order = document.getElementById(e.dataTransfer.getData('order-id'))

    if (categories.item(index).contains(order)) {
        return
    }

    const button = order.querySelector('.buttons span:last-child')
    button.textContent = index ? 'local_shipping' : 'done'
    button.style.background = index ? 'rgb(255, 100, 30)' : 'rgb(48, 133, 108)'
    const leftTime = order.querySelector('.left')

    if (index === 2) {
        button.style.visibility = 'hidden'
        leftTime.style.visibility = 'hidden'
    } else {
        button.style.visibility = ''
        leftTime.style.visibility = ''

        const timeLeft = movingOrder.timeFrom ?
            convertMsToTime(new Date(movingOrder.date.replace('00', movingOrder.timeFrom.substring(0, 2)).replace('00', movingOrder.timeFrom.substring(3))) - new Date()) :
            { text: calculateDaysLeft(movingOrder.date) }

        leftTime.textContent = timeLeft.text

        if ('background' in timeLeft) {
            leftTime.style.background = timeLeft.background
        } else {
            leftTime.style.fontWeight = 'bold'
            leftTime.style.color = 'rgb(50, 50, 50)'
        }
    }

    for (const category of categories) {
        if (category.contains(e.target)) {
            const emptyBox = category.querySelector('.table-no-data')
    
            if (emptyBox) {
                emptyBox.remove()
            }

            category.firstElementChild.after(order)
        }
    }

    for (const category of categories) {
        if (category.children.length === 1) {
            category.firstElementChild.after(createEmptyDataDiv())
        }
    }

    showMessage('info', `Замовлення ${order.id} переведено у ${indexToMovedOrderStatus[index]}`)
}
