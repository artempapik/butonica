let categoriesTable, categoriesInput, categories

const showCategoryInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['category']

    categoriesTable = document.querySelector('.category-table table')
    categoriesInput = document.querySelector('.search-category')

    if (loginInfo.title > 1) {
        document.querySelector('button').remove()
    }

    get(`Category/${loginInfo.companyId}`).then(response => {
        categories = response

        if (categories.length) {
            categoriesTable.style.display = 'block'
            categoriesInput.style.display = 'block'
        }

        categories.forEach(c => fillCategoriesTable(c))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('категорії')))
}

const categoryModal = document.querySelector('.create-category-modal')

const createCategoryModal = () => {
    categoryModal.querySelector('h1').textContent = 'Створити категорію'
    categoryModal.querySelector('input').value = ''
    categoryModal.querySelector('button').onpointerup = () => createCategory()
    hideBodyOverflow()
    categoryModal.style.display = 'flex'
}

const createCategoryRow = category => {
    const editAction = createEditSpan('category')
    const deleteAction = createDeleteSpan('category')
    const actionsColumn = document.createElement('td')

    if (loginInfo.title < 2) {
        actionsColumn.classList = 'category-actions'
        actionsColumn.append(editAction, deleteAction)
    }

    const tr = document.createElement('tr')

    if (loginInfo.title < 2) {
        editAction.onpointerup = () => {
            categoryModal.querySelector('h1').textContent = 'Редагувати категорію'
            categoryModal.querySelector('input').value = category.name
            categoryModal.querySelector('button').onpointerup = () => editCategory(category.id, tr)
            hideBodyOverflow()
            categoryModal.style.display = 'flex'
        }

        deleteAction.onpointerup = () => showConfirm(`Видалити категорію "${category.name}"?\nТовари у цій категорії видаляться.`, () => 
            remove('Category', category).then(() => {
                setTimeout(() => hideModal(confirmModal), 1)
                showMessage('info', deleteSuccessMessage('категорію'))
                categories.splice(categories.findIndex(c => c.id === category.id), 1)
                categoriesTable.removeChild(tr)

                if (categoriesTable.children.length === 1) {
                    categoriesTable.style.display = ''
                    categoriesInput.style.display = ''
                }
            }).catch(() => showMessage('error', deleteErrorMessage('категорію'))))
    }

    tr.append(
        createTd(category.name),
        loginInfo.title < 2 ? actionsColumn : createTd()
    )
    return tr
}

const fillCategoriesTable = category => {
    if (!category) {
        categoriesTable.innerHTML = categoriesTable.querySelector('tbody').innerHTML
        categoriesTable.append(createEmptyDataDiv())
        return
    }

    categoriesTable.append(createCategoryRow(category))
}

const createCategory = () => {
    const nameElement = categoryModal.querySelector('.category-name')
    const name = nameElement.value.trim()

    if (!name) {
        showMessage('error', 'Введіть назву категорії')
        return
    }

    const payButton = categoryModal.querySelector('button')
    payButton.disabled = true

    const category = {
        companyId: loginInfo.companyId,
        name
    }

    post('Category', category).then(response => {
        hideModalEnableButton(categoryModal, payButton)
        showMessage('success', createSuccessMessage('категорію'))
        category.id = response
        categories.push(category)
        fillCategoriesTable(category)
        categoriesInput.style.display = 'block'
        categoriesTable.style.display = 'block'
    }).catch(e => {
        hideModalEnableButton(categoryModal, payButton)

        if (e.message === '403') {
            showMessage('error', 'Категорія з такою назвою вже існує')
            return
        }

        showMessage('error', createErrorMessage('категорію'))
    })
}

const editCategory = (id, oldRow) => {
    const nameElement = categoryModal.querySelector('.category-name')
    const name = nameElement.value

    if (!name) {
        showMessage('error', 'Введіть назву категорії')
        return
    }

    const payButton = categoryModal.querySelector('button')
    payButton.disabled = true

    const category = {
        id,
        companyId: loginInfo.companyId,
        name
    }

    put('Category', category).then(() => {
        hideModalEnableButton(categoryModal, payButton)
        showMessage('info', updateSuccessMessage('категорію'))
        const newRow = createCategoryRow(category)
        categoriesTable.replaceChild(newRow, oldRow)
    }).catch(e => {
        hideModalEnableButton(categoryModal, payButton)

        if (e.message === '403') {
            showMessage('error', 'Категорія з такою назвою вже існує')
            return
        }

        showMessage('error', updateErrorMessage('категорію'))
    })
}

const categoryFilters = {
    searchQuery: '',
    sort: ''
}

const filterCategories = () => {
    let filteredCategories = [...categories]

    if (categoryFilters.searchQuery) {
        filteredCategories = filteredCategories.filter(c => c.name.toLowerCase().includes(categoryFilters.searchQuery))
    }

    if (categoryFilters.sort === 'asc') {
        filteredCategories.sort((a, b) => a.name.localeCompare(b.name))
    } else if (categoryFilters.sort === 'desc') {
        filteredCategories.sort((b, a) => a.name.localeCompare(b.name))
    }

    if (!filteredCategories.length) {
        fillCategoriesTable(null)
        return
    }

    categoriesTable.innerHTML = categoriesTable.querySelector('tbody').innerHTML
    filteredCategories.forEach(c => fillCategoriesTable(c))
}

const searchCategory = () => {
    categoryFilters.searchQuery = categoriesInput.value.trim().toLowerCase()
    filterCategories()
}

const sortCategories = () => {
    const sortIcon = categoriesTable.querySelector('tbody tr td:first-child').querySelectorAll('span').item(1)

    if (sortIcon.innerHTML === 'unfold_more') {
        sortIcon.innerHTML = 'arrow_drop_up'
        categoryFilters.sort = 'asc'
    } else if (sortIcon.innerHTML === 'arrow_drop_up') {
        sortIcon.innerHTML = 'arrow_drop_down'
        categoryFilters.sort = 'desc'
    } else {
        sortIcon.innerHTML = 'unfold_more'
        categoryFilters.sort = ''
    }

    filterCategories()
}
