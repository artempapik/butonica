let completedOrdersTable

const showCompletedOrderInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['completedorder']
    completedOrdersTable = document.querySelector('.completed-order-table table')

    get(`Order/completed/${loginInfo.companyId}`).then(response => {
        if (response.length) {
            completedOrdersTable.style.display = 'block'
        }

        response.forEach(o => fillCompletedOrdersTable(o))
    }).catch(() => showMessage('error', getErrorMessage(ORDER)))

    fillDatalists()
}

const fillCompletedOrdersTable = order => completedOrdersTable.append(createOrderRow(order, completedOrdersTable))
