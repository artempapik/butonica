let stocksTable, stocks

const showStockInfo = e => {
    main.innerHTML = menuItemsContents['stock']
    fillSelectedMenuItem(e)
    stocksTable = document.querySelector('.stock-table table')

    if (loginInfo.title > 0) {
        document.querySelector('button').remove()
    }

    get(`Stock/${loginInfo.companyId}`).then(response => {
        stocks = response

        if (stocks.length) {
            stocksTable.style.display = 'block'
        }

        stocks.forEach(s => fillStocksTable(s))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('торгові точки')))
}

const stockModal = document.querySelector('.create-stock-modal')

const createStockModal = () => {
    stockModal.querySelector('h1').textContent = 'Створити точку'
    stockModal.querySelectorAll('input').forEach(i => i.value = '')
    stockModal.querySelector('button').onpointerup = () => createStock()
    hideBodyOverflow()
    stockModal.style.display = 'flex'
}

const createStockRow = stock => {
    const editAction = createEditSpan('stock')
    const deleteAction = createDeleteSpan('stock')
    const actionsColumn = document.createElement('td')

    if (loginInfo.title === 0) {
        actionsColumn.classList = 'stock-actions'
        actionsColumn.append(editAction, deleteAction)
    }

    const tr = document.createElement('tr')

    if (loginInfo.title === 0) {
        editAction.onpointerup = () => {
            stockModal.querySelector('h1').textContent = 'Редагувати точку'
            const inputs = stockModal.querySelectorAll('input')
            inputs.item(0).value = stock.name
            inputs.item(1).value = stock.address
    
            stockModal.querySelector('button').onpointerup = () => editStock(stock.id, tr)
            hideBodyOverflow()
            stockModal.style.display = 'flex'
        }
    
        deleteAction.onpointerup = () => showConfirm(`Видалити торгову точку «${stock.name}»?\nПов'язана з нею каса видалиться.`, () => remove('Stock', stock)
            .then(() => {
                setTimeout(() => hideModal(confirmModal), 1)
                showMessage('info', deleteSuccessMessage('торгову точку'))
                stocksTable.removeChild(tr)
                
                if (stocksTable.children.length === 1) {
                    stocksTable.style.display = ''
                }
            }).catch(() => showMessage('error', deleteErrorMessage('торгову точку'))))
    }

    tr.append(
        createTd(stock.name),
        createTd(stock.address),
        loginInfo.title === 0 ? actionsColumn : createTd()
    )
    return tr
}

const fillStocksTable = stock => stocksTable.append(createStockRow(stock))

const createStock = () => {
    const nameElement = stockModal.querySelector('.stock-name')
    const name = nameElement.value.trim()

    if (!name) {
        showMessage('error', 'Введіть назву торгової точки')
        return
    }

    const addressElement = stockModal.querySelector('.stock-address')
    const address = addressElement.value.trim()

    if (!address) {
        showMessage('error', 'Введіть адресу торгової точки')
        return
    }

    const payButton = stockModal.querySelector('button')
    payButton.disabled = true

    const stock = {
        companyId: loginInfo.companyId,
        name,
        address
    }

    post('Stock', stock).then(response => {
        hideModalEnableButton(stockModal, payButton)
        showMessage('success', createSuccessMessage('торгову точку'))
        stock.id = response
        stocks.push(stock)
        fillStocksTable(stock)
        stocksTable.style.display = 'block'
    }).catch(e => {
        hideModalEnableButton(stockModal, payButton)

        if (e.message === '403') {
            showMessage('error', 'Ви не можете створити ще одну торгову точку')
            return
        }

        showMessage('error', createErrorMessage('торгову точку'))
    })
}

const editStock = (id, oldRow) => {
    const nameElement = stockModal.querySelector('.stock-name')
    const name = nameElement.value

    if (!name) {
        showMessage('error', 'Введіть назву торгової точки')
        return
    }
    
    const addressElement = stockModal.querySelector('.stock-address')
    const address = addressElement.value

    if (!address) {
        showMessage('error', 'Введіть адресу торгової точки')
        return
    }

    const payButton = stockModal.querySelector('button')
    payButton.disabled = true

    const stock = {
        id,
        companyId: loginInfo.companyId,
        name,
        address
    }

    put('Stock', stock).then(() => {
        hideModalEnableButton(stockModal, payButton)
        showMessage('info', updateSuccessMessage('торгову точку'))
        const newRow = createStockRow(stock)
        stocksTable.replaceChild(newRow, oldRow)
    }).catch(() => {
        hideModalEnableButton(stockModal, payButton)
        showMessage('error', updateErrorMessage('торгову точку'))
    })
}
