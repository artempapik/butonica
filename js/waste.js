let wastesTable, wasteStocks, wasteProducts

const getWastes = month => {
    showLoadAnimation()

    get(`Waste/${loginInfo.companyId}/${month || new Date().getMonth() + 1}`).then(response => {
        wastesTable.querySelector('.table-no-data')?.remove()
        wastesTable.style.display = 'block'
        wastesTable.querySelectorAll('tr:not(tbody tr)').forEach(tr => tr.remove())
        replaceLoadIcons()

        if (!response.length) {
            wastesTable.append(createEmptyDataDiv())
            return
        }

        response.forEach(w => fillWastesTable(w))
    }).catch(() => showMessage('error', getErrorMessage('списання')))
}

const showWasteInfo = e => {
    main.innerHTML = menuItemsContents['waste']
    fillSelectedMenuItem(e)
    wastesTable = document.querySelector('.waste-table table')
    getWastes(0)
    get(`Stock/ids-names/${loginInfo.companyId}`).then(response => wasteStocks = response)
    get(`Product/ids-names/${loginInfo.companyId}`).then(response => wasteProducts = response)

    const wastesCalendar = new VanillaCalendar('.waste-table td:first-child', {
        type: 'month',
        input: true,
        settings: {
            lang: 'uk'
        },
        actions: {
            clickMonth(_, self) {
                wastesCalendar.hide()
                animateChange(wastesTable)
                getWastes(self.selectedMonth + 1)
            }
        }
    })

    wastesCalendar.init()
}

const wasteModal = document.querySelector('.create-waste-modal')
const wasteInfoModal = document.querySelector('.waste-info-modal')

const createWasteModal = () => {
    wasteModal.querySelector('h1').textContent = 'Створити списання'
    wasteModal.querySelector('input').value = ''

    const wasteStocksSelect = wasteModal.querySelector('.waste-stock')
    wasteStocksSelect.innerHTML = ''

    for (const stock of wasteStocks) {
        const option = document.createElement('option')
        option.text = stock.name
        option.dataset.id = stock.id
        wasteStocksSelect.add(option)
    }

    $(wasteStocksSelect).select2(select2NoSearch('Обрати склад'))
    wasteModal.querySelector('textarea').value = ''

    const wasteProducts = wasteModal.querySelector('.waste-products')
    wasteProducts.style.display = ''

    const wasteProductsHeader = wasteProducts.querySelector('div').innerHTML
    wasteProducts.innerHTML = ''
    const div = document.createElement('div')
    div.classList = 'waste-products-row'
    div.innerHTML = wasteProductsHeader
    wasteProducts.append(div)

    wasteModal.querySelector('button:not(.one-more-product)').onpointerup = () => createWaste()
    hideBodyOverflow()
    wasteModal.style.display = 'flex'
}

const createWasteRow = waste => {
    const editAction = createEditSpan('waste')
    const deleteAction = createDeleteSpan('waste')
    const actionsColumn = document.createElement('td')
    actionsColumn.classList = 'waste-actions'
    actionsColumn.append(deleteAction)

    const tr = document.createElement('tr')
    tr.onpointerup = e => {
        const tagName = e.target.tagName.toLowerCase()
        if (tagName === 'span' &&
            e.target.className &&
            e.target.className !== 'material-symbols-outlined') {
            return
        }

        showPageLoad()
        hideBodyOverflow()

        wasteInfoModal.querySelector('.waste-date').textContent = formatWeekDate(waste.date, true)
        wasteInfoModal.querySelector('.waste-stock').textContent = waste.stock
        wasteInfoModal.querySelector('.waste-employee').textContent = employeesNames ? `${waste.employee} (${employeesNames[waste.employee]})` : waste.employee

        get(`Waste/waste/${waste.id}`).then(response => {
            hidePageLoad()
            showHideNodeInfo(wasteInfoModal, 'waste-comment', response.comment)

            const wasteProductsTable = wasteInfoModal.querySelector('.waste-products table')
            wasteProductsTable.innerHTML = wasteProductsTable.querySelector('tbody').innerHTML

            for (const product of response.products) {
                const tr = document.createElement('tr')
                tr.append(
                    createTd(product.product),
                    createTd(product.amount)
                )
                wasteProductsTable.append(tr)
            }

            wasteInfoModal.style.display = 'flex'
            wasteInfoModal.querySelector('.waste-info-modal-content').scroll(0, 0)
        }).catch(() => {
            hidePageLoad()
            showMessage('error', getErrorMessage('списання'))
        })
    }

    editAction.onpointerup = () => {
        wasteModal.querySelector('h1').textContent = 'Редагувати списання'
        wasteModal.querySelector('button').onpointerup = () => editWaste(waste.id, tr)
        wasteModal.style.display = 'flex'
    }

    deleteAction.onpointerup = () => {
        delete waste.stock
        delete waste.employee

        showConfirm('Видалити списання?', () => remove('Waste', waste).then(() => {
            setTimeout(() => hideModal(confirmModal), 1)
            showMessage('info', deleteSuccessMessage('списання'))
            wastesTable.removeChild(tr)

            if (wastesTable.children.length === 1) {
                wastesTable.style.display = ''
            }
        }).catch(() => showMessage('error', deleteErrorMessage('списання'))))
    }

    tr.append(
        formatWeekDate(waste.date),
        createTd(waste.stock),
        createTd(waste.employee),
        actionsColumn
    )
    return tr
}

const fillWastesTable = waste => {
    if (!waste) {
        wastesTable.innerHTML = wastesTable.querySelector('tbody').innerHTML
        wastesTable.append(createEmptyDataDiv())
        return
    }

    wastesTable.append(createWasteRow(waste))
}

const createWaste = () => {
    const dateElement = wasteModal.querySelector('.waste-date')

    if (!dateElement.value) {
        showMessage('error', 'Вкажіть дату списання')
        return
    }
    
    const date = new Date(dateElement.value)
    const now = new Date()
    date.setHours(now.getHours())
    date.setMinutes(now.getMinutes())

    const stockElement = wasteModal.querySelector('.waste-stock')
    const comment = wasteModal.querySelector('.waste-comment').value.trim()

    const products = []

    for (const wasteProduct of wasteModal.querySelectorAll('.waste-product')) {
        products.push({
            productId: +wasteProduct.querySelector('select').selectedOptions[0].dataset.id,
            amount: +wasteProduct.querySelector('.enter-value').textContent || 0
        })
    }

    if (!products.length) {
        showMessage('error', 'Ви не списали жодного товару')
        return
    }

    for (const product of products) {
        if (!product.productId || !product.amount) {
            showMessage('error', 'Вкажіть залишки для всіх товарів')
            return
        }
    }

    for (let i = 0; i < products.length; i++) {
        for (let j = i + 1; j < products.length; j++) {
            if (products[i].productId === products[j].productId) {
                showMessage('error', 'Ви не можете списати 2 однакових товара')
                return
            }
        }
    }

    const payButton = wasteModal.querySelector('button:not(.one-more-product)')
    payButton.disabled = true

    const waste = {
        date,
        employeeId: loginInfo.employeeId,
        stockId: +stockElement.selectedOptions[0].dataset.id,
        comment,
        products
    }

    post('Waste', waste).then(response => {
        hideModalEnableButton(wasteModal, payButton)
        showMessage('success', createSuccessMessage('списання'))
        waste.id = response
        waste.stock = stockElement.value
        fillWastesTable(waste)
        wastesTable.style.display = 'block'
    }).catch(e => {
        hideModalEnableButton(wasteModal, payButton)

        if (e.message === '403') {
            showMessage('error', 'Списання не може перевищувати залишок на складі')
            return
        }

        showMessage('error', createErrorMessage('списання'))
    })
}

const editWaste = (id, oldRow) => {
    const waste = { id }
    hideModal(wasteModal)

    put('Waste', waste).then(() => {
        showMessage('info', updateSuccessMessage('списання'))
        const newRow = createWasteRow(waste)
        wastesTable.replaceChild(newRow, oldRow)
    }).catch(() => showMessage('error', updateErrorMessage('списання')))
}

const addWasteProduct = () => {
    const wasteProductsBlock = wasteModal.querySelector('.waste-products')
    const wasteProductSelect = document.createElement('select')

    for (const product of wasteProducts) {
        const option = document.createElement('option')
        option.text = product.name
        option.value = product.name
        option.dataset.id = product.id
        wasteProductSelect.add(option)
    }

    wasteProductSelect.value = ''

    const amount = document.createElement('span')
    amount.classList = 'enter-value'
    amount.onpointerup = () => createCalculatorValueSpan(amount)

    const div = document.createElement('div')
    div.append(wasteProductSelect, amount)

    const remove = document.createElement('span')
    remove.classList = 'material-symbols-outlined'
    remove.textContent = 'remove_circle_outline'

    remove.onpointerup = e => {
        e.target.parentNode.remove()

        if (wasteProductsBlock.children.length === 1) {
            wasteProductsBlock.style.display = ''
        }
    }

    const wasteProduct = document.createElement('div')
    wasteProduct.classList = 'waste-product'
    wasteProduct.append(div, remove)

    wasteProductsBlock.append(wasteProduct)
    wasteProductsBlock.style.display = 'flex'
    $(wasteProductSelect).select2(select2NoResults('Обрати товар', '13rem'))
}
