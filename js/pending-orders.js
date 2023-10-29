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
    }).catch(() => showMessage('error', getErrorMessage(ORDER)))

    get(`Product/ids-names/${loginInfo.companyId}`).then(response => orderProducts = response)
}

const fillPendingOrdersTable = order => pendingOrdersTable.append(createOrderRow(order, pendingOrdersTable))

const getOrdersByDate = (e) => {
    const date = e.target.value ? new Date(e.target.value) : false
    const query = date ?
        `${loginInfo.companyId}/${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` :
        `pending/${loginInfo.companyId}`

    get('Order/' + query)
        .then(response => {
            pendingOrdersTable.innerHTML = pendingOrdersTable.querySelector('tbody').innerHTML

            if (!response.length) {
                pendingOrdersTable.append(createEmptyDataDiv())
                return
            }

            response.forEach(o => fillPendingOrdersTable(o))
        })
        .catch(() => showMessage('error', getErrorMessage('замовлення за цією датою')))
}
