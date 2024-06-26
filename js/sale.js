let shiftId, checkoutClients, checkoutClientsSelect, clientsWithPhones, recalculateAction
let shifts, shiftsBlock, activeShiftIndex = 0
let saleProducts, saleFlavors, totalSum, labels, cart

const shiftModal = document.querySelector('.create-shift-modal')
const saleModal = document.querySelector('.create-sale-modal')
const saleOrderModal = document.querySelector('.create-sale-order-modal')
const cashRegisterOperationsModal = document.querySelector('.cash-register-operations-modal')

const initializeSaleScreen = () => {
    checkoutClients = document.querySelector('.checkout-clients')

    checkoutClients.querySelector('.clear-client').onpointerup = () => {
        $(checkoutClientsSelect).val('').select2(select2NoResults('Обрати клієнта'))
    }

    clientModal.querySelector('button').onpointerup = () => {
        const fullNameElement = clientModal.querySelector('.client-full-name')
        const fullName = fullNameElement.value.trim()

        if (!fullName) {
            showMessage('error', 'Введіть ПІБ клієнта')
            return
        }

        const payButton = clientModal.querySelector('button')
        payButton.disabled = true

        const birthDateElement = clientModal.querySelector('.client-birth-date')

        const client = {
            companyId: loginInfo.companyId,
            fullName,
            phone: clientModal.querySelector('.client-phone').value,
            email: clientModal.querySelector('.client-email').value,
            birthDate: birthDateElement.value ? new Date(birthDateElement.value) : null,
            isMale: clientModal.querySelector('input[type=radio]').checked,
            instagram: clientModal.querySelector('.client-instagram').value,
            comment: clientModal.querySelector('.client-comment').value
        }

        post('Client', client).then(response => {
            hideModalEnableButton(clientModal, payButton)
            showMessage('success', createSuccessMessage('клієнта'))
            const option = document.createElement('option')
            option.text = client.fullName + ' ' + client.phone.split('\n')[0]
            option.dataset.id = response
            option.dataset.name = client.fullName
            option.dataset.phone = client.phone
            option.dataset.bonusCash = 0
            checkoutClientsSelect.add(option)
        }).catch(() => {
            hideModalEnableButton(clientModal, payButton)
            showMessage('error', createErrorMessage('клієнта'))
        })
    }

    totalSum = document.querySelector('.to-pay .enter-value')
    shiftsBlock = document.querySelector('.shifts')
    shifts = JSON.parse(localStorage.getItem('shifts')) || []

    if (shifts.length) {
        document.querySelector('.empty-cart').style.display = 'none'
        document.querySelector('.add-shift').style.display = 'flex'

        document.querySelector('.cash-register-products .products').style.display = 'block'
        const saleProducts = document.querySelector('.cash-register-products .sale-products')
        shifts[shifts.length - 1].products.forEach(p => saleProducts.append(p.isFlavor ? createSaleFlavor(p) : createSaleProduct(p)))
        document.querySelector('.shopping-cart-total').textContent = shifts[shifts.length - 1].products.length
        document.querySelector('.cart-mobile span').textContent = shifts[shifts.length - 1].products.length
        activeShiftIndex = shifts.length - 1
        document.querySelector('.cash-register-products .products').style.display = shifts[activeShiftIndex].products.length ? 'block' : ''
    }

    updateTotalSum()
    shifts.forEach(createShift)

    get(`Order/products-flavors/${shiftId}`).then(response => {
        hidePageLoad()

        saleFlavors = response.flavors ? response.flavors.map(f => ({
            id: f.id,
            name: getFlavorName(f),
            imageData: f.imageData,
            totalProductCost: f.totalSum
        })) : []

        fillSaleFlavors(saleFlavors)
        saleProducts = response.products || []
        fillSaleProducts(saleProducts)
    })

    checkoutClientsSelect = checkoutClients.querySelector('select')
    
    get(`Client/phones/${loginInfo.companyId}`).then(response => {
        clientsWithPhones = response
        fillClientsSelect(clientsWithPhones)
        checkoutClientsSelect.value = ''
        $(checkoutClientsSelect).select2(select2NoResults('Обрати клієнта'))
    })

    const cartButton = document.querySelector('.sale-header .cart-mobile')
    cart = document.querySelector('.sale-panel-wrapper')

    const pressCartButton = display => {
        hideBodyOverflow()
        cart.style.display = display
    }

    cartButton.onpointerup = () => cart.style.display ? pressCartButton('') : pressCartButton('flex')
}

const showSaleInfo = e => {
    showPageLoad()

    get(`Shift/last/${loginInfo.employeeId}`).then(response => {
        get(`Label/${loginInfo.companyId}`)
            .then(response => labels = response)
            .catch(() => showMessage('error', getErrorMessage('мітки')))
        
        shiftId = response
        fillSelectedMenuItem(e)

        header.style.display = 'none'
        document.querySelector('main').classList.add('sale-padding')

        if (window.innerWidth > 900) {
            document.querySelectorAll('.main-menu span:last-child').forEach(i => i.style.display = 'none')
            document.querySelectorAll('.menu-item').forEach(i => i.style.width = 'fit-content')
            document.querySelector('.main-menu').classList.add('sale-padding')
            document.querySelectorAll('.sub-menu li').forEach(i => {
                i.classList.add('sale-padding')
                i.style.color = 'rgb(204, 85, 0)'
                i.querySelector('div').style.justifyContent = 'center'
                i.querySelector('div span').style.fontWeight = 'bold'
            })
        }

        main.innerHTML = menuItemsContents['sale']

        if (response) {
            initializeSaleScreen()
            return
        }

        hidePageLoad()
        shiftModal.style.display = 'flex'

        get(`CashRegister/ids-names/${loginInfo.companyId}`).then(response => {
            hideBodyOverflow()
            const cashRegistersSelect = shiftModal.querySelector('select')

            for (const cashRegister of response) {
                const option = document.createElement('option')
                option.text = cashRegister.name
                option.dataset.id = cashRegister.id
                cashRegistersSelect.append(option)
            }
            
            cashRegistersSelect.value = ''
            $(cashRegistersSelect).select2(select2NoSearch('Обрати касу'))
        })
    }).catch(e => {
        hidePageLoad()
        
        if (e.message.startsWith('403')) {
            const employee = JSON.parse(e.message.substring(3))
            showMessage('error', `Зміна відкрита співробітником\n${employee.email} (${employee.fullName})`)
            return
        }

        showMessage('error', getErrorMessage('зміну'))
    })
}

const createEmployeeShift = () => {
    const cashRegister = shiftModal.querySelector('select')

    if (!cashRegister.value) {
        showMessage('error', 'Оберіть касу')
        return
    }

    const cash = shiftModal.querySelector('.enter-value')

    if (!cash.textContent) {
        showMessage('error', 'Внесіть готівку')
        return
    }

    const payButton = shiftModal.querySelector('button:last-child')
    payButton.disabled = true

    const shift = {
        cashRegisterId: cashRegister.selectedOptions[0].dataset.id,
        cash: +cash.textContent,
        employeeId: loginInfo.employeeId,
        start: new Date()
    }

    post('Shift', shift).then(response => {
        showPageLoad()
        hideModalEnableButton(shiftModal, payButton)
        shiftId = response
        initializeSaleScreen()
        showMessage('success', 'Ви почали зміну')
    }).catch(() => {
        hideModalEnableButton(shiftModal, payButton)
        showMessage('Сталася помилка при спробі відкрити зміну')
    })
}

const createSaleModal = () => {
    if (!shifts || !shifts.length || !shifts[activeShiftIndex].products.length) {
        showMessage('error', 'Ви не додали жодного товару')
        return
    }

    saleModal.querySelector('input[name=pay-type]').checked = true
    saleModal.querySelector('.sale-checkout').style.display = 'flex'
    saleModal.querySelector('.sale-checkout').classList.remove('free-terminal')
    saleModal.querySelector('.sale-checkout .sale-change').style.display = ''
    hideBodyOverflow()
    saleModal.style.display = 'flex'

    const paidSumInput = saleModal.querySelector('.sale-checkout input')
    paidSumInput.value = ''
    paidSumInput.oninput = () => {
        const paidSum = +paidSumInput.value
        const changeBlock = saleModal.querySelector('.sale-checkout .sale-change')

        changeBlock.style.display = paidSum > +totalSum.textContent ? 'flex' : 'none'
        changeBlock.querySelector('.change').textContent = (paidSum - +totalSum.textContent).toFixed(2)
    }

    saleModal.querySelectorAll('.payment label').forEach(l => l.onpointerup = () => {
        const isCash = l.querySelector('input').value === 'Готівка'
        const saleCheckout = saleModal.querySelector('.sale-checkout')
        
        if (isCash) {
            saleCheckout.classList.remove('free-terminal')
        } else {
            saleCheckout.classList.add('free-terminal')
        }
    })
}

const payTypeToIndex = {
    'Готівка': 0,
    'Термінал': 1,
    'Безкоштовно': 2
}

const createSale = () => {
    const checkoutClient = checkoutClients.querySelector('select').selectedOptions[0]
    const clientId = checkoutClient ? +checkoutClient.dataset.id : null

    let customerName = ''
    let customerPhone = ''

    if (checkoutClient) {
        customerName = checkoutClient.dataset.name
        customerPhone = checkoutClient.dataset.phone
    }

    const totalSumValue = +totalSum.textContent
    const payType = payTypeToIndex[saleModal.querySelector('input[name=pay-type]:checked').value]
    const paidSum = +saleModal.querySelector('.sale-checkout input').value || 0

    if (paidSum < totalSumValue && payType === 0) {
        showMessage('error', 'Недостатньо готівки для оплати')
        return
    }

    const payButton = saleModal.querySelector('button')
    payButton.disabled = true

    const sale = {
        companyId: loginInfo.companyId,
        shiftId,
        clientId,
        customerName,
        customerPhone,
        flavors: shifts[activeShiftIndex].products.filter(p => p.isFlavor).map(f => ({ flavorId: f.id })),
        products: shifts[activeShiftIndex].products.filter(p => !p.isFlavor).map(p => ({
            productId: p.id,
            amount: p.shiftAmount,
            sum: p.totalProductCost
        })),
        totalSum: totalSumValue,
        payType,
        paidSum
    }

    post('Order', sale).then(() => {
        closeShift()
        hideModalEnableButton(saleModal, payButton)
        hideModal(cart)
        showMessage('success', 'Продано')
    }).catch(() => {
        hideModalEnableButton(saleModal, payButton)
        showMessage('error', 'Не вдалося продати')
    })
}

const selectOrderType = b => {
    imageData = ''
    saleOrderModal.querySelectorAll('img').forEach(i => i.src = EMPTY_IMAGE_URL)

    const buttons = saleOrderModal.querySelectorAll('.sale-order-type span')

    buttons.forEach(b => {
        b.style.background = '#fff'
        b.style.color = '#000'
    })

    b.style.background = 'rgb(40, 40, 40)'
    b.style.color = 'rgb(245, 245, 245)'

    const labelsBlock = saleOrderModal.querySelector('.sale-order-labels')
    labelsBlock.innerHTML = ''
    labelsBlock.style.display = 'flex'
    
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

    const paymentIcons = saleOrderModal.querySelectorAll('.payment-content li span:first-child')
    paymentIcons.forEach(pi => pi.parentNode.classList.remove('active-payment-type'))
    paymentIcons.item(0).parentNode.classList.add('active-payment-type')

    paymentIcons.forEach(paymentIcon => paymentIcon.onpointerup = () => {
        paymentIcons.forEach(pi => pi.parentNode.classList.remove('active-payment-type'))
        paymentIcon.parentNode.classList.add('active-payment-type')
    })

    saleOrderModal.querySelectorAll('input:not(input[type=radio])').forEach(i => i.value = '')
    saleOrderModal.querySelectorAll('.enter-time-value span:first-child').forEach(t => t.textContent = '--:--')
    saleOrderModal.querySelectorAll('textarea').forEach(t => t.value = '')

    const saleOrderProducts = saleOrderModal.querySelector('.sale-order-products')
    const checkout = saleOrderModal.querySelector('.sale-order-checkout')
    const payment = saleOrderModal.querySelector('.payment')

    saleOrderProducts.style.display = 'flex'
    checkout.style.display = 'flex'
    payment.style.display = 'flex'

    const fillClientInfo = saleOrderType => {
        const checkoutClient = checkoutClients.querySelector('select').selectedOptions[0]
        const cashBackBlock = payment.querySelector('.cashback')
        const cashBlock = payment.querySelector('.cash')

        if (checkoutClient) {
            cashBackBlock.style.display = ''
            cashBlock.querySelector('ul').style.margin = ''
        } else {
            cashBackBlock.style.display = 'none'
            cashBlock.querySelector('ul').style.margin = 'auto'
            return
        }

        if (!checkoutClient) {
            return
        }

        let customerName = checkoutClient.dataset.name

        const customerInfo = saleOrderModal.querySelector(`#${saleOrderType}-customer-recipient-info`)
        customerInfo.querySelector('.sale-order-customer-name').value = customerName
        customerInfo.querySelector('.sale-order-customer-phone').value = checkoutClient.dataset.phone

        const clientInfo = saleOrderModal.querySelector('.cashback')
        clientInfo.querySelector('.client span:last-child').textContent = checkoutClient.dataset.name
        clientInfo.querySelector('.balance span:last-child').textContent = (+checkoutClient.dataset.bonusCash).toFixed(2) + ' грн'
    }

    const deliveryBlocks = saleOrderModal.querySelectorAll('[id^=delivery]')
    const pickupBlocks = saleOrderModal.querySelectorAll('[id^=pickup]')

    if (b.textContent === 'Доставка') {
        deliveryBlocks.forEach(b => b.style.display = 'flex')
        pickupBlocks.forEach(b => b.style.display = 'none')
        fillClientInfo('delivery')
        return
    }

    deliveryBlocks.forEach(b => b.style.display = 'none')
    pickupBlocks.forEach(b => b.style.display = 'flex')
    fillClientInfo('pickup')
}

const createSaleOrderModal = () => {
    if (!shifts || !shifts.length || !shifts[activeShiftIndex].products.length) {
        showMessage('error', 'Ви не додали жодного товару')
        return
    }

    hideBodyOverflow()

    saleOrderModal.querySelector('span').style.visibility = localStorage.getItem('saved-order') ? '' : 'hidden'
    saleOrderModal.querySelector('.free-payment input').checked = false
    saleOrderModal.querySelector('.payment-content').classList.remove('free-payment')
    saleOrderModal.style.display = 'flex'
    const buttons = saleOrderModal.querySelectorAll('.sale-order-type span')

    buttons.forEach(b => {
        b.style.background = '#fff'
        b.style.color = '#000'
    })

    const labelsBlock = saleOrderModal.querySelector('.sale-order-labels')
    const deliveryBlocks = saleOrderModal.querySelectorAll('[id^=delivery]')
    const pickupBlocks = saleOrderModal.querySelectorAll('[id^=pickup]')

    labelsBlock.style.display = 'none'
    deliveryBlocks.forEach(b => b.style.display = 'none')
    pickupBlocks.forEach(b => b.style.display = 'none')

    const saleOrderProducts = saleOrderModal.querySelector('.sale-order-products')
    const checkout = saleOrderModal.querySelector('.sale-order-checkout')
    const payment = saleOrderModal.querySelector('.payment')

    saleOrderProducts.style.display = 'none'
    checkout.style.display = 'none'
    payment.style.display = 'none'
    
    buttons.forEach(b => b.onpointerup = () => selectOrderType(b))

    const orderProducts = saleOrderModal.querySelector('table')
    orderProducts.innerHTML = orderProducts.querySelector('tbody').innerHTML

    for (const product of shifts[activeShiftIndex].products) {
        const tr = document.createElement('tr')
        tr.append(
            createTd(product.name),
            createTd(product.shiftAmount),
            createTd(product.totalProductCost.toFixed(2) + ' грн'),
        )
        orderProducts.append(tr)
    }

    saleOrderModal.querySelector('.sale-order-total-sum span:last-child').textContent = (+totalSum.textContent).toFixed(2) + ' грн'

    const paymentContent = saleOrderModal.querySelector('.payment-content')
    const freePaymentCheckbox = saleOrderModal.querySelector('.free-payment input')
    freePaymentCheckbox.onclick = () => freePaymentCheckbox.checked ? paymentContent.classList.add('free-payment') : paymentContent.classList.remove('free-payment')

    saleOrderModal.querySelector('button').onpointerup = () => {
        const saleOrderType = buttons.item(0).style.background === 'rgb(40, 40, 40)' ? 'delivery' : 'pickup'
        createSaleOrder(saleOrderType)
    }
}

const createSaleOrder = saleOrderType => {
    const dateInfo = saleOrderModal.querySelector(`#${saleOrderType}-date`)
    const dateElement = dateInfo.querySelector('.sale-order-date-date')

    if (!dateElement.value) {
        showMessage('error', 'Вкажіть дату замовлення')
        return
    }

    const clientOption = checkoutClients.querySelector('select').selectedOptions[0]
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

    const customerInfo = saleOrderModal.querySelector(`#${saleOrderType}-customer-recipient-info`)
    const customerNameElement = customerInfo.querySelector('.sale-order-customer-name')

    if (!customerNameElement.value) {
        showMessage('error', 'Вкажіть замовника')
        return
    }

    const customerName = customerNameElement.value.trim()
    const customerPhone = readTwoPhones(customerInfo)

    let recipientName, recipientPhone
    if (saleOrderType === 'delivery') {
        recipientName = customerInfo.querySelector('.sale-order-recipient-name').value.trim()
        recipientPhone = readTwoPhones(customerInfo, 'last')
    }

    if (customerPhone === null || recipientPhone === null) {
        showMessage('error', 'Невірний формат номеру')
        return
    }

    const addressElement = saleOrderModal.querySelector('.sale-order-address')

    if (saleOrderType === 'delivery' && !addressElement.value) {
        showMessage('error', 'Введіть адресу доставки')
        return
    }

    const paidBonusSum = +saleOrderModal.querySelector('.cashback input').value || 0
    const checkoutClient = checkoutClients.querySelector('select').selectedOptions[0]

    if (checkoutClient && paidBonusSum > +checkoutClient.dataset.bonusCash) {
        showMessage('error', 'Клієнт не має стільки бонусів на рахунку')
        return
    }
    
    if (paidBonusSum > +totalSum.textContent / 2) {
        showMessage('error', 'Сума бонусів не може перевищувати половину суми замовлення')
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

    const payButton = saleOrderModal.querySelector('button')
    payButton.disabled = true

    const order = {
        companyId: loginInfo.companyId,
        imageData,
        labels: [...saleOrderModal.querySelectorAll('.sale-order-label')]
            .filter(l => l.style.outlineColor === l.style.background)
            .map(l => ({ labelId: +l.dataset.id })),
        shiftId,
        clientId,
        date,
        timeFromString: timeFrom,
        timeTillString: timeTill,
        customerName,
        customerPhone,
        recipientName,
        recipientPhone,
        address: addressElement.value.trim(),
        comment: saleOrderModal.querySelector(`#${saleOrderType}-comment textarea`).value.trim(),
        flavors: shifts[activeShiftIndex].products.filter(p => p.isFlavor).map(f => ({ flavorId: f.id })),
        products: shifts[activeShiftIndex].products.filter(p => !p.isFlavor).map(p => ({
            productId: p.id,
            amount: p.shiftAmount,
            sum: p.totalProductCost
        })),
        totalSum: totalSum.textContent,
        payType: saleOrderModal.querySelector('.free-payment input').checked ?
            2 :
            saleOrderModal.querySelector('.payment-content li').classList.contains('active-payment-type') ? 0 : 1,
        paidBonusSum,
        paidSum: +saleOrderModal.querySelector('.cash input').value || 0
    }

    post('Order', order).then(() => {
        hideModalEnableButton(saleOrderModal, payButton)
        hideModal(cart)
        closeShift()
        showMessage('success', createSuccessMessage('замовлення'))
    }).catch(() => {
        hideModalEnableButton(saleOrderModal, payButton)
        showMessage('error', createErrorMessage('замовлення'))
    })
}

const calculateSaleTotalSum = () => shifts[activeShiftIndex].products.reduce((total, current) => total + current.totalProductCost, 0)
const updateTotalSum = () => totalSum.textContent = shifts.length ? calculateSaleTotalSum().toFixed(2) : '0.00'

const setActiveButton = button => {
    for (const button of document.querySelectorAll('.shifts button')) {
        button.style.background = 'rgb(250, 250, 250)'
        button.style.color = 'rgb(20, 20, 20)'
        button.querySelector('span:last-child').style.display = 'none'
        button.style.width = '4.6rem'
    }

    if (!button) {
        return
    }

    button.style.background = 'rgb(20, 20, 20)'
    button.style.color = 'rgb(240, 240, 240)'
    button.style.width = '5.2rem'

    if (button.children.length) {
        button.querySelector('span:last-child').style.display = ''
    }
}

const closeShift = (updateSaleWindow = true) => {
    if (updateSaleWindow) {
        document.querySelector('.search-sale-product').value = ''
        document.querySelector('.sale-products').innerHTML = ''

        fillSaleFlavors(saleFlavors, true)
        fillSaleProducts(saleProducts, true)
        
        const saleFlavorsNodes = document.querySelectorAll('.sale-content .sale-flavor')
        const saleProductsNodes = document.querySelectorAll('.sale-content .sale-product')

        for (const product of shifts[activeShiftIndex].products) {
            if (product.isFlavor) {
                for (const saleFlavor of saleFlavorsNodes) {
                    if (saleFlavor.querySelector('.sale-flavor-name span:last-child').textContent === product.name) {
                        saleFlavor.remove()
                        break
                    }
                }
            } else {
                for (const saleProduct of saleProductsNodes) {
                    if (saleProduct.querySelector('.sale-product-name').textContent === product.name) {
                        let amount = saleProduct.querySelector('.sale-product-amount-price span').textContent
                        const spaceIndex = amount.indexOf(' ')
                        amount = Math.round((+amount.substring(0, spaceIndex) - product.shiftAmount) * 100) / 100 + amount.substring(spaceIndex)
                        saleProduct.querySelector('.sale-product-amount-price span').textContent = amount
                        break
                    }
                }
            }
        }
    }

    let activeShiftButton

    for (const button of document.querySelectorAll('.shifts button')) {
        if (button.style.background === 'rgb(20, 20, 20)') {
            activeShiftButton = button
            break
        }
    }

    activeShiftButton.remove()
    activeShiftButton.onpointerup = () => {}
    shifts.splice(activeShiftIndex, 1)
    localStorage.setItem('shifts', JSON.stringify(shifts))

    if (activeShiftIndex > 0) {
        activeShiftIndex--
    }

    const saleProductsScreen = document.querySelector('.cash-register-products .sale-products')
    saleProductsScreen.innerHTML = ''

    if (shifts.length) {
        setActiveButton(document.querySelectorAll('.shifts button').item(activeShiftIndex))
        shifts[activeShiftIndex].products.forEach(p => saleProductsScreen.append(p.isFlavor ? createSaleFlavor(p) : createSaleProduct(p)))
        document.querySelector('.shopping-cart-total').textContent = shifts[activeShiftIndex].products.length
        document.querySelector('.cart-mobile span').textContent = shifts[activeShiftIndex].products.length
        document.querySelector('.cash-register-products .products').style.display = shifts[activeShiftIndex].products.length ? 'block' : ''
        updateTotalSum()
        return
    }

    document.querySelector('.empty-cart').style.display = 'flex'
    document.querySelector('.add-shift').style.display = 'none'
    document.querySelector('.products').style.display = 'none'
    updateTotalSum()
    document.querySelector('.cart-mobile span').textContent = '0'
}

const createShift = (shift = null, product = null) => {
    const timeSpan = document.createElement('span')
    const date = new Date()

    const time = `${padTime(date.getHours())}:${padTime(date.getMinutes())}`

    if (shift) {
        timeSpan.textContent = shift.time
    } else {
        timeSpan.textContent = time
        shifts.push({ time, products: [] })

        if (product) {
            shifts[shifts.length - 1].products.push(product)
        }

        localStorage.setItem('shifts', JSON.stringify(shifts))
    }

    const close = document.createElement('span')
    close.classList = 'material-symbols-outlined'
    close.textContent = 'close'

    close.onpointerup = () => {
        if (!shifts[activeShiftIndex].products.length) {
            closeShift(false)
            return
        }

        if (shifts[activeShiftIndex].products.length) {
            showConfirm('Видалити продаж?', () => {
                closeShift(false)
                setTimeout(() => hideModal(confirmModal), 1)
            })
        }
    }

    const button = document.createElement('button')
    button.classList = 'shift'
    setActiveButton(button)

    button.onpointerup = () => {
        setActiveButton(button)
        let index = 0

        for (const button of document.querySelectorAll('.shifts button')) {
            if (button.style.background === 'rgb(20, 20, 20)') {
                activeShiftIndex = index
                break
            }

            index++
        }

        const saleProducts = document.querySelector('.cash-register-products .sale-products')
        saleProducts.innerHTML = ''
        shifts[activeShiftIndex].products.forEach(p => saleProducts.append(p.isFlavor ? createSaleFlavor(p) : createSaleProduct(p)))
        document.querySelector('.shopping-cart-total').textContent = shifts[activeShiftIndex].products.length
        document.querySelector('.cart-mobile span').textContent = shifts[activeShiftIndex].products.length
        document.querySelector('.cash-register-products .products').style.display = shifts[activeShiftIndex].products.length ? 'block' : ''
        
        updateTotalSum()
    }

    button.append(timeSpan, close)
    shiftsBlock.insertBefore(button, document.querySelector('.add-shift'))
}

const createSaleFlavor = flavor => {
    const saleFlavorName = document.createElement('span')
    saleFlavorName.textContent = flavor.name

    const saleFlavorNameBlock = document.createElement('div')
    saleFlavorNameBlock.classList = 'sale-flavor-name'

    saleFlavorNameBlock.append(createFlavorIcon(), saleFlavorName)

    const saleFlavorCost = document.createElement('div')
    saleFlavorCost.classList = 'sale-flavor-cost'
    saleFlavorCost.append(createSpan(flavor.totalProductCost.toFixed(2)))

    const saleFlavorHeader = document.createElement('div')
    saleFlavorHeader.classList = 'sale-flavor-header'
    saleFlavorHeader.append(saleFlavorNameBlock, saleFlavorCost)

    const saleFlavor = document.createElement('div')
    saleFlavor.classList = 'sale-flavor'
    saleFlavor.append(saleFlavorHeader)

    const removeFlavor = document.createElement('span')
    removeFlavor.classList = 'material-symbols-outlined'
    removeFlavor.textContent = 'remove_circle_outline'

    removeFlavor.onpointerup = e => {
        e.target.parentNode.remove()
        shifts[activeShiftIndex].products.splice(shifts[activeShiftIndex].products.findIndex(f => f.isFlavor && f.id === flavor.id), 1)
        localStorage.setItem('shifts', JSON.stringify(shifts))
        document.querySelector('.shopping-cart-total').textContent = shifts[activeShiftIndex].products.length
        document.querySelector('.cart-mobile span').textContent = shifts[activeShiftIndex].products.length
        updateTotalSum()
    }

    const saleFlavorContent = document.createElement('div')
    saleFlavorContent.classList = 'sale-product-content'
    saleFlavorContent.append(saleFlavor, removeFlavor)

    return saleFlavorContent
}

let previousSaleSpan, previousSalePrice

const createSaleProduct = product => {
    const saleProductName = document.createElement('div')
    saleProductName.classList = 'sale-product-name'
    saleProductName.textContent = product.name

    const saleProductCost = document.createElement('div')
    saleProductCost.classList = 'sale-product-cost'

    const editSellingPrice = createSpan('edit')
    editSellingPrice.classList = 'material-symbols-outlined'

    if (product.changedCost) {
        editSellingPrice.classList.add('changed-price')
    }

    editSellingPrice.onpointerup = () => {
        if (editSellingPrice.classList.contains('changed-price')) {
            editSellingPrice.classList.remove('changed-price')
            productSellingCost.textContent = product.sellingCost
            const totalCost = +input.value * product.sellingCost
            spans.item(5).textContent = totalCost.toFixed(2)
            product.changedCost = null
            updateShiftProduct(product.id, +input.value, +input.value * product.sellingCost)
            return
        }

        editSellingPrice.classList.add('changed-price')
        previousSaleSpan = productSellingCost
        previousSalePrice = productSellingCost.textContent
        productSellingCost.textContent = ''

        createCalculatorValueSpan(productSellingCost)

        recalculateAction = () => {
            const totalCost = +input.value * +spans.item(1).textContent
            spans.item(5).textContent = totalCost.toFixed(2)
            const changedCost = +spans.item(1).textContent === product.sellingCost ? null : +spans.item(1).textContent
            product.changedCost = changedCost
            updateShiftProduct(product.id, +input.value, totalCost, changedCost)

            if (+spans.item(1).textContent === product.sellingCost) {
                editSellingPrice.classList.remove('changed-price')
            } else {
                editSellingPrice.classList.add('changed-price')
            }
        }
    }
    
    const productSellingCost = createSpan(product.changedCost ? product.changedCost.toFixed(2) : product.sellingCost.toFixed(2))

    saleProductCost.append(
        editSellingPrice,
        productSellingCost,
        createSpan(' x '),
        createSpan(),
        createSpan(' = '),
        createSpan()
    )

    const saleProductHeader = document.createElement('div')
    saleProductHeader.classList = 'sale-product-header'
    saleProductHeader.append(saleProductName, saleProductCost)

    const spans = saleProductCost.querySelectorAll('span')
    spans.item(3).textContent = product.shiftAmount || product.shiftAmount === 0 ? product.shiftAmount : 1
    spans.item(5).textContent = product.totalProductCost || product.totalProductCost === 0 ? product.totalProductCost.toFixed(2) : product.sellingCost.toFixed(2)

    const input = document.createElement('input')
    input.oninput = () => {
        spans.item(3).textContent = input.value

        const totalCost = +input.value * (product.changedCost || product.sellingCost)
        spans.item(5).textContent = totalCost.toFixed(2)

        updateShiftProduct(product.id, +input.value, totalCost, product.changedCost === product.sellingCost ? null : product.changedCost)
    }
    input.value = product.shiftAmount || product.shiftAmount === 0 ? product.shiftAmount : '1'
    input.type = 'number'
    input.min = '0'
    input.max = '9999'
    input.inputMode = 'decimal'

    const updateShiftProduct = (id, amount, totalCost, changedCost) => {
        const currentShift = shifts[activeShiftIndex]

        for (const product of currentShift.products) {
            if (product.id === id) {
                product.shiftAmount = amount
                product.totalProductCost = totalCost
                product.changedCost = changedCost
                break
            }
        }

        shifts[activeShiftIndex] = currentShift
        updateTotalSum()
        localStorage.setItem('shifts', JSON.stringify(shifts))
    }

    const decreaseButton = document.createElement('button')
    decreaseButton.onpointerup = () => {
        const value = +input.value

        if (value === 0) {
            return
        }

        input.value = value > 0 && value < 1 ? '0' : +input.value - 1
        spans.item(3).textContent = input.value

        const totalCost = input.value === '0' ? 0 : (+spans.item(5).textContent - (product.changedCost || product.sellingCost)).toFixed(2)
        spans.item(5).textContent = totalCost

        updateShiftProduct(product.id, +input.value, +totalCost, product.changedCost === product.sellingCost ? null : product.changedCost)
    }
    decreaseButton.textContent = '-'
    
    const increaseButton = document.createElement('button')
    increaseButton.onpointerup = () => {
        const value = +input.value

        if (value === 9999) {
            return
        }

        input.value = value > 9998 && value < 9999 ? '9999' : +input.value + 1
        spans.item(3).textContent = input.value

        const totalCost = input.value === '9999' ? (product.sellingCost * 9999).toFixed(2) : (+spans.item(5).textContent + (product.changedCost || product.sellingCost)).toFixed(2)
        spans.item(5).textContent = totalCost

        updateShiftProduct(product.id, +input.value, +totalCost, product.changedCost === product.sellingCost ? null : product.changedCost)
    }
    increaseButton.textContent = '+'

    const saleProductButtons = document.createElement('div')
    saleProductButtons.classList = 'sale-product-buttons'
    saleProductButtons.append(decreaseButton, input, increaseButton)

    const saleProduct = document.createElement('div')
    saleProduct.classList = 'sale-product'
    saleProduct.append(saleProductHeader, saleProductButtons)

    const removeProduct = document.createElement('span')
    removeProduct.classList = 'material-symbols-outlined'
    removeProduct.textContent = 'remove_circle_outline'

    removeProduct.onpointerup = e => {
        e.target.parentNode.remove()
        shifts[activeShiftIndex].products.splice(shifts[activeShiftIndex].products.findIndex(p => p.id === product.id), 1)
        localStorage.setItem('shifts', JSON.stringify(shifts))
        document.querySelector('.shopping-cart-total').textContent = shifts[activeShiftIndex].products.length
        document.querySelector('.cart-mobile span').textContent = shifts[activeShiftIndex].products.length
        updateTotalSum()
    }

    const saleProductContent = document.createElement('div')
    saleProductContent.classList = 'sale-product-content'
    saleProductContent.append(saleProduct, removeProduct)

    return saleProductContent
}

const productIndexToShortUnit = {
    0: 'шт',
    1: 'кг',
    2: 'м'
}

const createFlavorIcon = () => {
    const flavorIcon = document.createElement('span')
    flavorIcon.classList = 'material-symbols-outlined'
    flavorIcon.textContent = 'local_florist'
    return flavorIcon
}

const animateCartProduct = (cartProduct, name) => {
    const isMobile = window.innerWidth < 700

    const rect = cartProduct.getBoundingClientRect()
    const animateProduct = document.querySelector('.animate-cart-product')
    animateProduct.textContent = name
    animateProduct.style.width = (isMobile ? rect.width / 2 : rect.width) + 'px'
    animateProduct.style.height = rect.height + 'px'
    animateProduct.style.display = 'flex'

    animateProduct.style.left = (isMobile ? rect.left + rect.width / 2 : rect.left) + 'px'
    animateProduct.style.top = rect.top + 'px'

    const duration = 250

    const cart = document.querySelector(isMobile ? '.cart-mobile' : '.sale-panel').getBoundingClientRect()
    const scaleCart = document.querySelector(isMobile ? '.cart-mobile span:last-child' : '.products-header span')

    animateProduct.animate([
        { left: rect.left + 'px', top: rect.top + 'px' },
        { left: cart.left + 'px', top: (isMobile ? cart.top : (cart.top + cart.height) / 2) + 'px' }
    ], duration)

    setTimeout(() => scaleCart.animate([
        { transform: 'scale(1)', opacity: '.3' },
        { transform: 'scale(1.4)', opacity: '1' }
    ], 150), duration - 100)

    setTimeout(() => animateProduct.style.display = '', duration - 20)
}

const addSaleFlavor = (saleFlavor, flavor) => {
    saleFlavor.classList.add('selected')
    let isNewShift = false

    if (!shifts.length) {
        isNewShift = true

        createShift(null, {
            id: flavor.id,
            name: flavor.name,
            totalProductCost: flavor.totalProductCost,
            isFlavor: true
        })
    }

    document.querySelector('.empty-cart').style.display = 'none'
    document.querySelector('.add-shift').style.display = 'flex'
    document.querySelector('.cash-register-products .products').style.display = 'block'

    const saleProducts = document.querySelector('.cash-register-products .sale-products')

    for (const saleFlavor of saleProducts.querySelectorAll('.sale-flavor')) {
        if (saleFlavor.querySelector('.sale-flavor-name span:last-child').textContent === flavor.name) {
            return
        }
    }

    animateCartProduct(saleFlavor, flavor.name)
    saleProducts.append(createSaleFlavor(flavor))
    const shoppingCartTotal = document.querySelector('.shopping-cart-total')
    const productsNumber = document.querySelectorAll('.products .sale-product, .products .sale-flavor').length
    shoppingCartTotal.textContent = productsNumber
    document.querySelector('.cart-mobile span').textContent = productsNumber

    if (!isNewShift) {
        shifts[activeShiftIndex].products.push({
            id: flavor.id,
            name: flavor.name,
            totalProductCost: flavor.totalProductCost,
            isFlavor: true
        })
    }

    localStorage.setItem('shifts', JSON.stringify(shifts))
    updateTotalSum()
}

const fillSaleFlavors = (saleFlavors, reshow = false) => {
    document.querySelector('.sale-products').innerHTML = ''

    for (const flavor of saleFlavors) {
        const flavorName = document.createElement('span')
        flavorName.textContent = flavor.name

        const flavorNameBlock = document.createElement('div')
        flavorNameBlock.classList = 'sale-flavor-name'
        flavorNameBlock.append(createFlavorIcon(), flavorName)

        const flavorPrice = document.createElement('span')
        flavorPrice.textContent = flavor.totalProductCost.toFixed(2) + ' грн'

        const flavorPriceBlock = document.createElement('div')
        flavorPriceBlock.classList = 'sale-flavor-price'
        flavorPriceBlock.append(flavorPrice)

        const addProductIcon = createSpan('add')
        addProductIcon.classList = 'material-symbols-outlined add-product-icon'
        addProductIcon.onpointerup = () => addSaleFlavor(saleFlavor, flavor)

        const div = document.createElement('div')
        div.append(flavorNameBlock, flavorPriceBlock, addProductIcon)

        const saleFlavor = document.createElement('div')
        saleFlavor.classList = 'sale-flavor'
        saleFlavor.append(div)
        saleFlavor.dataset.imageData = flavor.imageData || ''

        saleFlavor.onpointerup = () => {
            if (window.innerWidth < 700) {
                return
            }

            addSaleFlavor(saleFlavor, flavor)
        }

        document.querySelector('.sale-products').append(saleFlavor)
    }

    if (reshow) {
        showFlowerImages()
    }
}

const addSaleProduct = (saleProduct, product) => {
    animateCartProduct(saleProduct, product.name)
    let isNewShift = false

    if (!shifts.length) {
        isNewShift = true

        createShift(null, {
            id: product.id,
            name: product.name,
            sellingCost: product.sellingCost,
            shiftAmount: 1,
            totalProductCost: product.sellingCost
        })
    }

    document.querySelector('.empty-cart').style.display = 'none'
    document.querySelector('.add-shift').style.display = 'flex'
    document.querySelector('.cash-register-products .products').style.display = 'block'

    const saleProducts = document.querySelector('.cash-register-products .sale-products')

    for (const saleProduct of saleProducts.querySelectorAll('.sale-product')) {
        if (saleProduct.querySelector('.sale-product-name').textContent === product.name) {
            const input = saleProduct.querySelector('input')

            if (+input.value === 9999) {
                return
            }

            input.value = +input.value + 1
            const spans = saleProduct.querySelectorAll('.sale-product-cost span')
            spans.item(3).textContent = input.value

            const totalCost = +input.value * product.sellingCost
            spans.item(5).textContent = totalCost.toFixed(2)

            for (const shiftProduct of shifts[activeShiftIndex].products) {
                if (shiftProduct.id === product.id) {
                    shiftProduct.shiftAmount = +input.value
                    shiftProduct.totalProductCost = totalCost
                    break
                }
            }

            localStorage.setItem('shifts', JSON.stringify(shifts))
            updateTotalSum()
            return
        }
    }

    product.changedCost = null
    saleProducts.append(createSaleProduct(product))
    const shoppingCartTotal = document.querySelector('.shopping-cart-total')
    shoppingCartTotal.textContent = document.querySelectorAll('.products .sale-product').length
    document.querySelector('.cart-mobile span').textContent = document.querySelectorAll('.products .sale-product').length

    if (!isNewShift) {
        shifts[activeShiftIndex].products.push({
            id: product.id,
            name: product.name,
            sellingCost: product.sellingCost,
            shiftAmount: 1,
            totalProductCost: product.sellingCost
        })
    }

    localStorage.setItem('shifts', JSON.stringify(shifts))
    updateTotalSum()
}

const fillSaleProducts = (saleProducts, reshow = false) => {
    for (const product of saleProducts) {
        const productName = document.createElement('div')
        productName.classList = 'sale-product-name'
        productName.textContent = product.name

        const productAmount = document.createElement('span')
        productAmount.textContent = product.amount + ' ' + productIndexToShortUnit[product.unit]

        const productPrice = document.createElement('span')
        productPrice.textContent = product.sellingCost.toFixed(2) + ' грн'

        const productAmountPrice = document.createElement('div')
        productAmountPrice.classList = 'sale-product-amount-price'
        productAmountPrice.append(productAmount, productPrice)

        const addProductIcon = createSpan('add')
        addProductIcon.classList = 'material-symbols-outlined add-product-icon'
        addProductIcon.onpointerup = () => addSaleProduct(saleProduct, product)

        const div = document.createElement('div')
        div.append(productName, productAmountPrice, addProductIcon)

        const saleProduct = document.createElement('div')
        saleProduct.classList = 'sale-product'
        saleProduct.append(div)
        saleProduct.dataset.imageData = product.imageData || ''

        saleProduct.onpointerup = () => {
            if (window.innerWidth < 700) {
                return
            }

            addSaleProduct(saleProduct, product)
        }

        document.querySelector('.sale-products').append(saleProduct)
    }

    if (reshow) {
        showFlowerImages()
    }
}

const addShift = () => {
    createShift()
    activeShiftIndex = document.querySelectorAll('.shifts button').length - 1
    document.querySelector('.cash-register-products .sale-products').innerHTML = ''
    document.querySelector('.cash-register-products .products').style.display = ''
    updateTotalSum()
    document.querySelector('.cart-mobile span').textContent = '0'
}

const showFlowerImages = () => {
    const checkbox = document.querySelector('input[type=checkbox]')

    for (const saleProduct of document.querySelectorAll('.sale-products:first-child .sale-product, .sale-products:first-child .sale-flavor')) {
        if (checkbox.checked) {
            const img = document.createElement('img')
            img.src = saleProduct.dataset.imageData || EMPTY_IMAGE_URL
            saleProduct.insertBefore(img, saleProduct.firstChild)
            continue
        }

        const img = saleProduct.querySelector('img')

        if (img) {
            img.remove()
        }
    }
}

const searchSaleProductFlavor = e => {
    if (!saleFlavors && !saleProducts) {
        return
    }

    const saleProductsWindow = document.querySelector('.sale-products')
    saleProductsWindow.innerHTML = ''
    const searchQuery = e.target.value.trim().toLowerCase()

    const filteredSaleFlavors = saleFlavors.filter(f => f.name.toLowerCase().includes(searchQuery))
    const filteredSaleProducts = saleProducts.filter(p => p.name.toLowerCase().includes(searchQuery))

    if (!filteredSaleFlavors.length && !filteredSaleProducts.length) {
        saleProductsWindow.append(createEmptyDataDiv())
        return   
    }

    fillSaleFlavors(filteredSaleFlavors, true)
    fillSaleProducts(filteredSaleProducts, true)
}

const removeSaleCart = () => {
    document.querySelector('.cash-register-products .sale-products').innerHTML = ''
    document.querySelector('.shopping-cart-total').textContent = '0'
    document.querySelector('.cart-mobile span').textContent = '0'
    totalSum.textContent = '0.00'

    shifts[activeShiftIndex].products = []
    localStorage.setItem('shifts', JSON.stringify(shifts))
}

const operationNameToType = {
    'Внесення': 0,
    'Винесення': 1
}

const showCashRegisterOperations = () => {
    showPageLoad()

    const cashRegisterOperationTypes = document.querySelectorAll('.cash-register-operation-type div')

    cashRegisterOperationTypes.forEach(crot => crot.onpointerup = () => {
        if (crot.classList.contains('active')) {
            return
        }

        cashRegisterOperationTypes.forEach(crot => crot.classList.remove('active'))
        crot.classList.add('active')
    })

    get(`CashRegister/${shiftId}/revenue`).then(response => {
        hidePageLoad()

        const cashBlock = cashRegisterOperationsModal.querySelector('.cash-register-cash')
        cashBlock.querySelector('.form:first-child span:last-child').textContent = response.cash.toFixed(2) + ' грн'
        cashBlock.querySelector('.form:nth-child(2) span:not(.cash-register-sum span):last-child').textContent = response.cashRevenue.toFixed(2) + ' грн'
        cashBlock.querySelector('.form:nth-child(3) span:not(.cash-register-sum span):last-child').textContent = response.terminalRevenue.toFixed(2) + ' грн'
        cashBlock.querySelector('.form:last-child span:not(.cash-register-sum span):last-child').textContent = response.revenue.toFixed(2) + ' грн'

        cashRegisterOperationTypes.forEach(crot => crot.classList.remove('active'))
        cashRegisterOperationTypes.item(0).classList.add('active')
        cashRegisterOperationsModal.querySelector('.enter-value').textContent = ''

        const textarea = cashRegisterOperationsModal.querySelector('textarea')
        textarea.value = ''
        
        const iconTexts = ["Кур'єр", 'Сміття', 'Вода', 'Оренда приміщення', 'Розмін']
        document.querySelectorAll('.cash-register-comment-icons li').forEach((icon, i) => icon.onpointerup = () => textarea.value = iconTexts[i])

        hideBodyOverflow()
        cashRegisterOperationsModal.style.display = 'flex'
    }).catch(() => showMessage('error', getErrorMessage('касу')))
}

const performCashRegisterOperation = () => {
    let type = 0

    for (const operationType of cashRegisterOperationsModal.querySelectorAll('.cash-register-operation-type div')) {
        if (operationType.classList.contains('active')) {
            break
        }

        type++
    }
    
    if (type === 2) {
        showMessage('error', 'Операція недоступна')
        return
    }

    const sumInput = cashRegisterOperationsModal.querySelector('.enter-value')

    if (!sumInput.textContent) {
        showMessage('error', 'Введіть суму операції')
        return
    }

    const payButton = cashRegisterOperationsModal.querySelector('button')
    payButton.disabled = true

    const cashRegisterOperation = {
        shiftId,
        type,
        sum: +sumInput.textContent,
        comment: cashRegisterOperationsModal.querySelector('textarea').value.trim()
    }

    post('Shift/operation', cashRegisterOperation)
        .then(() => {
            hideModalEnableButton(cashRegisterOperationsModal, payButton)
            showMessage('success', 'Операція проведена')
        })
        .catch(e => {
            hideModalEnableButton(cashRegisterOperationsModal, payButton)

            if (e.message === '403') {
                showMessage('error', 'Недостатньо коштів у касі')
                return
            }

            showMessage('error', 'Помилка при проведенні операції')
        })
}

const endEmployeeShift = () => showConfirm('Закрити зміну?', () => put('Shift', { id: shiftId })
    .then(() => {
        setTimeout(() => hideModal(confirmModal), 1)
        showMessage('info', 'Зміну закрито')
        setTimeout(() => location.reload(), 1200)
    }).catch(() => showMessage('error', 'Сталася помилка при закритті зміни')))

const fillClientsSelect = clients => {
    checkoutClientsSelect.innerHTML = ''
            
    for (const client of clients) {
        const option = document.createElement('option')
        option.text = client.fullName + ' ' + client.phone.split('\n')[0]
        option.dataset.id = client.id
        option.dataset.name = client.fullName
        option.dataset.phone = client.phone
        option.dataset.bonusCash = client.bonusCash
        checkoutClientsSelect.add(option)
    }
}

const restoreOrder = () => {
    saleOrderModal.querySelector('span').style.visibility = 'hidden'
    const savedOrder = JSON.parse(localStorage.getItem('saved-order'))

    const buttons = saleOrderModal.querySelectorAll('.sale-order-type span')
    selectOrderType(buttons.item(savedOrder.type === 'delivery' ? 0 : 1))

    if (savedOrder.labels.length) {
        for (const label of saleOrderModal.querySelectorAll('.sale-order-label')) {
            if (+label.dataset.id === savedOrder.labels[0].labelId) {
                label.style.background = label.style.outlineColor
                label.style.color = savedOrder.labels[0].color
                label.style.boxShadow = 'rgba(0, 0, 0, .16) 0 3px 6px, rgba(0, 0, 0, .23) 0 3px 6px'
                break
            }
        }
    }

    const dateInfo = saleOrderModal.querySelector(`#${savedOrder.type}-date`)
    dateInfo.querySelector('.sale-order-date-date').value = savedOrder.date
    dateInfo.querySelector('.sale-order-date-time-from').textContent = savedOrder.timeFrom
    dateInfo.querySelector('.sale-order-date-time-till').textContent = savedOrder.timeTill

    const customerInfo = saleOrderModal.querySelector(`#${savedOrder.type}-customer-recipient-info`)
    customerInfo.querySelector('.sale-order-customer-name').value = savedOrder.customerName

    if (savedOrder.customerPhone) {
        const customerPhoneInputs = customerInfo.querySelectorAll(`.sale-order-info:first-child .phone-input input`)
        const customerPhones = savedOrder.customerPhone.split('\n')
        customerPhoneInputs.forEach((i, index) => i.value = customerPhones[index] ? formatPastedPhone(customerPhones[index]) : '')
    }

    if (savedOrder.type === 'delivery') {
        customerInfo.querySelector('.sale-order-recipient-name').value = savedOrder.recipientName
        saleOrderModal.querySelector('.sale-order-address').value = savedOrder.address

        if (savedOrder.recipientPhone) {
            const recipientPhoneInputs = customerInfo.querySelectorAll(`.sale-order-info:last-child .phone-input input`)
            const recipientPhones = savedOrder.recipientPhone.split('\n')
            recipientPhoneInputs.forEach((i, index) => i.value = recipientPhones[index] ? formatPastedPhone(recipientPhones[index]) : '')
        }        
    }

    saleOrderModal.querySelector(`#${savedOrder.type}-comment textarea`).value = savedOrder.comment

    if (savedOrder.payType !== 2) {
        const paymentIcons = saleOrderModal.querySelectorAll('.payment-content li span:first-child')
        paymentIcons.forEach(pi => pi.parentNode.classList.remove('active-payment-type'))
        paymentIcons.item(savedOrder.payType).parentNode.classList.add('active-payment-type')
        saleOrderModal.querySelector('.cash input').value = savedOrder.paidSum
    }

    localStorage.setItem('saved-order', '')
    showMessage('success', 'Замовлення відновлено з чернетки')
}
