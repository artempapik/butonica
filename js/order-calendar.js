let movingOrder, calendarDate = new Date(), orderCalendarIntervalId

const calendarMonthIndexToName = {
    0: 'січ',
    1: 'лют',
    2: 'бер',
    3: 'кві',
    4: 'тра',
    5: 'чер',
    6: 'лип',
    7: 'сер',
    8: 'вер',
    9: 'жов',
    10: 'лис',
    11: 'гру'
}

const calendarMonthNameToIndex = {
    'січ': 1,
    'лют': 2,
    'бер': 3,
    'кві': 4,
    'тра': 5,
    'чер': 6,
    'лип': 7,
    'сер': 8,
    'вер': 9,
    'жов': 10,
    'лис': 11,
    'гру': 12,
}

const showOrderCalendarInfo = e => {
    main.innerHTML = menuItemsContents['ordercalendar']
    fillSelectedMenuItem(e)

    const separator = document.querySelector('.separator')
    separator.textContent = calendarDate.getFullYear()

    const calendarDays = document.querySelectorAll('.calendar-day')

    const currentDayNumber = calendarDate.getDate()
    const date = new Date(calendarDate)

    const day = date.getDay()
    const diff = date.getDate() - day + (!day ? -6 : 1)
    const today = new Date(date.setDate(diff))
    
    const orderCalendarMonths = document.querySelectorAll('.order-calendar-month')
    orderCalendarMonths.item(0).querySelector('span:last-child').textContent = `${today.getDate()} ${calendarMonthIndexToName[today.getMonth()]}`

    calendarDays.forEach(day => {
        const daySpan = day.querySelector('span:last-child')

        if (daySpan) {
            const currentDay = today.getDate()
            
            if (currentDay === currentDayNumber) {
                day.classList.add('active')
                fillOrderCalendar(currentDay, today.getMonth() + 1, today.getFullYear())
            }

            day.querySelector('span:last-child').textContent = `${currentDay} ${calendarMonthIndexToName[today.getMonth()]}`
            today.setDate(currentDay + 1)
        }

        day.onpointerup = () => {
            if (day.classList.contains('active')) {
                return
            }
            
            showLoadAnimation()
            calendarDays.forEach(day => day.classList.remove('active'))
            day.classList.add('active')

            const daySpan = day.querySelector('span:last-child')

            if (!daySpan) {
                const firstDay = calendarDays.item(1).querySelector('span:last-child').textContent
                fillOrderCalendar(firstDay.substring(0, firstDay.indexOf(' ')), calendarMonthNameToIndex[firstDay.substring(firstDay.indexOf(' ') + 1)], separator.textContent, true)
                return
            }

            const dayText = daySpan.textContent
            fillOrderCalendar(dayText.substring(0, dayText.indexOf(' ')), calendarMonthNameToIndex[dayText.substring(dayText.indexOf(' ') + 1)], separator.textContent)
        }
    })

    today.setDate(today.getDate() - 1)
    orderCalendarMonths.item(1).querySelector('span').textContent = `${today.getDate()} ${calendarMonthIndexToName[today.getMonth()]}`
    today.setDate(today.getDate() - 6)
}

const fillOrderCalendar = (day, month, year, isWeek = false) => {
    const categories = document.querySelectorAll('.order-calendar-category')
    categories.forEach(c => {
        const category = c.firstElementChild
        c.innerHTML = ''
        c.append(category)
    })

    const animationsDisabled = localStorage.getItem('animations-disabled') || false

    get(`Order/calendar/${isWeek ? 'week/' : ''}${loginInfo.companyId}/${day}/${month}/${year}`)
        .then(response => {
            replaceLoadIcons()

            const formatOrderTime = (orderDate, from, till) => {
                const date = isWeek ? formatWeekDate(orderDate, true) : ''

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
                    const orderId = order.id.toString()
                    const orderNumber = createSpan(orderId.length > 4 ? orderId.substring(orderId.length - 4) : orderId)
                    orderNumber.classList = 'number'
                    
                    const orderNumberImg = document.createElement('img')
                    orderNumberImg.draggable = false
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

                    if (timeLeft.text !== '–' && order.timeFrom) {
                        leftTime.dataset.timeFrom = order.timeFrom
                        leftTime.dataset.date = order.date
                    }

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

                    if (timeLeft.text === '!') {
                        leftTime.style.color = 'rgb(240, 240, 240)'
                        leftTime.style.background = 'rgb(240, 0, 0)'
                    }

                    const orderTimeBlock = document.createElement('div')
                    orderTimeBlock.classList = 'order-time'
                    orderTimeBlock.append(orderTimeSpan, leftTime)
    
                    const getClientMarkup = selector => {
                        const clientNameSpan = createSpan(selector === 'customer' ? 'Замовник:' : 'Отримувач:')
                        const clientNameText = createSpan()

                        if (!order[selector]) {
                            clientNameText.textContent = 'Не вказано'
                        } else {
                            const customerInfo = createOrderClientTd(order[selector])
                            clientNameText.textContent = customerInfo[0]

                            if (customerInfo.length === 2) {
                                clientNameText.append(customerInfo[1])
                            }
                        }
                        
                        const clientNameBlock = document.createElement('div')
                        clientNameBlock.classList = 'name'
                        clientNameBlock.append(clientNameSpan, clientNameText)
    
                        const phonesBlock = document.createElement('div')
                        phonesBlock.classList = 'phones'
    
                        const clientBlock = document.createElement('div')
                        clientBlock.classList = 'order-' + selector

                        if (order[selector + 'Phone']) {
                            for (const phone of order[selector + 'Phone'].split('\n')) {
                                if (!phone) {
                                    continue
                                }

                                const callIcon = createSpan('call')
                                callIcon.classList = 'material-symbols-outlined'

                                const phoneLink = document.createElement('a')
                                phoneLink.href = 'tel:' + phone
                                phoneLink.textContent = formatPhoneNumber(phone)

                                const phoneBlock = document.createElement('div')
                                phoneBlock.classList = 'phone'

                                if (/^\d+$/.test(phone)) {
                                    phoneBlock.append(callIcon, phoneLink)
                                } else {
                                    const phoneSpan = createSpan(phone)
                                    phoneSpan.classList = 'alternate'
                                    phoneBlock.append(phoneSpan)
                                }

                                phonesBlock.append(phoneBlock)
                            }
    
                            clientBlock.append(clientNameBlock, phonesBlock)
                        } else {
                            clientBlock.append(clientNameBlock)
                        }
    
                        return clientBlock
                    }
    
                    const cancelButton = createSpan('close')

                    if (loginInfo.title < 2 || loginInfo.employeeId === order.employeeId) {
                        cancelButton.classList = 'material-symbols-outlined'
                    } else {
                        cancelButton.style.visibility = 'hidden'
                    }

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
                        e.dataTransfer.setData('text/plain', order.id)
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
        }).catch(() => showMessage('error', 'Не вдалося завантажити календар'))

    clearInterval(orderCalendarIntervalId)
    
    orderCalendarIntervalId = setInterval(() => {
        for (const span of document.querySelectorAll('span.left:not(.delivered span.left)')) {
            if (!span.dataset.timeFrom) {
                continue
            }

            const timeLeft = convertMsToTime(new Date(span.dataset.date.replace('00', span.dataset.timeFrom.substring(0, 2)).replace('00', span.dataset.timeFrom.substring(3))) - new Date())
            
            if ('background' in timeLeft) {
                span.style.background = timeLeft.background
                span.textContent = timeLeft.text
            }
        }
    }, 60 * 1000)
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
    const order = document.getElementById(e.dataTransfer.getData('text/plain'))

    if (categories.item(index).contains(order)) {
        return
    }

    put(`Order/status/${order.id}/${index}`)
        .then(() => {
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
        })
        .catch(() => showMessage('error', 'Не вдалося змінити статус замовлення'))
}

const getPreviousCalendarWeek = () => {

}

const getNextCalendarWeek = () => {

}
