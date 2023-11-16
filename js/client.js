let clientsTable
const CLIENT = 'клієнта'

const showClientInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['client']
    clientsTable = document.querySelector('.client-table table')

    if (loginInfo.title > 1) {
        const clientBonus = document.querySelector('.client-bonus')
        clientBonus.querySelector('input').disabled = true
        clientBonus.querySelector('button').remove()
    }

    get(`Client/${loginInfo.companyId}`).then(response => {
        document.querySelector('.client-bonus input').value = response.discount

        if (response.clients.length) {
            clientsTable.style.display = 'block'
        }

        response.clients.forEach(c => fillClientsTable(c))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('клієнтів')))
}

const setClientDiscount = () => {
    const discount = document.querySelector('.client-bonus input').value

    if (discount < 0 || discount > 100) {
        showMessage('error', 'Відсоток бонусів має бути між 0 та 100')
        return
    }

    if (discount % 1 !== 0) {
        showMessage('error', 'Відсоток бонусів має бути цілим числом')
        return
    }

    put(`Client/${loginInfo.companyId}/${discount}`)
        .then(() => showMessage('info', 'Новий відсоток обрано'))
        .catch(() => showMessage('error', 'Помилка при встановленні відсотка'))
}

const clientModal = document.querySelector('.create-client-modal')
const clientInfoModal = document.querySelector('.client-info-modal')
const clientModalContent = clientInfoModal.querySelector('.client-info-modal-content')

const createClientModal = (addCreateEvent = true) => {
    clientModal.querySelector('h1').textContent = `Створити ${CLIENT}`
    clientModal.querySelectorAll('input').forEach(i => i.value = '')
    clientModal.querySelectorAll('textarea').forEach(t => t.value = '')
    clientModal.querySelector('input[type=radio]').checked = true

    if (addCreateEvent) {
        clientModal.querySelector('button').onpointerup = () => createClient()
    }
    
    hideBodyOverflow()
    clientModal.style.display = 'flex'
}

const createClientRow = client => {
    const editAction = createEditSpan('client')
    const deleteAction = createDeleteSpan('client')
    const actionsColumn = document.createElement('td')
    actionsColumn.classList = 'client-actions'
    actionsColumn.append(editAction, deleteAction)

    const tr = document.createElement('tr')
    tr.onpointerup = e => {
        if (e.target.tagName.toLowerCase() === 'span') {
            return
        }

        hideBodyOverflow()
        clientInfoModal.querySelector('.client-full-name').textContent = client.fullName
        const phoneBlock = clientInfoModal.querySelector('.client-phone')
        phoneBlock.innerHTML = ''

        if (client.phone) {
            for (const phone of client.phone.split('\n')) {
                const span = document.createElement('span')
                span.textContent = formatPhoneNumber(phone)
                phoneBlock.append(span, document.createElement('br'))
            }   
        }

        showHideNodeInfo(clientInfoModal, 'client-email', client.email)
        showHideNodeInfo(clientInfoModal, 'client-birth-date', formatDate(client.birthDate, false, false))
        clientInfoModal.querySelector('.client-sex').textContent = client.isMale === null ? 'Без статі' : client.isMale ? 'Чоловік' : 'Жінка'

        const instagram = clientInfoModal.querySelector('.client-instagram')

        if (client.instagram) {
            instagram.parentNode.style.display = ''
            const link = document.createElement('a')
            link.textContent = client.instagram
            link.href = `https://www.instagram.com/${client.instagram}`
            link.target = 'blank'
    
            instagram.innerHTML = ''
            instagram.append(link)
        } else {
            instagram.parentNode.style.display = 'none'
        }

        showHideNodeInfo(clientInfoModal, 'client-comment', client.comment)
        clientInfoModal.querySelector('.client-bonus-cash').textContent = client.bonusCash.toFixed(2) + ' грн'

        get(`Client/${client.id}/orders`).then(response => {
            const ordersEmpty = clientInfoModal.querySelector('.orders-empty')
            const clientOrders = clientInfoModal.querySelector('.client-orders')

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
            clientOrdersTotalSum.querySelector('span:last-child').textContent = response.totalSum.toFixed(2) + ' грн'

            const fillClientOrder = index => {
                productsTable.innerHTML = productsTable.querySelector('tbody').innerHTML

                for (const product of response.orders[index].products) {
                    const tr = document.createElement('tr')
                    tr.append(createTd(product.name), createTd(product.amount))
                    productsTable.append(tr)
                }
    
                clientInfoModal.querySelector('.order-price span:last-child').textContent = response.orders[index].totalSum.toFixed(2) + ' грн'
            }

            const productsTable = clientInfoModal.querySelector('table')
            let index = 0
            fillClientOrder(index)

            const orderArrows = clientInfoModal.querySelectorAll('.order-arrows span')

            orderArrows.item(0).onpointerup = () => {
                if (index === 0) {
                    return
                }

                fillClientOrder(--index)
            }

            orderArrows.item(1).onpointerup = () => {
                if (index === response.orders.length - 1) {
                    return
                }

                fillClientOrder(++index)
            }
        }).catch(() => showMessage('error', getErrorMessage(`замовлення ${CLIENT}`)))
    }

    editAction.onpointerup = () => {
        clientModal.querySelector('h1').textContent = `Редагувати ${CLIENT}`
        clientModal.querySelector('.client-full-name').value = client.fullName
        clientModal.querySelector('.client-phone').value = client.phone
        clientModal.querySelector('.client-email').value = client.email
        clientModal.querySelector('.client-birth-date').value = client.birthDate ? getDate(client.birthDate) : ''
        const sexs = clientModal.querySelectorAll('input[type=radio]')
        sexs.item(0).checked = client.isMale
        sexs.item(1).checked = !client.isMale
        clientModal.querySelector('.client-instagram').value = client.instagram
        clientModal.querySelector('.client-comment').value = client.comment
        clientModal.querySelector('button').onpointerup = () => editClient(client, tr)
        hideBodyOverflow()
        clientModal.style.display = 'flex'
    }

    deleteAction.onpointerup = () => {
        if (confirm(`Ви дійсно бажаєте видалити ${CLIENT} "${client.fullName}"?`)) {
            remove('Client', client).then(() => {
                showMessage('info', deleteSuccessMessage(CLIENT))
                clientModal.style.display = ''
                clientsTable.removeChild(tr)

                if (clientsTable.children.length === 1) {
                    clientsTable.style.display = ''
                }
            }).catch(() => showMessage('error', deleteErrorMessage(CLIENT)))
        }
    }

    tr.append(
        createTd(client.fullName),
        createTd(client.email),
        createTd(formatPhoneNumber(client.phone.split('\n')[0])),
        actionsColumn
    )
    return tr
}

const fillClientsTable = client => clientsTable.append(createClientRow(client))

const createClient = () => {
    const fullNameElement = clientModal.querySelector('.client-full-name')
    const fullName = fullNameElement.value.trim()

    if (!fullName) {
        showMessage('error', 'Введіть ПІБ клієнта')
        return
    }

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
        showMessage('success', createSuccessMessage(CLIENT))
        client.id = response
        client.bonusCash = 0
        fillClientsTable(client)
        clientsTable.style.display = 'block'
        clientModal.style.display = ''
    }).catch(() => {
        clientModal.style.display = ''
        showMessage('error', createErrorMessage(CLIENT))
    })
}

const editClient = (oldClient, oldRow) => {
    const fullNameElement = clientModal.querySelector('.client-full-name')
    const fullName = fullNameElement.value

    if (!fullName) {
        showMessage('error', 'Введіть ПІБ клієнта')
        return
    }

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
        showMessage('info', updateSuccessMessage(CLIENT))
        const newRow = createClientRow(client)
        clientsTable.replaceChild(newRow, oldRow)
        clientModal.style.display = ''
    }).catch(() => {
        clientModal.style.display = ''
        showMessage('error', updateErrorMessage(CLIENT))
    })
}
