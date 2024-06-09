let storeExpenseCategoryTable

const showStoreExpenseCategoryInfo = e => {
    main.innerHTML = menuItemsContents['storeexpensecategory']
    fillSelectedMenuItem(e)
    storeExpenseCategoryTable = document.querySelector('.store-expense-category-table table')

    get(`StoreExpenseCategory/${loginInfo.companyId}`).then(response => {
        if (response.length) {
            storeExpenseCategoryTable.style.display = 'block'
        }
    
        response.forEach(fillStoreExpenseCategoriesTable)
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('категорії витрат')))
}

const storeExpenseCategoryModal = document.querySelector('.create-store-expense-category-modal')

colorIndex = 0

const createStoreExpenseCategoryColors = (activeIndex = 0) => {
    const storeExpenseCategoryColors = storeExpenseCategoryModal.querySelector('.store-expense-category-colors')
    storeExpenseCategoryColors.innerHTML = ''

    for (const key in labelIndexToBackground) {
        const storeExpenseCategoryColor = document.createElement('div')
        storeExpenseCategoryColor.classList = 'store-expense-category-color'
        storeExpenseCategoryColor.style.background = `rgb(${labelIndexToBackground[key]})`

        storeExpenseCategoryColor.onpointerup = () => {
            for (const storeExpenseCategoryColor of storeExpenseCategoryColors.querySelectorAll('div')) {
                storeExpenseCategoryColor.style.outline = '.1rem rgb(200, 200, 200) solid'
            }

            storeExpenseCategoryColor.style.outline = '.2rem rgb(70, 70, 70) solid'
            colorIndex = key
        }

        if (+key === +activeIndex) {
            storeExpenseCategoryColor.style.outline = '.2rem rgb(70, 70, 70) solid'
            colorIndex = key
        }

        storeExpenseCategoryColors.append(storeExpenseCategoryColor)
    }
}

const createStoreExpenseCategoryModal = () => {
    storeExpenseCategoryModal.querySelector('h1').textContent = 'Створити категорію'
    storeExpenseCategoryModal.querySelector('input').value = ''
    createStoreExpenseCategoryColors()
    storeExpenseCategoryModal.querySelector('button').onpointerup = () => createStoreExpenseCategory()
    hideBodyOverflow()
    storeExpenseCategoryModal.style.display = 'flex'
}

const createStoreExpenseCategoryRow = storeExpenseCategory => {
    const editAction = createEditSpan('store-expense-category')
    const deleteAction = createDeleteSpan('store-expense-category')
    const actionsColumn = document.createElement('td')
    actionsColumn.classList = 'store-expense-category-actions'
    actionsColumn.append(editAction, deleteAction)

    const tr = document.createElement('tr')

    editAction.onpointerup = () => {
        storeExpenseCategoryModal.querySelector('h1').textContent = 'Редагувати категорію'
        storeExpenseCategoryModal.querySelector('input').value = storeExpenseCategory.name
        createStoreExpenseCategoryColors(storeExpenseCategory.color)
        storeExpenseCategoryModal.querySelector('button').onpointerup = () => editStoreExpenseCategory(storeExpenseCategory.id, tr)
        hideBodyOverflow()
        storeExpenseCategoryModal.style.display = 'flex'
    }

    deleteAction.onpointerup = () =>
        showConfirm(`Видалити категорію «${storeExpenseCategory.name}»?`, () =>
            remove('StoreExpenseCategory', storeExpenseCategory).then(() => {
                setTimeout(() => hideModal(confirmModal), 1)
                showMessage('info', deleteSuccessMessage('категорію'))
                storeExpenseCategoryTable.removeChild(tr)

                if (storeExpenseCategoryTable.children.length === 1) {
                    storeExpenseCategoryTable.style.display = ''
                }
            }).catch(() => showMessage('error', deleteErrorMessage('категорію'))))

    const span = document.createElement('span')
    span.textContent = storeExpenseCategoryModal.name
    span.style.background = `rgb(${labelIndexToBackground[storeExpenseCategoryModal.color]})`
    span.style.color = `rgb(${labelIndexToColor[storeExpenseCategoryModal.color]})`

    const nameTd = document.createElement('td')
    nameTd.append(span)

    tr.append(nameTd, actionsColumn)
    return tr
}

const fillStoreExpenseCategoriesTable = storeExpenseCategory => storeExpenseCategoryTable.append(createStoreExpenseCategoryRow(storeExpenseCategory))

const createStoreExpenseCategory = () => {
    const nameElement = storeExpenseCategoryModal.querySelector('input')
    const name = nameElement.value.trim()

    if (!name) {
        showMessage('error', 'Введіть назву категорії')
        return
    }

    const payButton = storeExpenseCategoryModal.querySelector('button')
    payButton.disabled = true

    const storeExpenseCategory = {
        companyId: loginInfo.companyId,
        name,
        color: +colorIndex
    }

    post('StoreExpenseCategory', storeExpenseCategory).then(response => {
        hideModalEnableButton(storeExpenseCategoryModal, payButton)
        showMessage('success', createSuccessMessage('категорію'))
        storeExpenseCategoryModal.id = response
        fillStoreExpenseCategoriesTable(storeExpenseCategory)
        storeExpenseCategoryTable.style.display = 'block'
    }).catch(() => {
        hideModalEnableButton(storeExpenseCategoryModal, payButton)
        showMessage('error', createErrorMessage('категорію'))
    })
}

const editStoreExpenseCategory = (id, oldRow) => {
    const nameElement = storeExpenseCategoryModal.querySelector('input')
    const name = nameElement.value.trim()

    if (!name) {
        showMessage('error', 'Введіть назву категорії')
        return
    }

    const payButton = storeExpenseCategoryModal.querySelector('button')
    payButton.disabled = true

    const storeExpenseCategory = {
        id,
        companyId: loginInfo.companyId,
        name,
        color: +colorIndex
    }

    put('StoreExpenseCategory', storeExpenseCategory).then(() => {
        hideModalEnableButton(storeExpenseCategoryModal, payButton)
        showMessage('info', updateSuccessMessage('категорію'))
        const newRow = createStoreExpenseCategoryRow(storeExpenseCategory)
        storeExpenseCategoryTable.replaceChild(newRow, oldRow)
    }).catch(() => {
        hideModalEnableButton(storeExpenseCategoryModal, payButton)
        showMessage('error', updateErrorMessage('категорію'))
    })
}
