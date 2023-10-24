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
