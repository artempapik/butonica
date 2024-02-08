let flavorsTable, flavorProductsOptions

const showFlavorInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['flavor']
    flavorsTable = document.querySelector('.flavor-table table')

    get(`Flavor/${loginInfo.companyId}`).then(response => {
        if (response.length) {
            flavorsTable.style.display = 'block'
        }

        response.forEach(f => fillFlavorsTable(f))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('букети')))

    get(`Stock/ids-names/${loginInfo.companyId}`).then(response => {
        const flavorStocks = flavorModal.querySelector('.flavor-stock')
        flavorStocks.innerHTML = ''

        for (const stock of response) {
            const option = document.createElement('option')
            option.text = stock.name
            option.dataset.id = stock.id
            flavorStocks.add(option)
        }
    })

    get(`Product/ids-names-all-costs/${loginInfo.companyId}`).then(response => {
        const flavorProductsList = flavorModal.querySelector('#flavor-product')
        flavorProductsList.innerHTML = ''

        for (const product of response) {
            const option = document.createElement('option')
            option.value = product.name
            option.dataset.id = product.id
            option.dataset.buyingCost = product.buyingCost
            option.dataset.cost = product.cost
            flavorProductsList.append(option)
        }

        flavorProductsOptions = flavorModal.querySelectorAll(`#flavor-product option`)
    })
}

const flavorModal = document.querySelector('.create-flavor-modal')
const flavorInfoModal = document.querySelector('.flavor-info-modal')
const flavorTemplatesModal = document.querySelector('.flavor-templates-modal')

const flavorTotalBuyingSumElement = flavorModal.querySelector('.total-buying-sum span:last-child')
const flavorTotalSumElement = flavorModal.querySelector('.total-sum input')

const calculateFlavorTotalSum = () => {
    let totalBuyingSum = 0

    for (const tr of flavorModal.querySelectorAll('tr:not(:first-child)')) {
        for (const option of flavorProductsOptions) {
            if (+option.dataset.id === +tr.querySelector('input').dataset.id) {
                totalBuyingSum += +option.dataset.buyingCost * +tr.querySelector('.product-amount').value
                break
            }
        }
    }

    let totalSum = 0

    for (const td of flavorModal.querySelectorAll('tr:not(:first-child) td:nth-child(4)')) {
        totalSum += +td.querySelector('span').textContent
    }

    flavorTotalBuyingSumElement.textContent = totalBuyingSum.toFixed(2)
    flavorTotalSumElement.value = totalSum.toFixed(2)
}

const saveTemplate = () => {
    const allProductChoices = [...flavorModal.querySelectorAll('input[list=flavor-product]')].map(i => i.value)
    const allProductAmounts = [...flavorModal.querySelectorAll('.product-amount')].map(i => i.value)

    if (!allProductChoices.length) {
        showMessage('error', 'Ви не додали жодного товару')
        return
    }

    if (allProductChoices.some(p => !p) || allProductAmounts.some(p => !p)) {
        showMessage('error', 'Введіть усі дані для товарів')
        return
    }

    for (let i = 0; i < allProductChoices.length; i++) {
        for (let j = i + 1; j < allProductChoices.length; j++) {
            if (allProductChoices[i] === allProductChoices[j]) {
                showMessage('error', 'Ви не можете мати в шаблоні два однакових товара')
                return
            }
        }
    }

    const products = []

    for (const tr of flavorModal.querySelectorAll('tr:not(:first-child)')) {
        const flavorProduct = tr.querySelector('td:first-child input')
        const amount = +tr.querySelector('td:nth-child(2) input').value

        products.push({
            productId: +flavorProduct.dataset.id,
            amount
        })
    }

    const flavorTemplate = {
        companyId: loginInfo.companyId,
        products
    }

    post('FlavorTemplate', flavorTemplate).then(() => {
        showMessage('success', 'Шаблон збережено')
    }).catch(() => showMessage('error', createErrorMessage('шаблон')))
}

const createFlavorModal = () => {
    imageData = ''
    flavorModal.querySelector('h1').textContent = 'Створити букет'
    flavorModal.querySelector('img').src = EMPTY_IMAGE_URL
    flavorModal.querySelector('.flavor-name').value = ''
    flavorModal.querySelector('input[name=flavor-type]').checked = true
    flavorModal.querySelector('.view-flavor-templates').style.display = ''
    flavorModal.querySelector('.total-buying-sum span:last-child').textContent = '0.00'

    if (loginInfo.title > 1) {
        flavorModal.querySelector('.total-buying-sum').style.visibility = 'hidden'
    }

    flavorModal.querySelector('.total-sum input').value = '0.00'

    const flavorsProductsTable = flavorModal.querySelector('table')
    flavorsProductsTable.innerHTML = flavorsProductsTable.querySelector('tbody').innerHTML
    
    flavorModal.querySelector('.flavor-save-buttons button:last-child').onpointerup = () => createFlavor()
    hideBodyOverflow()
    flavorModal.style.display = 'flex'
}

const getFlavorName = flavor => flavor.name || ((flavor.isFlavor ? 'Букет' : 'Композиція') + ` #${flavor.id}`)

const createFlavorRow = flavor => {
    const editAction = createEditSpan('flavor')
    const deleteAction = createDeleteSpan('flavor')
    const actionsColumn = document.createElement('td')

    actionsColumn.classList = 'flavor-actions'
    actionsColumn.append(editAction, deleteAction)

    const tr = document.createElement('tr')
    tr.onpointerup = e => {
        if (e.target.tagName.toLowerCase() === 'span' && e.target.className) {
            return
        }

        showPageLoad()
        hideBodyOverflow()

        get(`Flavor/flavor/${flavor.id}`).then(response => {
            hidePageLoad()

            flavorInfoModal.querySelector('img').src = response.imageData ? response.imageData : EMPTY_IMAGE_URL
            flavorInfoModal.querySelector('h1').textContent = getFlavorName(flavor)
            flavorInfoModal.querySelector('.flavor-employee').textContent = response.employee
            flavorInfoModal.querySelector('.flavor-date').textContent = formatDate(response.date)
            flavorInfoModal.querySelector('.flavor-stock').textContent = flavor.stock
    
            const flavorProducts = flavorInfoModal.querySelector('table')
            flavorProducts.innerHTML = flavorProducts.querySelector('tbody').innerHTML
    
            for (const product of flavor.products) {
                const tr = document.createElement('tr')
                tr.append(
                    createTd(product.name),
                    createTd(product.amount),
                )
                flavorProducts.append(tr)
            }

            const totalBuyingSum = flavorInfoModal.querySelector('.flavor-total-buying-sum')

            if (loginInfo.title > 1) {
                totalBuyingSum.style.visibility = 'hidden'
            } else {
                totalBuyingSum.querySelector('span:last-child').textContent = flavor.totalBuyingSum.toFixed(2)
            }

            flavorInfoModal.querySelector('.flavor-total-sum span:last-child').textContent = flavor.totalSum.toFixed(2)
            flavorInfoModal.style.display = 'flex'
            flavorInfoModal.querySelector('.flavor-info-modal-content').scroll(0, 0)
        }).catch(() => {
            hidePageLoad()
            showMessage('error', getErrorMessage('букет'))
        })
    }

    editAction.onpointerup = () => {
        imageData = flavor.imageData
        flavorModal.querySelector('h1').textContent = 'Редагувати букет'
        flavorModal.querySelector('img').src = flavor.imageData ? flavor.imageData : EMPTY_IMAGE_URL
        flavorModal.querySelector('.flavor-name').value = flavor.name
        flavorModal.querySelector('.flavor-stock').value = flavor.stock
        flavorModal.querySelectorAll('input[name=flavor-type]').item(!flavor.isFlavor).checked = true

        const flavorsProductsTable = flavorModal.querySelector('table')
        flavorsProductsTable.innerHTML = flavorsProductsTable.querySelector('tbody').innerHTML

        flavor.products.forEach(p => addFlavorProduct(p))
        calculateFlavorTotalSum()

        if (loginInfo.title > 1) {
            flavorModal.querySelector('.total-buying-sum').style.visibility = 'hidden'
        }
        
        flavorModal.querySelector('.view-flavor-templates').style.display = 'none'
        flavorTemplatesModal.style.display = ''

        flavorModal.querySelector('.flavor-save-buttons button:last-child').onpointerup = () => editFlavor(flavor.id, tr, flavor.date)
        hideBodyOverflow()
        flavorModal.style.display = 'flex'
    }

    deleteAction.onpointerup = () => {
        const flavorType = flavor.isFlavor ? 'букет' : 'композицію'

        showConfirm(`Видалити ${flavorType} ${flavor.name || '#' + flavor.id}?`, () => {
            delete flavor.stock
            delete flavor.products

            remove('Flavor', flavor).then(() => {
                setTimeout(() => hideModal(confirmModal), 1)
                showMessage('info', deleteSuccessMessage(capitalize(flavorType)))
                hideModal(flavorModal)
                flavorsTable.removeChild(tr)

                if (flavorsTable.children.length === 1) {
                    flavorsTable.style.display = ''
                }
            }).catch(() => showMessage('error', deleteErrorMessage('букет')))
        })
    }

    const productsList = document.createElement('ul')

    for (const product of flavor.products) {
        const name = document.createElement('span')
        name.textContent = product.name

        const amount = document.createElement('span')
        amount.textContent = 'x' + product.amount

        const li = document.createElement('li')
        li.append(name, amount)
        productsList.append(li)
    }

    const flavorProductsColumn = createTd()
    flavorProductsColumn.append(productsList)

    tr.append(
        createTd(getFlavorName(flavor)),
        flavorProductsColumn,
        createTd(flavor.totalSum.toFixed(2)),
        createTd(flavor.stock),
        actionsColumn
    )
    return tr
}

const fillFlavorsTable = flavor => flavorsTable.append(createFlavorRow(flavor))

const flavorTypeToIndex = {
    'Букет': 0,
    'Композиція': 1
}

const createFlavor = () => {
    const stockElement = flavorModal.querySelector('.flavor-stock')
    const stock = stockElement.value

    if (!stock) {
        showMessage('error', 'Оберіть склад')
        return
    }

    const allProductChoices = [...flavorModal.querySelectorAll('input[list=flavor-product]')].map(i => i.value)
    const allProductAmounts = [...flavorModal.querySelectorAll('.product-amount')].map(i => i.value)

    if (!allProductChoices.length) {
        showMessage('error', 'Ви не додали жодного товару')
        return
    }

    if (allProductChoices.some(p => !p) || allProductAmounts.some(p => !p)) {
        showMessage('error', 'Введіть усі дані для товарів')
        return
    }

    for (let i = 0; i < allProductChoices.length; i++) {
        for (let j = i + 1; j < allProductChoices.length; j++) {
            if (allProductChoices[i] === allProductChoices[j]) {
                showMessage('error', 'Ви не можете мати в букеті два однакових товара')
                return
            }
        }
    }

    const payButton = flavorModal.querySelector('.flavor-save-buttons button:last-child')
    payButton.disabled = true

    const products = []

    for (const tr of flavorModal.querySelectorAll('tr:not(:first-child)')) {
        const flavorProduct = tr.querySelector('td:first-child input')
        const amount = +tr.querySelector('td:nth-child(2) input').value
        const price = +tr.querySelector('td:nth-child(3)').textContent
        const sum = +tr.querySelector('td:nth-child(4) span').textContent

        products.push({
            productId: +flavorProduct.dataset.id,
            amount,
            price,
            sum
        })
    }

    const flavor = {
        name: flavorModal.querySelector('.flavor-name').value.trim(),
        imageData,
        stockId: +stockElement.selectedOptions[0].dataset.id,
        isFlavor: flavorTypeToIndex[flavorModal.querySelector('input[name=flavor-type]:checked').value] === 0,
        date: new Date(),
        employeeId: loginInfo.employeeId,
        products,
        totalBuyingSum: +flavorTotalBuyingSumElement.textContent,
        totalSum: +flavorTotalSumElement.value
    }

    post('Flavor', flavor).then(response => {
        hideModalEnableButton(flavorModal, payButton)
        showMessage('success', createSuccessMessage('букет'))

        fillFlavorsTable({
            name: flavor.name,
            imageData,
            id: response.id,
            isFlavor: flavor.isFlavor,
            date: flavor.date,
            totalBuyingSum: flavor.totalBuyingSum,
            totalSum: flavor.totalSum,
            stock: stockElement.selectedOptions[0].text,
            products: response.products
        })

        flavorsTable.style.display = 'block'
    }).catch(() => {
        hideModalEnableButton(flavorModal, payButton)
        showMessage('error', createErrorMessage('букет'))
    })
}

const editFlavor = (id, oldRow, date) => {
    const stockElement = flavorModal.querySelector('.flavor-stock')

    const allProductChoices = [...flavorModal.querySelectorAll('input[list=flavor-product]')].map(i => i.value)
    const allProductAmounts = [...flavorModal.querySelectorAll('.product-amount')].map(i => i.value)

    if (!allProductChoices.length) {
        showMessage('error', 'Ви не додали жодного товару')
        return
    }

    if (allProductChoices.some(p => !p) || allProductAmounts.some(p => !p)) {
        showMessage('error', 'Введіть усі дані для товарів')
        return
    }

    for (let i = 0; i < allProductChoices.length; i++) {
        for (let j = i + 1; j < allProductChoices.length; j++) {
            if (allProductChoices[i] === allProductChoices[j]) {
                showMessage('error', 'Ви не можете мати в букеті два однакових товара')
                return
            }
        }
    }

    const payButton = flavorModal.querySelector('.flavor-save-buttons button:last-child')
    payButton.disabled = true

    const products = []

    for (const tr of flavorModal.querySelectorAll('tr:not(:first-child)')) {
        const flavorProduct = tr.querySelector('td:first-child input')
        const amount = +tr.querySelector('td:nth-child(2) input').value
        const price = +tr.querySelector('td:nth-child(3)').textContent
        const sum = +tr.querySelector('td:nth-child(4) span').textContent

        products.push({
            productId: +flavorProduct.dataset.id,
            amount,
            price,
            sum
        })
    }

    const flavor = {
        id,
        name: flavorModal.querySelector('.flavor-name').value.trim(),
        imageData,
        stockId: +stockElement.selectedOptions[0].dataset.id,
        isFlavor: flavorTypeToIndex[flavorModal.querySelector('input[name=flavor-type]:checked').value] === 0,
        date,
        employeeId: loginInfo.employeeId,
        products,
        totalBuyingSum: +flavorTotalBuyingSumElement.textContent,
        totalSum: +flavorTotalSumElement.value
    }

    put('Flavor', flavor).then(response => {
        hideModalEnableButton(flavorModal, payButton)
        showMessage('info', updateSuccessMessage('букет'))

        const newRow = createFlavorRow({
            name: flavor.name,
            imageData,
            id,
            isFlavor: flavor.isFlavor,
            date: flavor.date,
            totalBuyingSum: flavor.totalBuyingSum,
            totalSum: flavor.totalSum,
            stock: stockElement.selectedOptions[0].text,
            products: response
        })

        flavorsTable.replaceChild(newRow, oldRow)
    }).catch(() => {
        hideModalEnableButton(flavorModal, payButton)
        showMessage('error', updateErrorMessage('букет'))
    })
}

const addFlavorProduct = (product = null) => {
    flavorModal.querySelector('.view-flavor-templates').style.display = 'none'
    const flavorProductsTable = flavorModal.querySelector('.flavor-products table')

    const flavorProductSelect = document.createElement('input')
    const selector = 'flavor-product'
    flavorProductSelect.setAttribute('list', selector)

    const productPriceColumn = createTd()

    if (product) {
        for (const option of flavorProductsOptions) {
            if (+option.dataset.id === product.productId) {
                flavorProductSelect.dataset.id = product.productId
                flavorProductSelect.value = option.value
                productPriceColumn.textContent = product.sellingCost.toFixed(2)
                break
            }
        }
    }

    const flavorProductColumn = document.createElement('td')
    flavorProductColumn.append(flavorProductSelect)

    const changeSum = () => {
        const sum = +productAmount.value * +productPriceColumn.textContent
        productSum.textContent = sum.toFixed(2)
        calculateFlavorTotalSum()
    }

    const productAmount = document.createElement('input')
    productAmount.classList = 'product-amount'

    productAmount.oninput = e => {
        handlePriceInput(e)
        changeSum()
    }

    productAmount.value = product ? product.amount : ''
    productAmount.type = 'number'
    productAmount.min = '0'
    productAmount.max = '1000'
    const productAmountColumn = document.createElement('td')
    productAmountColumn.append(productAmount)

    const productSum = document.createElement('span')
    productSum.textContent = '0.00'

    if (product) {
        changeSum()
    }

    const productSumColumn = document.createElement('td')
    productSumColumn.append(productSum)

    const removeFlavorProduct = document.createElement('span')
    removeFlavorProduct.classList = 'material-symbols-outlined'

    removeFlavorProduct.onpointerup = e => {
        const input = e.target.parentNode.parentNode.querySelector('input')

        for (const option of flavorProductsOptions) {
            if (+option.dataset.id === +input.dataset.id) {
                const buyingCost = +option.dataset.buyingCost * + e.target.parentNode.parentNode.querySelector('.product-amount').value
                flavorTotalBuyingSumElement.textContent = Math.max(0, +flavorTotalBuyingSumElement.textContent - buyingCost).toFixed(2)
                break
            }
        }
        
        flavorTotalSumElement.value = (+flavorTotalSumElement.value - +productSum.textContent).toFixed(2)
        e.target.parentNode.parentNode.remove()

        const table = flavorModal.querySelector('table')

        if (table.children.length === 1) {
            flavorModal.querySelector('.view-flavor-templates').style.display = ''
            table.querySelector('tbody').style.display = ''
        }
    }

    removeFlavorProduct.textContent = 'remove_circle_outline'
    const removeFlavorProductColumn = document.createElement('td')
    removeFlavorProductColumn.classList = 'remove-flavor-product'
    removeFlavorProductColumn.append(removeFlavorProduct)

    const tr = document.createElement('tr')

    tr.append(
        flavorProductColumn,
        productAmountColumn,
        productPriceColumn,
        productSumColumn,
        removeFlavorProductColumn
    )

    flavorProductsTable.append(tr)
    flavorModal.querySelector('table tbody').style.display = 'contents'
    keepDatalistOptions(selector)

    flavorProductSelect.addEventListener('change', () => {
        for (const option of flavorProductsOptions) {
            if (+option.dataset.id === +flavorProductSelect.dataset.id) {
                productPriceColumn.textContent = (+option.dataset.cost).toFixed(2)
                changeSum()
                break
            }
        }
    })
}

const viewFlavorTemplates = () => {
    showPageLoad()

    get(`FlavorTemplate/${loginInfo.companyId}`).then(response => {
        hidePageLoad()

        if (response.length === 0) {
            showMessage('info', 'Шаблони відсутні')
            return
        }

        const templatesList = flavorTemplatesModal.querySelector('ul')
        templatesList.innerHTML = ''

        for (const template of response) {
            const chooseIcon = createSpan('task_alt')
            chooseIcon.classList = 'material-symbols-outlined'

            chooseIcon.onpointerup = () => {
                template.products.forEach(p => addFlavorProduct(p))
                calculateFlavorTotalSum()
                flavorModal.querySelector('.view-flavor-templates').style.display = 'none'
                flavorTemplatesModal.style.display = ''
            }

            const deleteIcon = createSpan('delete_forever')
            deleteIcon.classList = 'material-symbols-outlined'

            deleteIcon.onpointerup = () => {
                remove('FlavorTemplate', { id: template.id }).then(() => {
                    templatesList.removeChild(deleteIcon.parentNode)

                    if (!templatesList.children.length) {
                        flavorTemplatesModal.style.display = ''
                    }
                }).catch(() => showMessage('error', deleteErrorMessage('шаблон')))
            }

            const templateContent = document.createElement('span')
            templateContent.classList = 'template-content'

            for (const product of template.products) {
                const name = createSpan(product.name)
                const amount = createSpan('x' + product.amount)

                const content = document.createElement('span')
                content.classList = 'content'
                content.append(name, amount)
                templateContent.append(content)
            }

            const li = document.createElement('li')
            li.append(chooseIcon, templateContent, deleteIcon)
            templatesList.append(li)
        }

        flavorTemplatesModal.style.display = 'flex'
    }).catch(() => showMessage('error', getErrorMessage('шаблони')))
}
