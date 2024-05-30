let inventoriesTable, inventoryFilters, inventories, inventoryStocks, inventoriesPages

const getInventories = month => {
    showLoadAnimation()

    get(`Inventory/${loginInfo.companyId}/${month || new Date().getMonth() + 1}`).then(response => {
        inventories = response
        inventoriesTable.querySelector('.table-no-data')?.remove()
        inventoriesTable.style.display = 'block'
        inventoriesTable.querySelectorAll('tr:not(tbody tr)').forEach(tr => tr.remove())
        replaceLoadIcons()

        if (!inventories.length) {
            inventoriesTable.append(createEmptyDataDiv())
            return
        }

        inventories.forEach(i => fillInventoriesTable(i))
        setFixedTable(inventoriesTable)
    }).catch(() => showMessage('error', 'інвентаризації'))
}

const showInventoryInfo = e => {
    main.innerHTML = menuItemsContents['inventory']
    fillSelectedMenuItem(e)
    inventoriesTable = document.querySelector('.inventory-table table')
    inventoryFilters = document.querySelector('.inventory-filters')
    getInventories(0)

    get(`Stock/ids-names/${loginInfo.companyId}`).then(response => {
        inventoryStocks = response

        if (response.length < 2) {
            inventoryFilters.style.display = ''
            return
        }

        inventoryFilters.style.display = 'flex'
        fillInventoryFilters(inventoryFilters, inventoryStocks, 'name')
    })

    const inventoryCalendar = new VanillaCalendar('.inventory-table td:nth-child(2)', {
        type: 'month',
        input: true,
        settings: {
            lang: 'uk'
        },
        actions: {
            clickMonth(_, self) {
                inventoryCalendar.hide()
                animateChange(inventoriesTable)
                getInventories(self.selectedMonth + 1)
            }
        }
    })

    inventoryCalendar.init()
}

const fillInventoryFilters = (filtersBlock, items, key) => {
    for (const item of items) {
        const buttonName = document.createElement('span')
        buttonName.textContent = item[key]
        const button = document.createElement('button')

        button.onpointerup = () => {
            const checkedButtonColor = 'rgb(230, 230, 230)'

            if (button.style.color === checkedButtonColor) {
                button.style.background = 'rgb(242, 242, 242)'
                button.style.color = 'rgb(50, 50, 50)'
            } else {
                button.style.background = 'rgba(79, 118, 181, .8)'
                button.style.color = checkedButtonColor
            }

            const filterButtons = filtersBlock.querySelectorAll('button:not(:first-of-type)')
            const filters = []

            for (const button of filterButtons) {
                if (button.style.color === checkedButtonColor) {
                    filters.push(button.textContent)
                }
            }

            const allCategoriesButton = filtersBlock.querySelector('button')

            if (filters.length) {
                allCategoriesButton.style.background = 'rgb(242, 242, 242)'
                allCategoriesButton.style.color = 'rgb(50, 50, 50)'
                filterInventories(inventories.filter(i => filters.some(f => i.stock === f)))
                return
            }

            allCategoriesButton.style.background = 'rgba(79, 118, 181, .8)'
            allCategoriesButton.style.color = checkedButtonColor
            filterInventories(inventories)
        }

        button.append(buttonName)
        filtersBlock.append(button)
    }
}

const filterInventories = inventories => {
    if (!inventories.length) {
        fillInventoriesTable(null)
        return
    }

    inventoriesTable.innerHTML = inventoriesTable.querySelector('tbody').innerHTML
    inventories.forEach(i => fillInventoriesTable(i))
}

const showAllInventories = () => {
    const filterButtons = inventoryFilters.querySelectorAll('button:not(:first-of-type)')

    for (const button of filterButtons) {
        button.style.background = 'rgb(242, 242, 242)'
        button.style.color = 'rgb(50, 50, 50)'
    }

    const allCategoriesButton = inventoryFilters.querySelector('button')
    allCategoriesButton.style.background = 'rgba(79, 118, 181, .8)'
    allCategoriesButton.style.color = 'rgb(230, 230, 230)'

    filterInventories(inventories)
}

const inventoryModal = document.querySelector('.create-inventory-modal')
const inventoryInfoModal = document.querySelector('.inventory-info-modal')

const createInventoryModal = () => {
    inventoryModal.querySelector('h1').textContent = 'Створити інвентаризацію'
    inventoryModal.querySelector('input').value = ''

    inventoryModal.querySelector('.total-sum').style.display = ''
    const totalSumSpan = inventoryModal.querySelector('.total-sum span:nth-child(2)')
    totalSumSpan.classList = ''
    totalSumSpan.textContent = '0.00'

    const inventoryStocksSelect = inventoryModal.querySelector('.inventory-stock')
    inventoryStocksSelect.innerHTML = ''

    for (const stock of inventoryStocks) {
        const option = document.createElement('option')
        option.text = stock.name
        option.dataset.id = stock.id
        inventoryStocksSelect.add(option)
    }

    $(inventoryStocksSelect).val('').select2(select2NoSearch('Обрати склад'))
    const inventoryProductsTable = inventoryModal.querySelector('table')

    const fillInventoriesModalTable = stockId => {
        if (!stockId) {
            inventoryProductsTable.style.display = ''
            return
        }

        inventoryProductsTable.innerHTML = inventoryProductsTable.querySelector('tbody').innerHTML

        get(`Inventory/products/${stockId}`).then(response => {
            for (const inventoryProduct of response) {
                const productNameColumn = document.createElement('td')
                productNameColumn.textContent = inventoryProduct.name
                productNameColumn.dataset.id = inventoryProduct.id

                const deltaColumn = document.createElement('td')
                deltaColumn.textContent = '0'

                const sumColumn = document.createElement('td')
                sumColumn.textContent = '0.00'

                const productFactAmount = document.createElement('input')
                productFactAmount.onchange = () => {
                    const delta = +productFactAmount.value - inventoryProduct.amount
                    deltaColumn.textContent = delta.toFixed(2)

                    const sum = delta * inventoryProduct.buyingCost
                    sumColumn.classList = getClassForNumber(sum)
                    sumColumn.textContent = sum.toFixed(2)

                    let totalSum = 0

                    for (const td of inventoryModal.querySelectorAll('tr:not(:first-child) td:last-child')) {
                        totalSum += +td.textContent
                    }
                    
                    totalSumSpan.classList = getClassForNumber(totalSum)
                    totalSumSpan.textContent = totalSum.toFixed(2)
                }

                productFactAmount.oninput = e => handlePriceInput(e)
                productFactAmount.value = inventoryProduct.amount
                productFactAmount.type = 'number'
                productFactAmount.min = '0'
                productFactAmount.max = '100000'

                const productFactAmountColumn = document.createElement('td')
                productFactAmountColumn.append(productFactAmount)

                const tr = document.createElement('tr')

                tr.append(
                    productNameColumn,
                    createTd(inventoryProduct.amount),
                    productFactAmountColumn,
                    deltaColumn,
                    sumColumn
                )

                inventoryProductsTable.append(tr)
            }

            inventoryProductsTable.style.display = 'block'
            inventoryProductsTable.scroll(0, 0)
            inventoryModal.querySelector('.total-sum').style.display = 'flex'
        })
    }

    inventoryStocksSelect.value = ''
    fillInventoriesModalTable('')
    inventoryStocksSelect.onchange = e => fillInventoriesModalTable(e.target.selectedOptions[0].dataset.id)

    inventoryModal.querySelector('button').onpointerup = () => createInventory()
    hideBodyOverflow()
    inventoryModal.style.display = 'flex'
}

const createInventoryRow = inventory => {
    const inventoryResultColumn = document.createElement('td')
    inventoryResultColumn.classList = getClassForNumber(inventory.totalSum)
    inventoryResultColumn.textContent = inventory.totalSum.toFixed(2) + ' грн'

    const editAction = createEditSpan('inventory')
    const deleteAction = createDeleteSpan('inventory')
    const actionsColumn = document.createElement('td')
    actionsColumn.classList = 'inventory-actions'
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
        
        inventoryInfoModal.querySelector('.inventory-date').textContent = formatWeekDate(inventory.date, true)
        inventoryInfoModal.querySelector('.inventory-stock').textContent = inventory.stock

        get(`Inventory/inventory/${inventory.id}`).then(response => {
            if (!response.length) {
                throw new Exception()
            }
            
            hidePageLoad()

            const inventoryProducts = inventoryInfoModal.querySelector('table')
            inventoryProducts.innerHTML = inventoryProducts.querySelector('tbody').innerHTML

            for (const product of response) {
                const tr = document.createElement('tr')

                tr.append(
                    createTd(product.product),
                    createTd(product.factAmount)
                )

                inventoryProducts.append(tr)
            }

            const inventoryTotal = inventoryInfoModal.querySelector('.total span:last-child')
            inventoryTotal.classList = inventory.totalSum === 0 ? '' : inventory.totalSum < 0 ? 'negative' : 'positive'
            inventoryTotal.textContent = inventory.totalSum.toFixed(2) + ' грн'
            inventoryInfoModal.style.display = 'flex'
            inventoryInfoModal.querySelector('.inventory-info-modal-content').scroll(0, 0)
        }).catch(() => {
            hidePageLoad()
            showMessage('error', getErrorMessage('інвентаризацію'))
        })
    }

    editAction.onpointerup = () => {
        inventoryModal.style.display = 'flex'
    }

    deleteAction.onpointerup = () => showConfirm(`Видалити інвентаризацію?`, () => {
        delete inventory.stock
        
        remove('Inventory', inventory).then(() => {
            setTimeout(() => hideModal(confirmModal), 1)
            showMessage('info', deleteSuccessMessage('інвентаризацію'))
            inventoriesTable.removeChild(tr)

            if (inventoriesTable.children.length === 1) {
                inventoriesTable.style.display = ''
            }
        }).catch(() => showMessage('error', deleteErrorMessage('інвентаризацію')))
    })

    tr.append(
        createTd(inventory.stock),
        formatWeekDate(inventory.date),
        inventoryResultColumn,
        actionsColumn
    )
    return tr
}

const fillInventoriesTable = inventory => {
    if (!inventory) {
        inventoriesTable.innerHTML = inventoriesTable.querySelector('tbody').innerHTML
        inventoriesTable.append(createEmptyDataDiv())
        return
    }

    inventoriesTable.append(createInventoryRow(inventory))
}

const createInventory = () => {
    const dateElement = inventoryModal.querySelector('.inventory-date')

    if (!dateElement.value) {
        showMessage('error', 'Вкажіть дату інвентаризації')
        return
    }
    
    const date = new Date(dateElement.value)
    const now = new Date()
    date.setHours(now.getHours())
    date.setMinutes(now.getMinutes())

    const stockElement = inventoryModal.querySelector('.inventory-stock')
    const stock = stockElement.value

    if (!stock) {
        showMessage('error', 'Оберіть склад')
        return
    }

    const payButton = inventoryModal.querySelector('button')
    payButton.disabled = true

    const products = []

    for (const tr of inventoryModal.querySelectorAll('tr:not(:first-child)')) {
        products.push({
            productId: +tr.querySelector('td:first-child').dataset.id,
            factAmount: +tr.querySelector('td:nth-child(3) input').value
        })
    }

    if (!products.length) {
        showMessage('error', 'Додайте товари до інвентаризації')
        return
    }

    const inventory = {
        date,
        stockId: +stockElement.selectedOptions[0].dataset.id,
        products,
        totalSum: +inventoryModal.querySelector('.total-sum span:nth-child(2)').textContent
    }

    post('Inventory', inventory).then(response => {
        hideModalEnableButton(inventoryModal, payButton)
        showMessage('success', 'Інвентаризацію проведено')
        inventory.id = response
        inventory.stock = stock
        inventories.push(inventory)
        fillInventoriesTable(inventory)
        inventoriesTable.style.display = 'block'
    }).catch(() => {
        hideModalEnableButton(inventoryModal, payButton)
        showMessage('error', 'Не вдалося провести інвентаризацію')
    })
}

const editInventory = () => {
}
