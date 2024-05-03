let suppliesTable, supplyProducts

const getSupplies = month => {
    showLoadAnimation()

    get(`Supply/${loginInfo.companyId}/${month || new Date().getMonth() + 1}`).then(response => {
        suppliesTable.innerHTML = suppliesTable.querySelector('tbody').innerHTML
        suppliesTable.style.display = 'block'
        replaceLoadIcons()

        if (!response.length) {
            suppliesTable.append(createEmptyDataDiv())
            return
        }

        response.forEach(s => fillSuppliesTable(s))
    }).catch(() => showMessage('error', getErrorMessage('поставки')))
}

const getSuppliesByPeriod = () => {
    const periodFilter = document.querySelector('.period-filter')
    const periodFrom = periodFilter.querySelector('.period-from')
    const periodTo = periodFilter.querySelector('.period-to')

    const periodFromDate = periodFrom.value ? new Date(periodFrom.value) : false
    const periodToDate = periodTo.value ? new Date(periodTo.value) : false

    if (!periodFromDate || !periodToDate) {
        showMessage('error', 'Оберіть обидва періоди')
        return
    }

    if (periodToDate - periodFromDate < 0) {
        showMessage('error', 'Невірно вибрані періоди')
        return
    }

    showLoadAnimation()

    const fromDateString = `${periodFromDate.getDate()}/${periodFromDate.getMonth() + 1}/${periodFromDate.getFullYear()}`
    const toDateString = `${periodToDate.getDate()}/${periodToDate.getMonth() + 1}/${periodToDate.getFullYear()}`

    get(`Supply/${loginInfo.companyId}/${fromDateString}/${toDateString}`).then(response => {
        suppliesTable.innerHTML = suppliesTable.querySelector('tbody').innerHTML
        suppliesTable.style.display = 'block'
        replaceLoadIcons()

        if (!response.length) {
            suppliesTable.append(createEmptyDataDiv())
            return
        }

        response.forEach(s => fillSuppliesTable(s))
    }).catch(() => showMessage('error', getErrorMessage('поставки')))
}

const showSupplyInfo = e => {
    main.innerHTML = menuItemsContents['supply']
    fillSelectedMenuItem(e)
    suppliesTable = document.querySelector('.supply-table table')
    getSupplies(0)

    const supplyViewTypes = document.querySelectorAll('.supply-view-type .type')
    supplyViewTypes.forEach((type, index) => {
        type.onpointerup = () => {
            supplyViewTypes.forEach(t => t.classList.remove('active'))
            type.classList.add('active')

            const monthFilter = document.querySelector('.month-filter')
            const periodFilter = document.querySelector('.period-filter')

            if (index) {
                monthFilter.style.display = 'none'
                periodFilter.style.display = 'flex'
                return
            }

            getSupplies(document.querySelector('.month-filter select').selectedIndex)
            monthFilter.style.display = 'flex'
            periodFilter.style.display = 'none'
        }
    })

    get(`Contractor/ids-names/${loginInfo.companyId}`).then(response => {
        const selector = 'supply-contractor'
        const supplyContractorsList = supplyModal.querySelector('#' + selector)
        supplyContractorsList.innerHTML = ''

        for (const contractor of response) {
            const option = document.createElement('option')
            option.value = contractor.name
            option.dataset.id = contractor.id
            supplyContractorsList.append(option)
        }

        keepDatalistOptions(selector)
    })

    get(`Stock/ids-names/${loginInfo.companyId}`).then(response => {
        const supplyStocks = supplyModal.querySelector('.supply-stock')
        supplyStocks.innerHTML = ''

        for (const stock of response) {
            const option = document.createElement('option')
            option.text = stock.name
            option.dataset.id = stock.id
            supplyStocks.add(option)
        }
    })

    get(`Product/ids-names/${loginInfo.companyId}`).then(response => {
        supplyProducts = response

        const supplyProductsList = supplyModal.querySelector('#supply-product')
        supplyProductsList.innerHTML = ''

        for (const product of supplyProducts) {
            const option = document.createElement('option')
            option.value = product.name
            option.dataset.id = product.id
            supplyProductsList.append(option)
        }
    })
}

const supplyModal = document.querySelector('.create-supply-modal')
const supplyModalContent = supplyModal.querySelector('.create-supply-modal-content')
const supplyInfoModal = document.querySelector('.supply-info-modal')
const totalSumElement = supplyModal.querySelector('.total-sum span:nth-child(2)')
const totalSumAssociatedCostsSpan = supplyModal.querySelector('.total-sum-associated-costs')
const totalSumAssociatedCostsElement = totalSumAssociatedCostsSpan.querySelector('span:nth-child(2)')

const calculateSupplyTotalSum = () => {
    let totalSum = 0
    let totalSumAssociatedCosts = 0

    for (const td of supplyModal.querySelectorAll('tr:not(:first-child) td:nth-child(4)')) {
        totalSum += +td.querySelector('span').textContent
    }

    for (const div of supplyModal.querySelectorAll('.associated-costs-data div')) {
        totalSumAssociatedCosts += +div.querySelector('input:last-of-type').value
    }

    totalSumElement.textContent = totalSum.toFixed(2)
    totalSumAssociatedCostsElement.textContent = (totalSum + totalSumAssociatedCosts).toFixed(2)
}

const createSupplyModal = () => {
    supplyModal.querySelector('h1').textContent = 'Створити поставку'
    supplyModal.querySelectorAll('input').forEach(i => i.value = '')
    supplyModal.querySelector('input[list=supply-contractor]').placeholder = ''

    const supplyStock = supplyModal.querySelector('.supply-stock')

    if (supplyStock.children.length > 1) {
        supplyStock.value = ''
    }

    supplyModal.querySelector('.supply-paid-sum').value = '0'

    const associatedCosts = supplyModal.querySelector('.associated-costs-data')
    associatedCosts.innerHTML = ''
    totalSumAssociatedCostsSpan.style.display = ''

    const suppliesProductsTable = supplyModal.querySelector('table')
    suppliesProductsTable.innerHTML = suppliesProductsTable.querySelector('tbody').innerHTML
    supplyModal.querySelector('.update-buying-cost input').checked = false

    totalSumElement.textContent = '0.00'
    totalSumAssociatedCostsElement.textContent = '0.00'

    supplyModal.querySelector('button:not(.one-more-product)').onpointerup = () => createSupply()
    hideBodyOverflow()
    supplyModal.style.display = 'flex'
    supplyModalContent.scroll(0, 0)
}

const createSupplyRow = supply => {
    const editAction = createEditSpan('supply')
    const deleteAction = createDeleteSpan('supply')
    const actionsColumn = document.createElement('td')
    actionsColumn.classList = 'supply-actions'
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
        
        supplyInfoModal.querySelector('.supply-date').textContent = formatWeekDate(supply.date, true)
        supplyInfoModal.querySelector('.supply-contractor').textContent = supply.contractor
        supplyInfoModal.querySelector('.supply-stock').textContent = supply.stock

        get(`Supply/supply/${supply.id}`).then(response => {
            hidePageLoad()

            showHideNodeInfo(supplyInfoModal, 'supply-paid-sum', response.paidSum ? response.paidSum.toFixed(2) + ' грн' : '')
            showHideNodeInfo(supplyInfoModal, 'supply-pay-date', formatWeekDate(response.payDate, true))
            showHideNodeInfo(supplyInfoModal, 'supply-comment', response.comment)

            const supplyProductsTable = supplyInfoModal.querySelector('.supply-products table')
            supplyProductsTable.innerHTML = supplyProductsTable.querySelector('tbody').innerHTML

            for (const product of response.products) {
                const tr = document.createElement('tr')
                tr.append(
                    createTd(product.product),
                    createTd(product.amount),
                    createTd(product.price.toFixed(2)),
                    createTd(product.sum.toFixed(2))
                )
                supplyProductsTable.append(tr)
            }

            supplyInfoModal.querySelector('.total-sum span:last-child').textContent = response.totalSum.toFixed(2) + ' грн'

            const associatedCosts = supplyInfoModal.querySelector('.supply-associated-costs')
            associatedCosts.querySelector('table').innerHTML = associatedCosts.querySelector('table tbody').innerHTML
            const associatedCostsBlock = supplyInfoModal.querySelector('.total-sum-associated-costs')

            if (!response.associatedCosts.length) {
                associatedCosts.style.display = 'none'
                associatedCostsBlock.style.display = 'none'
            } else {
                for (const associatedCost of response.associatedCosts) {
                    const tr = document.createElement('tr')
                    tr.append(
                        createTd(associatedCost.name),
                        createTd(associatedCost.cost.toFixed(2) + ' грн'),
                    )
                    associatedCosts.querySelector('table').append(tr)
                }

                associatedCostsBlock.querySelector('span:last-child').textContent = response.totalSumAssociatedCosts.toFixed(2) + ' грн'
                associatedCosts.style.display = 'block'
                associatedCostsBlock.style.display = 'flex'
            }

            supplyInfoModal.style.display = 'flex'
            supplyInfoModal.querySelector('.supply-info-modal-content').scroll(0, 0)
        }).catch(() => {
            hidePageLoad()
            showMessage('error', getErrorMessage('поставку'))
        })
    }

    editAction.onpointerup = () => {
        supplyModal.querySelector('h1').textContent = 'Редагувати поставку'
        supplyModal.querySelector('.supply-date').value = supply.date
        supplyModal.querySelector('.supply-contractor').value = supply.contractor
        supplyModal.querySelector('.supply-stock').value = supply.stock
        supplyModal.querySelector('.supply-paid-sum').value = supply.paidSum
        supplyModal.querySelector('.supply-pay-date').value = supply.payDate
        supplyModal.querySelector('.supply-comment').value = supply.comment

        const supplyProductsTable = document.querySelector('.supply-products table')
        supplyProductsTable.innerHTML = supplyProductsTable.querySelector('tbody').innerHTML

        const changeSum = () => {
            const sum = +productAmountElement.value * +productPriceElement.value
            supplyModal.querySelector('tr:not(:first-child) td:nth-child(4) span').textContent = sum.toFixed(2)
            calculateSupplyTotalSum()
        }

        for (const product of supply.products.slice(1)) {
            const supplyProductSelect = document.createElement('select')

            for (const product of supplyProducts) {
                const option = document.createElement('option')
                option.text = product.name
                supplyProductSelect.add(option)
            }

            supplyProductSelect.value = product.supplyProduct
            const supplyProductColumn = document.createElement('td')
            supplyProductColumn.append(supplyProductSelect)

            const supplyProductSum = document.createElement('span')
            supplyProductSum.textContent = product.sum

            const supplyProductSumColumn = document.createElement('td')
            supplyProductSumColumn.append(supplyProductSum)

            const changeSum = () => {
                const sum = +supplyProductAmount.value * +supplyProductPrice.value
                supplyProductSum.textContent = sum.toFixed(2)
                calculateSupplyTotalSum()
            }

            const supplyProductAmount = document.createElement('input')
            supplyProductAmount.onchange = () => changeSum()
            supplyProductAmount.value = product.amount
            supplyProductAmount.type = 'number'
            supplyProductAmount.min = '0'
            supplyProductAmount.max = '1000'
            const supplyProductAmountColumn = document.createElement('td')
            supplyProductAmountColumn.append(supplyProductAmount)
            
            const supplyProductPrice = document.createElement('input')
            supplyProductPrice.onchange = () => changeSum()
            supplyProductPrice.value = product.price
            supplyProductPrice.type = 'number'
            supplyProductPrice.min = '0'
            supplyProductPrice.max = '1000'
            const supplyProductPriceColumn = document.createElement('td')
            supplyProductPriceColumn.append(supplyProductPrice)

            changeSum()

            const removeSupplyProduct = document.createElement('span')
            removeSupplyProduct.classList = 'material-symbols-outlined'

            removeSupplyProduct.onpointerup = e => {
                const productRow = e.target.parentNode.parentNode
                totalSumElement.textContent = (+totalSumElement.textContent - +supplyProductSum.textContent).toFixed(2)
                supplyProductsTable.removeChild(productRow)
            }

            removeSupplyProduct.textContent = 'remove_circle_outline'
            const removeSupplyProductColumn = document.createElement('td')
            removeSupplyProductColumn.classList = 'remove-supply-product'
            removeSupplyProductColumn.append(removeSupplyProduct)

            const tr = document.createElement('tr')

            tr.append(
                supplyProductColumn,
                supplyProductAmountColumn,
                supplyProductPriceColumn,
                supplyProductSumColumn,
                removeSupplyProductColumn
            )

            supplyProductsTable.append(tr)
        }

        calculateSupplyTotalSum()
        supplyModal.querySelector('button:not(.one-more-product)').onpointerup = () => editSupply(supply.id, tr)
        supplyModal.style.display = 'flex'
        supplyModal.scroll(0, 0)
    }

    deleteAction.onpointerup = () => showConfirm(`Видалити поставку?`, () => {
        delete supply.stock
        delete supply.contractor

        remove('Supply', supply).then(() => {
            setTimeout(() => hideModal(confirmModal), 1)
            showMessage('info', deleteSuccessMessage('поставку'))
            suppliesTable.removeChild(tr)

            if (suppliesTable.children.length === 1) {
                suppliesTable.style.display = ''
            }
        }).catch(() => showMessage('error', deleteErrorMessage('поставку')))
    })

    tr.append(
        formatWeekDate(supply.date),
        createTd(supply.contractor),
        createTd(supply.stock),
        actionsColumn
    )
    return tr
}

const fillSuppliesTable = supply => suppliesTable.append(createSupplyRow(supply))

const createSupply = () => {
    const dateElement = supplyModal.querySelector('.supply-date')

    if (!dateElement.value) {
        showMessage('error', 'Вкажіть дату поставки')
        return
    }

    const date = new Date(dateElement.value)
    const now = new Date()
    date.setHours(now.getHours())
    date.setMinutes(now.getMinutes())

    const contractorElement = supplyModal.querySelector('input[list=supply-contractor]')
    const contractor = contractorElement.value

    if (!contractor) {
        showMessage('error', 'Оберіть постачальника')
        return
    }

    const stockElement = supplyModal.querySelector('.supply-stock')
    const stock = stockElement.value

    if (!stock) {
        showMessage('error', 'Оберіть склад поставки')
        return
    }

    const paidSum = +supplyModal.querySelector('.supply-paid-sum').value || 0
    const payDateElement = supplyModal.querySelector('.supply-pay-date')

    if ((paidSum && !payDateElement.value) || (!paidSum && payDateElement.value)) {
        showMessage('error', 'Ви не можете вказати тільки суму або дату оплати')
        return
    }

    const payDate = payDateElement.value ? new Date(payDateElement.value) : null

    if (payDate) {
        payDate.setHours(now.getHours())
        payDate.setMinutes(now.getMinutes())
    }

    if ([...supplyModal.querySelectorAll('.associated-costs-data input')].some(i => !i.value)) {
        showMessage('error', 'Введіть усі дані для супутніх витрат')
        return
    }

    const allProductChoices = [...supplyModal.querySelectorAll('input[list=supply-product]')].map(i => i.value)
    const allProductAmounts = [...supplyModal.querySelectorAll('.product-amount')].map(i => i.value)
    const allProductPrices = [...supplyModal.querySelectorAll('.product-price')].map(i => i.value)

    if (!allProductChoices.length) {
        showMessage('error', 'Ви не додали жодного товару')
        return
    }

    if (allProductChoices.some(p => !p) ||
        allProductAmounts.some(p => !p) ||
        allProductPrices.some(p => !p)) {
        showMessage('error', 'Введіть усі дані для товарів')
        return
    }

    for (let i = 0; i < allProductChoices.length; i++) {
        for (let j = i + 1; j < allProductChoices.length; j++) {
            if (allProductChoices[i] === allProductChoices[j] &&
                allProductPrices[i] === allProductPrices[j]) {
                    showMessage('error', 'Ви не можете мати в поставці два однакових товара з однаковими цінами')
                    return
                }
        }
    }

    const payButton = supplyModal.querySelector('button:not(.one-more-product)')
    payButton.disabled = true

    const comment = supplyModal.querySelector('.supply-comment').value.trim()
    const totalSum = +totalSumElement.textContent
    const totalSumAssociatedCosts = +totalSumAssociatedCostsElement.textContent

    const products = []

    for (const tr of supplyModal.querySelectorAll('tr:not(:first-child)')) {
        const supplyProduct = tr.querySelector('td:first-child input')
        const amount = +tr.querySelector('td:nth-child(2) input').value
        const price = +tr.querySelector('td:nth-child(3) input').value
        const sum = +tr.querySelector('td:nth-child(4) span').textContent

        products.push({
            productId: +supplyProduct.dataset.id,
            amount,
            price,
            sum
        })
    }

    const associatedCosts = []

    for (const div of supplyModal.querySelectorAll('.associated-costs-data div')) {
        associatedCosts.push({
            name: div.querySelector('input:first-of-type').value,
            cost: +div.querySelector('input:last-of-type').value
        })
    }

    const supply = {
        date,
        contractorId: +contractorElement.dataset.id,
        stockId: +stockElement.selectedOptions[0].dataset.id,
        paidSum,
        payDate,
        comment,
        totalSum,
        totalSumAssociatedCosts,
        products,
        associatedCosts,
        updateBuyingCost: supplyModal.querySelector('.update-buying-cost input').checked
    }

    post('Supply', supply).then(response => {
        hideModalEnableButton(supplyModal, payButton)
        showMessage('success', createSuccessMessage('поставку'))
        supply.id = response
        supply.contractor = contractor
        supply.stock = stock
        fillSuppliesTable(supply)
        suppliesTable.style.display = 'block'
    }).catch(() => {
        hideModalEnableButton(supplyModal, payButton)
        showMessage('error', createErrorMessage('поставку'))
    })
}

const editSupply = () => {
}

const addAssociatedCost = () => {
    const associatedCostsBlock = supplyModal.querySelector('.associated-costs div')

    const name = document.createElement('input')
    name.placeholder = 'Назва'
    name.maxLength = 25

    const price = document.createElement('input')
    price.placeholder = 'Ціна'

    price.oninput = e => {
        handlePriceInput(e)
        calculateSupplyTotalSum()
    }

    price.value = ''
    price.type = 'number'
    price.min = '0'
    price.max = '1000'

    const remove = document.createElement('span')
    remove.classList = 'material-symbols-outlined'

    remove.onpointerup = e => {
        const row = e.target.parentNode
        totalSumAssociatedCostsElement.textContent = (+totalSumAssociatedCostsElement.textContent - +row.querySelector('input:last-of-type').value).toFixed(2)
        row.remove()

        if (!associatedCostsBlock.children.length) {
            totalSumAssociatedCostsSpan.style.display = ''
        }
    }

    remove.textContent = 'remove_circle_outline'

    const div = document.createElement('div')
    div.append(name, price, remove)
    associatedCostsBlock.append(div)
    totalSumAssociatedCostsSpan.style.display = 'block'
}

const addSupplyProduct = () => {
    const supplyProductsTable = supplyModal.querySelector('.supply-products table')

    const supplyProductSelect = document.createElement('input')
    const selector = 'supply-product'
    supplyProductSelect.setAttribute('list', selector)

    const supplyProductColumn = document.createElement('td')
    supplyProductColumn.append(supplyProductSelect)

    const changeSum = () => {
        const sum = +productAmount.value * +productPrice.value
        productSum.textContent = sum.toFixed(2)
        calculateSupplyTotalSum()
    }

    const productAmount = document.createElement('input')
    productAmount.classList = 'product-amount'

    productAmount.oninput = e => {
        handlePriceInput(e)
        changeSum()
    }

    productAmount.value = ''
    productAmount.type = 'number'
    productAmount.min = '0'
    productAmount.max = '1000'
    const productAmountColumn = document.createElement('td')
    productAmountColumn.append(productAmount)

    const productPrice = document.createElement('input')
    productPrice.classList = 'product-price'

    productPrice.oninput = e => {
        handlePriceInput(e)
        changeSum()
    }

    productPrice.value = ''
    productPrice.type = 'number'
    productPrice.min = '0'
    productPrice.max = '1000'
    const productPriceColumn = document.createElement('td')
    productPriceColumn.append(productPrice)

    const productSum = document.createElement('span')
    productSum.textContent = '0.00'

    const productSumColumn = document.createElement('td')
    productSumColumn.append(productSum)

    const removeSupplyProduct = document.createElement('span')
    removeSupplyProduct.classList = 'material-symbols-outlined'

    removeSupplyProduct.onpointerup = e => {
        totalSumElement.textContent = (+totalSumElement.textContent - +productSum.textContent).toFixed(2)
        totalSumAssociatedCostsElement.textContent = (+totalSumAssociatedCostsElement.textContent - +productSum.textContent).toFixed(2)
        e.target.parentNode.parentNode.remove()

        const table = supplyModal.querySelector('table')

        if (table.children.length === 1) {
            table.querySelector('tbody').style.display = ''
        }
    }

    removeSupplyProduct.textContent = 'remove_circle_outline'
    const removeSupplyProductColumn = document.createElement('td')
    removeSupplyProductColumn.classList = 'remove-supply-product'
    removeSupplyProductColumn.append(removeSupplyProduct)

    const tr = document.createElement('tr')

    tr.append(
        supplyProductColumn,
        productAmountColumn,
        productPriceColumn,
        productSumColumn,
        removeSupplyProductColumn
    )
    supplyProductsTable.append(tr)
    supplyModal.querySelector('table tbody').style.display = 'contents'
    keepDatalistOptions(selector)
}
