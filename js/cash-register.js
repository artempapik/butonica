let cashRegistersTable
const CASH_REGISTER = 'касу'

const showCashRegisterInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['cashregister']
    cashRegistersTable = document.querySelector('.cash-register-table table')

    if (loginInfo.title > 0) {
        document.querySelector('button').remove()
    }

    get(`CashRegister/${loginInfo.companyId}`).then(response => {
        if (response.length) {
            cashRegistersTable.style.display = 'block'
        }

        response.forEach(cr => fillCashRegistersTable(cr))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('каси')))

    const cashRegisterStocks = cashRegisterModal.querySelector('.cash-register-stock')
    cashRegisterStocks.innerHTML = ''

    get(`Stock/ids-names/${loginInfo.companyId}`).then(response => {
        for (const stock of response) {
            const option = document.createElement('option')
            option.text = stock.name
            option.dataset.id = stock.id
            cashRegisterStocks.add(option)
        }
    })
}

const cashRegisterModal = document.querySelector('.create-cash-register-modal')

const createCashRegisterModal = () => {
    cashRegisterModal.querySelector('h1').textContent = `Створити ${CASH_REGISTER}`
    cashRegisterModal.querySelector('input').value = ''
    cashRegisterModal.querySelector('select').selectedIndex = 0
    cashRegisterModal.querySelector('button').onpointerup = () => createCashRegister()
    hideBodyOverflow()
    cashRegisterModal.style.display = 'flex'
}

const createCashRegisterRow = cashRegister => {
    const editAction = createEditSpan('cash-register')
    const deleteAction = createDeleteSpan('cash-register')
    const actionsColumn = document.createElement('td')

    if (loginInfo.title === 0) {
        actionsColumn.classList = 'cash-register-actions'
        actionsColumn.append(editAction, deleteAction)
    }

    const tr = document.createElement('tr')

    if (loginInfo.title === 0) {
        editAction.onpointerup = () => {
            cashRegisterModal.querySelector('h1').textContent = `Редагувати ${CASH_REGISTER}`
            cashRegisterModal.querySelector('input').value = cashRegister.name
            cashRegisterModal.querySelector('button').onpointerup = () => editCashRegister(cashRegister, tr)
            hideBodyOverflow()
            cashRegisterModal.style.display = 'flex'
        }

        deleteAction.onpointerup = () => {
            if (confirm(`${CONFIRM_DELETE_TEXT} ${CASH_REGISTER} "${cashRegister.name}"?`)) {
                remove('CashRegister', cashRegister).then(() => {
                    showMessage('info', deleteSuccessMessage(CASH_REGISTER))
                    cashRegistersTable.removeChild(tr)

                    if (cashRegistersTable.children.length === 1) {
                        cashRegistersTable.style.display = ''
                    }
                }).catch(() => showMessage('error', deleteErrorMessage(CASH_REGISTER)))
            }
        }
    }

    const span = document.createElement('span')
    span.textContent = cashRegister.isOpened ? 'Відкрита' : 'Закрита'
    span.style.background = cashRegister.isOpened ? 'rgb(0, 71, 171)' : 'rgb(220, 0, 0)'

    const statusTd = document.createElement('td')
    statusTd.append(span)

    tr.append(
        createTd(cashRegister.name),
        createTd(cashRegister.cash.toFixed(2) + ' грн'),
        createTd(cashRegister.terminalCash.toFixed(2) + ' грн'),
        statusTd,
        loginInfo.title === 0 ? actionsColumn : createTd()
    )
    return tr
}

const fillCashRegistersTable = cashRegister => cashRegistersTable.append(createCashRegisterRow(cashRegister))

const createCashRegister = () => {
    const nameElement = cashRegisterModal.querySelector('.cash-register-name')
    const name = nameElement.value.trim()

    if (!name) {
        showMessage('error', 'Введіть назву каси')
        return
    }
    
    const cashRegister = {
        name,
        stockId: +cashRegisterModal.querySelector('.cash-register-stock').selectedOptions[0].dataset.id
    }

    hideModal(cashRegisterModal)

    post('CashRegister', cashRegister).then(response => {
        showMessage('success', createSuccessMessage(CASH_REGISTER))
        cashRegister.id = response
        cashRegister.cash = 0
        cashRegister.terminalCash = 0
        cashRegister.isOpened = false
        fillCashRegistersTable(cashRegister)
        cashRegistersTable.style.display = 'block'
    }).catch(e => {
        if (e.message === '403') {
            showMessage('error', `Ви не можете створити ще одну ${CASH_REGISTER}`)
            return
        }

        showMessage('error', createErrorMessage(CASH_REGISTER))
    })
}

const editCashRegister = (oldCashRegister, oldRow) => {
    const nameElement = cashRegisterModal.querySelector('.cash-register-name')
    const name = nameElement.value

    if (!name) {
        showMessage('error', 'Введіть назву каси')
        return
    }

    const cashRegister = {
        id: oldCashRegister.id,
        name,
        cash: oldCashRegister.cash,
        terminalCash: oldCashRegister.terminalCash,
        isOpened: oldCashRegister.isOpened,
        stockId: +cashRegisterModal.querySelector('.cash-register-stock').selectedOptions[0].dataset.id
    }

    hideModal(cashRegisterModal)

    put('CashRegister', cashRegister).then(() => {
        showMessage('info', updateSuccessMessage(CASH_REGISTER))
        const newRow = createCashRegisterRow(cashRegister)
        cashRegistersTable.replaceChild(newRow, oldRow)
    }).catch(() => showMessage('error', updateErrorMessage(CASH_REGISTER)))
}
