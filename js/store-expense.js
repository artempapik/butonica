let storeExpensesTable

const getStoreExpenses = month => {
    showLoadAnimation()

    get(`StoreExpense/${loginInfo.companyId}/${month || new Date().getMonth() + 1}`).then(response => {
        storeExpensesTable.innerHTML = storeExpensesTable.querySelector('tbody').innerHTML
        storeExpensesTable.style.display = 'block'
        replaceLoadIcons()

        if (!response.length) {
            storeExpensesTable.append(createEmptyDataDiv())
            return
        }

        response.forEach(s => fillStoreExpensesTable(s))
    }).catch(() => showMessage('error', getErrorMessage('витрати')))
}

const showStoreExpenseInfo = e => {
    main.innerHTML = menuItemsContents['storeexpense']
    fillSelectedMenuItem(e)
    storeExpensesTable = document.querySelector('.store-expense-table table')
    getStoreExpenses(0)

    get(`Stock/ids-names/${loginInfo.companyId}`).then(response => {
        const storeExpenseStocks = storeExpenseModal.querySelector('.store-expense-stock')
        storeExpenseStocks.innerHTML = ''

        for (const stock of response) {
            const option = document.createElement('option')
            option.text = stock.name
            option.dataset.id = stock.id
            storeExpenseStocks.add(option)
        }
    })
}

const storeExpenseModal = document.querySelector('.create-store-expense-modal')

const createStoreExpenseModal = () => {
    storeExpenseModal.querySelector('h1').textContent = 'Створити витрату'
    storeExpenseModal.querySelectorAll('input').forEach(i => i.value = '')
    storeExpenseModal.querySelector('textarea').value = ''
    storeExpenseModal.querySelector('button').onpointerup = () => createStoreExpense()
    hideBodyOverflow()
    storeExpenseModal.style.display = 'flex'
}

const createStoreExpenseRow = storeExpense => {
    const editAction = createEditSpan('store-expense')
    const deleteAction = createDeleteSpan('store-expense')
    const actionsColumn = document.createElement('td')
    actionsColumn.classList = 'store-expense-actions'
    actionsColumn.append(editAction, deleteAction)

    const tr = document.createElement('tr')

    editAction.onpointerup = () => {
        storeExpenseModal.querySelector('h1').textContent = 'Редагувати витрату'
        storeExpenseModal.querySelector('.store-expense-date').value = getDate(storeExpense.date)
        storeExpenseModal.querySelector('.store-expense-sum').value = storeExpense.sum
        storeExpenseModal.querySelector('.store-expense-comment').value = storeExpense.comment
        storeExpenseModal.querySelector('button').onpointerup = () => editStoreExpense(storeExpense.id, tr)
        hideBodyOverflow()
        storeExpenseModal.style.display = 'flex'
    }

    deleteAction.onpointerup = () => showConfirm('Видалити витрату?', () => {
        delete storeExpense.stock

        remove('StoreExpense', storeExpense)
            .then(() => {
                setTimeout(() => hideModal(confirmModal), 1)
                showMessage('info', deleteSuccessMessage('витрату'))
                storeExpensesTable.removeChild(tr)

                if (storeExpensesTable.children.length === 1) {
                    storeExpensesTable.style.display = ''
                }
            }).catch(() => showMessage('error', deleteErrorMessage('витрату')))
    })

    tr.append(
        createTd(formatDate(storeExpense.date, false)),
        createTd(storeExpense.stock),
        createTd('-' + storeExpense.sum.toFixed(2)),
        createTd(storeExpense.comment),
        actionsColumn
    )
    return tr
}

const fillStoreExpensesTable = storeExpense => storeExpensesTable.append(createStoreExpenseRow(storeExpense))

const createStoreExpense = () => {
    const dateElement = storeExpenseModal.querySelector('.store-expense-date')

    if (!dateElement.value) {
        showMessage('error', 'Вкажіть дату витрати')
        return
    }

    const date = new Date(dateElement.value)
    const stockElement = storeExpenseModal.querySelector('.store-expense-stock')

    if (!stockElement.value) {
        showMessage('error', 'Оберіть склад для витрати')
        return
    }

    const sumElement = storeExpenseModal.querySelector('.store-expense-sum')

    if (!sumElement.value) {
        showMessage('error', 'Вкажіть суму витрати')
        return
    }

    const sum = +sumElement.value

    const commentElement = storeExpenseModal.querySelector('.store-expense-comment')
    const comment = commentElement.value.trim()

    if (!comment) {
        showMessage('error', 'Введіть коментар до витрати')
        return
    }

    const payButton = storeExpenseModal.querySelector('button')
    payButton.disabled = true

    const storeExpense = {
        companyId: loginInfo.companyId,
        date,
        stockId: +stockElement.selectedOptions[0].dataset.id,
        sum,
        comment
    }

    post('StoreExpense', storeExpense).then(response => {
        hideModalEnableButton(storeExpenseModal, payButton)
        showMessage('success', createSuccessMessage('витрату'))
        storeExpense.id = response
        storeExpense.stock = stockElement.value
        fillStoreExpensesTable(storeExpense)
        storeExpensesTable.style.display = 'block'
    }).catch(() => {
        hideModalEnableButton(storeExpenseModal, payButton)
        showMessage('error', createErrorMessage('витрату'))
    })
}

const editStoreExpense = (id, oldRow) => {
    const dateElement = storeExpenseModal.querySelector('.store-expense-date')

    if (!dateElement.value) {
        showMessage('error', 'Вкажіть дату витрати')
        return
    }

    const date = new Date(dateElement.value)
    const stockElement = storeExpenseModal.querySelector('.store-expense-stock')

    const sumElement = storeExpenseModal.querySelector('.store-expense-sum')

    if (!sumElement.value) {
        showMessage('error', 'Вкажіть суму витрати')
        return
    }

    const sum = +sumElement.value

    const commentElement = storeExpenseModal.querySelector('.store-expense-comment')
    const comment = commentElement.value.trim()

    if (!comment) {
        showMessage('error', 'Введіть коментар до витрати')
        return
    }

    const payButton = storeExpenseModal.querySelector('button')
    payButton.disabled = true

    const storeExpense = {
        id,
        companyId: loginInfo.companyId,
        date,
        stockId: +stockElement.selectedOptions[0].dataset.id,
        sum,
        comment
    }

    put('StoreExpense', storeExpense).then(() => {
        hideModalEnableButton(storeExpenseModal, payButton)
        showMessage('info', updateSuccessMessage('витрату'))
        storeExpense.stock = stockElement.value
        const newRow = createStoreExpenseRow(storeExpense)
        storeExpensesTable.replaceChild(newRow, oldRow)
    }).catch(() => {
        hideModalEnableButton(storeExpenseModal, payButton)
        showMessage('error', updateErrorMessage('витрату'))
    })
}
