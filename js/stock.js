let stocksTable, stocks
const STOCK = 'торгову точку'

const showStockInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['stock']
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
    
        deleteAction.onpointerup = () => {
            if (confirm(`${CONFIRM_DELETE_TEXT} ${STOCK} "${stock.name}"?\nУСІ пов'язані з нею каси також будуть видалені.`)) {
                remove('Stock', stock).then(() => {
                    showMessage('info', deleteSuccessMessage(STOCK))
                    stockModal.style.display = ''
                    stocksTable.removeChild(tr)
                    
                    if (stocksTable.children.length === 1) {
                        stocksTable.style.display = ''
                    }
                }).catch(() => showMessage('error', deleteErrorMessage(STOCK)))
            }
        }
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

    const stock = {
        companyId: loginInfo.companyId,
        name,
        address
    }

    post('Stock', stock).then(response => {
        showMessage('success', createSuccessMessage(STOCK))
        stock.id = response
        stocks.push(stock)
        fillStocksTable(stock)
        stocksTable.style.display = 'block'
        stockModal.style.display = ''
    }).catch(e => {
        stockModal.style.display = ''

        if (e.message === '403') {
            showMessage('error', `Ви не можете створити ще одну ${STOCK}`)
            return
        }

        showMessage('error', createErrorMessage(STOCK))
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

    const stock = {
        id,
        companyId: loginInfo.companyId,
        name,
        address
    }

    put('Stock', stock).then(() => {
        showMessage('info', updateSuccessMessage(STOCK))
        const newRow = createStockRow(stock)
        stocksTable.replaceChild(newRow, oldRow)
        stockModal.style.display = ''
    }).catch(() => {
        stockModal.style.display = ''
        showMessage('error', updateErrorMessage(STOCK))
    })
}
