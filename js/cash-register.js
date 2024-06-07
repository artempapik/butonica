let cashRegistersTable

const showCashRegisterInfo = e => {
    main.innerHTML = menuItemsContents['cashregister']
    fillSelectedMenuItem(e)
    cashRegistersTable = document.querySelector('.cash-register-table table')

    if (loginInfo.title > 0) {
        document.querySelector('button').remove()
    }

    get(`CashRegister/${loginInfo.companyId}`).then(response => {
        if (response.length) {
            cashRegistersTable.style.display = 'block'
        }

        response.forEach(fillCashRegistersTable)
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
    cashRegisterModal.querySelector('h1').textContent = 'Створити касу'
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
            cashRegisterModal.querySelector('h1').textContent = 'Редагувати касу'
            cashRegisterModal.querySelector('input').value = cashRegister.name
            cashRegisterModal.querySelector('button').onpointerup = () => editCashRegister(cashRegister, tr)
            hideBodyOverflow()
            cashRegisterModal.style.display = 'flex'
        }

        deleteAction.onpointerup = () => showConfirm(`Видалити касу\n${cashRegister.name}?`, () =>
            remove('CashRegister', cashRegister).then(() => {
                setTimeout(() => hideModal(confirmModal), 1)
                showMessage('info', deleteSuccessMessage('касу'))
                cashRegistersTable.removeChild(tr)

                if (cashRegistersTable.children.length === 1) {
                    cashRegistersTable.style.display = ''
                }
            }).catch(() => showMessage('error', deleteErrorMessage('касу'))))
    }

    const span = document.createElement('span')
    span.textContent = cashRegister.isOpened ? 'Відкрита' : 'Закрита'
    span.style.background = cashRegister.isOpened ? 'linear-gradient(rgb(75, 145, 247) 0%, rgb(54, 122, 246) 100%)' : 'rgba(220, 0, 0, .75)'

    const statusTd = document.createElement('td')
    statusTd.append(span)

    tr.append(
        createTd(cashRegister.name),
        createTd((cashRegister.cash % 1 === 0 ? cashRegister.cash : cashRegister.cash.toFixed(2)) + ' грн'),
        createTd((cashRegister.terminalCash % 1 === 0 ? cashRegister.terminalCash : cashRegister.terminalCash.toFixed(2)) + ' грн'),
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

    const payButton = cashRegisterModal.querySelector('button')
    payButton.disabled = true
    
    const cashRegister = {
        name,
        stockId: +cashRegisterModal.querySelector('.cash-register-stock').selectedOptions[0].dataset.id
    }

    post('CashRegister', cashRegister).then(response => {
        hideModalEnableButton(cashRegisterModal, payButton)
        showMessage('success', createSuccessMessage('касу'))
        cashRegister.id = response
        cashRegister.cash = 0
        cashRegister.terminalCash = 0
        cashRegister.isOpened = false
        fillCashRegistersTable(cashRegister)
        cashRegistersTable.style.display = 'block'
    }).catch(e => {
        hideModalEnableButton(cashRegisterModal, payButton)

        if (e.message === '403') {
            showMessage('error', 'Ви не можете створити ще одну касу')
            return
        }

        showMessage('error', createErrorMessage('касу'))
    })
}

const editCashRegister = (oldCashRegister, oldRow) => {
    const nameElement = cashRegisterModal.querySelector('.cash-register-name')
    const name = nameElement.value

    if (!name) {
        showMessage('error', 'Введіть назву каси')
        return
    }

    const payButton = cashRegisterModal.querySelector('button')
    payButton.disabled = true

    const cashRegister = {
        id: oldCashRegister.id,
        name,
        cash: oldCashRegister.cash,
        terminalCash: oldCashRegister.terminalCash,
        isOpened: oldCashRegister.isOpened,
        stockId: +cashRegisterModal.querySelector('.cash-register-stock').selectedOptions[0].dataset.id
    }

    put('CashRegister', cashRegister).then(() => {
        hideModalEnableButton(cashRegisterModal, payButton)
        showMessage('info', updateSuccessMessage('касу'))
        const newRow = createCashRegisterRow(cashRegister)
        cashRegistersTable.replaceChild(newRow, oldRow)
    }).catch(() => {
        hideModalEnableButton(cashRegisterModal, payButton)
        showMessage('error', updateErrorMessage('касу'))
    })
}
