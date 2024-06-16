let clientsTable, clients

const showClientInfo = e => {
    main.innerHTML = menuItemsContents['client']
    fillSelectedMenuItem(e)
    clientsTable = document.querySelector('.client-table table')

    if (loginInfo.title > 1) {
        const clientBonus = document.querySelector('.client-bonus')
        clientBonus.querySelector('button').remove()
    }

    get(`Client/${loginInfo.companyId}`).then(response => {
        clients = response.clients
        document.querySelector('.client-bonus input').value = response.discount

        if (response.clients.length) {
            clientsTable.style.display = 'block'
        }

        response.clients.forEach(fillClientsTable)
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('клієнтів')))
}

const setClientDiscount = () => {
    const discount = document.querySelector('.client-bonus input').value

    if (discount < 0 || discount > 100) {
        showMessage('error', 'Відсоток бонусів має бути між 0 та 100')
        return
    }

    const payButton = document.querySelector('.client-bonus button')
    payButton.disabled = true

    put(`Client/${loginInfo.companyId}/${discount}`)
        .then(() => {
            payButton.disabled = false
            showMessage('info', 'Новий відсоток обрано')
        })
        .catch(() => {
            payButton.disabled = false
            showMessage('error', 'Помилка при встановленні відсотка')
        })
}

const clientModal = document.querySelector('.create-client-modal')
const clientInfoModal = document.querySelector('.client-info-modal')
const clientModalContent = clientInfoModal.querySelector('.client-info-modal-content')

const createClientModal = (addCreateEvent = true) => {
    clientModal.querySelector('h1').textContent = 'Створити клієнта'
    clientModal.querySelectorAll('input').forEach(i => i.value = '')
    clientModal.querySelectorAll('textarea').forEach(t => t.value = '')
    clientModal.querySelector('input[type=radio]').checked = true

    if (addCreateEvent) {
        clientModal.querySelector('button').onpointerup = () => createClient()
    }
    
    hideBodyOverflow()
    clientModal.style.display = 'flex'
}

const formatInstagramLink = link => link[0] === '@' ? link.substring(1) : link

const createClientRow = client => {
    const editAction = createEditSpan('client')
    const deleteAction = createDeleteSpan('client')
    const actionsColumn = document.createElement('td')
    actionsColumn.classList = 'client-actions'
    actionsColumn.append(editAction, deleteAction)

    const tr = document.createElement('tr')
    tr.onpointerup = e => {
        const tagName = e.target.tagName.toLowerCase()
        if (tagName === 'a' || tagName === 'span') {
            return
        }

        showPageLoad()
        hideBodyOverflow()

        clientInfoModal.querySelector('.client-full-name').textContent = client.fullName
        const phoneBlock = clientInfoModal.querySelector('.client-phone')
        phoneBlock.innerHTML = ''

        if (client.phone) {
            phoneBlock.closest('div').style.display = ''

            for (const phone of client.phone.split('\n')) {
                const phoneLink = document.createElement('a')
                phoneLink.href = 'tel:' + phone
                phoneLink.textContent = formatPhoneNumber(phone)
                phoneBlock.append(phoneLink, document.createElement('br'))
            }
        } else {
            phoneBlock.closest('div').style.display = 'none'
        }

        showHideNodeInfo(clientInfoModal, 'client-email', client.email)
        showHideNodeInfo(clientInfoModal, 'client-birth-date', formatDate(client.birthDate, false, false))
        clientInfoModal.querySelector('.client-sex').textContent = client.isMale === null ? 'Без статі' : client.isMale ? 'Чоловік' : 'Жінка'

        const instagram = clientInfoModal.querySelector('.client-instagram')

        if (client.instagram) {
            instagram.parentNode.style.display = ''
            const link = document.createElement('a')
            link.textContent = formatInstagramLink(client.instagram)
            link.href = 'https://www.instagram.com/' + link.textContent
            link.target = 'blank'
            
            instagram.innerHTML = ''
            instagram.append(link)
        } else {
            instagram.parentNode.style.display = 'none'
        }

        showHideNodeInfo(clientInfoModal, 'client-comment', client.comment)
        clientInfoModal.querySelector('.client-bonus-cash').textContent = client.bonusCash.toFixed(2) + ' грн'

        get(`Client/${client.id}/orders`).then(response => {
            hidePageLoad()

            const ordersEmpty = clientInfoModal.querySelector('.orders-empty')
            const clientOrders = clientInfoModal.querySelector('.client-orders')

            clientModalContent.querySelectorAll('.order-arrows span').forEach(oe => oe.style.visibility = 'hidden')
            clientInfoModal.style.display = 'flex'
            clientModalContent.scroll(0, 0)

            if (!response.orders.length) {
                ordersEmpty.style.display = 'block'
                clientOrders.style.display = 'none'
                return
            }

            ordersEmpty.style.display = 'none'
            clientOrders.style.display = 'block'

            const clientOrdersTotalSum = clientInfoModal.querySelector('.client-orders-total-sum')
            clientOrdersTotalSum.querySelector('div').textContent = response.totalSum.toFixed(2) + ' грн'

            const ordersBlock = clientInfoModal.querySelector('.order-arrows')
            const orderArrows = ordersBlock.querySelectorAll('.order-arrows span')

            const toggleArrowsVisibility = (v1, v2) => {
                orderArrows.item(0).style.visibility = v1
                orderArrows.item(1).style.visibility = v2
            }

            const fillClientOrder = index => {
                if (index === undefined) {
                    index = 0
                } else {
                    animateChange(productsTable)
                }
                
                if (index === 0) {
                    toggleArrowsVisibility('hidden', 'visible')
                } else if (index > -1 && index < response.orders.length - 1) {
                    toggleArrowsVisibility('visible', 'visible')
                } else if (index === response.orders.length - 1) {
                    toggleArrowsVisibility('visible', 'hidden')
                }

                if (index < 0 || index > response.orders.length - 1) {
                    orderIndex = index < 0 ? 0 : response.orders.length - 1
                    return
                }

                productsTable.innerHTML = productsTable.querySelector('tbody').innerHTML

                for (const product of response.orders[index].products) {
                    const tr = document.createElement('tr')
                    tr.append(createTd(product.name), createTd(product.amount))
                    productsTable.append(tr)
                }
    
                clientInfoModal.querySelector('.order-price span:last-child').textContent = response.orders[index].totalSum.toFixed(2) + ' грн'
            }

            const productsTable = clientInfoModal.querySelector('table')
            let orderIndex = 0
            fillClientOrder()

            if (response.orders.length === 1) {
                ordersBlock.style.display = 'none'
                return
            }

            ordersBlock.style.display = ''
            orderArrows.item(0).onpointerup = () => fillClientOrder(--orderIndex)
            orderArrows.item(1).onpointerup = () => fillClientOrder(++orderIndex)
        }).catch(() => {
            hidePageLoad()
            showMessage('error', getErrorMessage(`замовлення клієнта`))
        })
    }

    editAction.onpointerup = () => {
        clientModal.querySelector('h1').textContent = 'Редагувати клієнта'
        clientModal.querySelector('.client-full-name').value = client.fullName
        clientModal.querySelector('.client-phone').value = client.phone
        clientModal.querySelector('.client-email').value = client.email
        clientModal.querySelector('.client-birth-date').value = client.birthDate ? getDate(client.birthDate) : ''
        const sexs = clientModal.querySelectorAll('input[type=radio]')
        sexs.item(0).checked = client.isMale || client.isMale === null
        sexs.item(1).checked = client.isMale === false
        clientModal.querySelector('.client-instagram').value = client.instagram
        clientModal.querySelector('.client-comment').value = client.comment
        clientModal.querySelector('button').onpointerup = () => editClient(client, tr)
        hideBodyOverflow()
        clientModal.style.display = 'flex'
    }

    deleteAction.onpointerup = () => showConfirm(`Видалити клієнта\n${client.fullName}?`, () =>
        remove('Client', client).then(() => {
            setTimeout(() => hideModal(confirmModal), 1)
            showMessage('info', deleteSuccessMessage('клієнта'))
            clients.splice(clients.findIndex(c => c.id === client.id), 1)
            clientsTable.removeChild(tr)

            if (clientsTable.children.length === 1) {
                clientsTable.style.display = ''
            }
        }).catch(() => showMessage('error', deleteErrorMessage('клієнта'))))

    const instagramLink = document.createElement('a')
    instagramLink.target = '_blank'
    instagramLink.href = client.instagram ? 'https://www.instagram.com/' + formatInstagramLink(client.instagram) : ''
    instagramLink.textContent = client.instagram ? formatInstagramLink(client.instagram) : ''

    const firstClientPhone = client.phone.split('\n')[0]
    const phoneLink = document.createElement('a')
    phoneLink.href = 'tel:' + firstClientPhone
    phoneLink.textContent = formatPhoneNumber(firstClientPhone)

    tr.append(
        createTd(client.fullName),
        createTd(instagramLink),
        createTd(phoneLink),
        actionsColumn
    )
    return tr
}

const fillClientsTable = client => {
    if (!client) {
        clientsTable.innerHTML = clientsTable.querySelector('tbody').innerHTML
        clientsTable.append(createEmptyDataDiv())
        return
    }

    clientsTable.append(createClientRow(client))
}

const createClient = () => {
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
        client.id = response
        client.bonusCash = 0
        clients.push(client)
        fillClientsTable(client)
        clientsTable.style.display = 'block'
    }).catch(() => {
        hideModalEnableButton(clientModal, payButton)
        showMessage('error', createErrorMessage('клієнта'))
    })
}

const editClient = (oldClient, oldRow) => {
    const fullNameElement = clientModal.querySelector('.client-full-name')
    const fullName = fullNameElement.value

    if (!fullName) {
        showMessage('error', 'Введіть ПІБ клієнта')
        return
    }

    const payButton = clientModal.querySelector('button')
    payButton.disabled = true

    const birthDateElement = clientModal.querySelector('.client-birth-date')

    const client = {
        id: oldClient.id,
        companyId: loginInfo.companyId,
        fullName,
        phone: clientModal.querySelector('.client-phone').value,
        email: clientModal.querySelector('.client-email').value,
        birthDate: birthDateElement.value ? new Date(birthDateElement.value) : null,
        isMale: clientModal.querySelector('input[type=radio]').checked,
        instagram: clientModal.querySelector('.client-instagram').value,
        comment: clientModal.querySelector('.client-comment').value,
        bonusCash: oldClient.bonusCash
    }

    put('Client', client).then(() => {
        hideModalEnableButton(clientModal, payButton)
        showMessage('info', updateSuccessMessage('клієнта'))
        const newRow = createClientRow(client)
        clientsTable.replaceChild(newRow, oldRow)
    }).catch(() => {
        hideModalEnableButton(clientModal, payButton)
        showMessage('error', updateErrorMessage('клієнта'))
    })
}

const searchClient = () => {
    animateChange(clientsTable)
    const searchQuery = document.querySelector('.search-client').value.trim().toLowerCase()

    const filteredClients = clients.filter(c =>
        c.fullName.toLowerCase().includes(searchQuery) ||
        c.instagram?.includes(searchQuery) ||
        c.phone.includes(searchQuery)
    )

    if (!filteredClients.length) {
        fillClientsTable(null)
        return
    }

    clientsTable.innerHTML = clientsTable.querySelector('tbody').innerHTML
    filteredClients.forEach(fillClientsTable)
}
