let pendingOrdersTable

const showPendingOrderInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['pendingorder']
    pendingOrdersTable = document.querySelector('.pending-order-table table')

    get(`Order/pending/${loginInfo.companyId}`).then(response => {
        if (response.length) {
            pendingOrdersTable.style.display = 'block'
        }

        response.forEach(o => fillPendingOrdersTable(o))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('замовлення')))

    fillDatalists()
}

const fillPendingOrdersTable = order => pendingOrdersTable.append(createOrderRow(order, pendingOrdersTable))

const getPendingOrdersByDate = e => {
    showLoadAnimation()

    const date = e.target.value ? new Date(e.target.value) : false
    const query = date ?
        `${loginInfo.companyId}/${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` :
        `${loginInfo.companyId}`

    get('Order/pending/' + query).then(response => {
        pendingOrdersTable.innerHTML = pendingOrdersTable.querySelector('tbody').innerHTML
        replaceLoadIcons()

        if (!response.length) {
            pendingOrdersTable.append(createEmptyDataDiv())
            return
        }

        response.forEach(o => fillPendingOrdersTable(o))
    }).catch(() => showMessage('error', getErrorMessage('замовлення за цією датою')))
}
