let completedOrdersTable, completedOrdersPages

const firstCompletedOrderPage = e => {
    if (currentPage === 1) {
        return
    }

    currentPage = 1
    document.querySelector('.change-page .page-number span:nth-child(2)').textContent = currentPage
    e.target.parentNode.parentNode.querySelector('span:nth-child(2)').classList.add('last-page')
    e.target.parentNode.parentNode.querySelector('.arrow-group:last-child span').classList.remove('last-page')
    showLoadAnimation()

    get(`Order/completed/${loginInfo.companyId}/${currentPage}`).then(response => {
        completedOrdersTable.innerHTML = completedOrdersTable.querySelector('tbody').innerHTML
        response.forEach(o => fillCompletedOrdersTable(o))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('замовлення')))
}

const lastCompletedOrderPage = e => {
    if (currentPage === completedOrdersPages) {
        return
    }
    
    currentPage = completedOrdersPages
    document.querySelector('.change-page .page-number span:nth-child(2)').textContent = currentPage
    e.target.parentNode.parentNode.querySelector('.arrow-group:last-child span').classList.add('last-page')
    e.target.parentNode.parentNode.querySelector('span:nth-child(2)').classList.remove('last-page')
    showLoadAnimation()

    get(`Order/completed/${loginInfo.companyId}/${currentPage}`).then(response => {
        completedOrdersTable.innerHTML = completedOrdersTable.querySelector('tbody').innerHTML
        response.forEach(o => fillCompletedOrdersTable(o))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('замовлення')))
}

const previousCompletedOrderPage = e => {
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

    get(`Order/completed/${loginInfo.companyId}/${currentPage}`).then(response => {
        completedOrdersTable.innerHTML = completedOrdersTable.querySelector('tbody').innerHTML
        response.forEach(o => fillCompletedOrdersTable(o))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('виконані замовлення')))
}

const nextCompletedOrderPage = e => {
    if (e.target.classList.contains('last-page') || currentPage === completedOrdersPages) {
        return
    }

    e.target.parentNode.parentNode.querySelector('span:nth-child(2)').classList.remove('last-page')
    currentPage++

    if (currentPage === completedOrdersPages) {
        e.target.classList.add('last-page')
    }

    document.querySelector('.change-page .page-number span:nth-child(2)').textContent = currentPage
    showLoadAnimation()
    
    get(`Order/completed/${loginInfo.companyId}/${currentPage}`).then(response => {
        completedOrdersTable.innerHTML = completedOrdersTable.querySelector('tbody').innerHTML
        response.forEach(o => fillCompletedOrdersTable(o))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('виконані замовлення')))
}

const showCompletedOrderInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['completedorder']
    completedOrdersTable = document.querySelector('.completed-order-table table')

    get(`Order/completed/${loginInfo.companyId}/pages-count`).then(response => {
        completedOrdersPages = response
        document.querySelector('.change-page .page-number span:last-child').textContent = 'з ' + completedOrdersPages
    })

    get(`Order/completed/${loginInfo.companyId}/1`).then(response => {
        if (response.length) {
            completedOrdersTable.style.display = 'block'
        }

        response.forEach(o => fillCompletedOrdersTable(o))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage(ORDER)))

    fillDatalists()
}

const fillCompletedOrdersTable = order => completedOrdersTable.append(createOrderRow(order, completedOrdersTable))
