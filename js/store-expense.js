let storeExpensesTable
const STORE_EXPENSE = 'витрату'

const showStoreExpenseInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['storeexpense']
    storeExpensesTable = document.querySelector('.store-expense-table table')

    get(`StoreExpense/${loginInfo.companyId}`).then(response => {
        if (response.length) {
            storeExpensesTable.style.display = 'block'
        }
    
        response.forEach(se => fillStoreExpensesTable(se))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('витрати')))

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
    storeExpenseModal.querySelector('h1').textContent = `Створити ${STORE_EXPENSE}`
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
        storeExpenseModal.querySelector('h1').textContent = `Редагувати ${STORE_EXPENSE}`
        storeExpenseModal.querySelector('.store-expense-date').value = getDate(storeExpense.date)
        storeExpenseModal.querySelector('.store-expense-sum').value = storeExpense.sum
        storeExpenseModal.querySelector('.store-expense-comment').value = storeExpense.comment
        storeExpenseModal.querySelector('button').onpointerup = () => editStoreExpense(storeExpense.id, tr)
        hideBodyOverflow()
        storeExpenseModal.style.display = 'flex'
    }

    deleteAction.onpointerup = () => {
        if (confirm(`${CONFIRM_DELETE_TEXT} ${STORE_EXPENSE}?`)) {
            remove('StoreExpense', storeExpense).then(() => {
                showMessage('info', deleteSuccessMessage(STORE_EXPENSE))
                storeExpenseModal.style.display = ''
                storeExpensesTable.removeChild(tr)

                if (storeExpensesTable.children.length === 1) {
                    storeExpensesTable.style.display = ''
                }
            }).catch(() => showMessage('error', deleteErrorMessage(STORE_EXPENSE)))
        }
    }

    tr.append(
        createTd(formatDate(storeExpense.date, false)),
        createTd(storeExpense.stock),
        createTd(storeExpense.sum.toFixed(2) + ' грн'),
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

    const storeExpense = {
        companyId: loginInfo.companyId,
        date,
        stockId: +stockElement.selectedOptions[0].dataset.id,
        sum,
        comment
    }

    post('StoreExpense', storeExpense).then(response => {
        showMessage('success', createSuccessMessage(STORE_EXPENSE))
        storeExpense.id = response
        storeExpense.stock = stockElement.value
        fillStoreExpensesTable(storeExpense)
        storeExpensesTable.style.display = 'block'
        storeExpenseModal.style.display = ''
    }).catch(() => {
        storeExpenseModal.style.display = ''
        showMessage('error', createErrorMessage(STORE_EXPENSE))
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

    const storeExpense = {
        id,
        companyId: loginInfo.companyId,
        date,
        stockId: +stockElement.selectedOptions[0].dataset.id,
        sum,
        comment
    }

    put('StoreExpense', storeExpense).then(() => {
        showMessage('info', updateSuccessMessage(STORE_EXPENSE))
        storeExpense.stock = stockElement.value
        const newRow = createStoreExpenseRow(storeExpense)
        storeExpensesTable.replaceChild(newRow, oldRow)
        storeExpenseModal.style.display = ''
    }).catch(() => {
        storeExpenseModal.style.display = ''
        showMessage('error', updateErrorMessage(STORE_EXPENSE))
    })
}
