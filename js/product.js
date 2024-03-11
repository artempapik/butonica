let productsTable, productsInput, productsFiltersBlock, products, stocksNames, productPricesHistoryLineChart

const showProductInfo = e => {
    main.innerHTML = menuItemsContents['product']
    fillSelectedMenuItem(e)

    productsTable = document.querySelector('.product-table table')
    productsInput = document.querySelector('.search-product')
    productsFiltersBlock = document.querySelector('.product-filters')

    productFilters = {
        searchQuery: '',
        categories: [],
        sort: ''
    }

    if (loginInfo.title > 1) {
        document.querySelector('button').remove()
    }

    get(`Stock/ids-names/${loginInfo.companyId}`)
        .then(response => stocksNames = response)
        .catch(() => showMessage('error', getErrorMessage('склади')))

    get(`Product/${loginInfo.companyId}`).then(response => {
        products = response

        if (products.length) {
            productsTable.style.display = 'block'
            productsInput.style.display = 'block'
            productsFiltersBlock.style.display = 'flex'
        }

        products.forEach(p => fillProductsTable(p))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('товари')))

    get(`Category/${loginInfo.companyId}`).then(response => {
        const productCategories = productModal.querySelector('.product-category')
        productCategories.innerHTML = ''

        for (const category of response) {
            const option = document.createElement('option')
            option.text = category.name
            option.dataset.id = category.id
            productCategories.add(option)
    
            const buttonName = document.createElement('span')
            buttonName.textContent = category.name
            const button = document.createElement('button')
    
            button.onpointerup = () => {
                animateChange(productsTable)
                const checkedButtonColor = 'rgb(230, 230, 230)'
    
                if (button.style.color === checkedButtonColor) {
                    button.style.background = 'rgb(242, 242, 242)'
                    button.style.color = 'rgb(50, 50, 50)'
                } else {
                    button.style.background = 'rgba(79, 118, 181, .8)'
                    button.style.color = checkedButtonColor
                }
    
                const filterButtons = productsFiltersBlock.querySelectorAll('button:not(:first-of-type)')
                const filters = []
    
                for (const button of filterButtons) {
                    if (button.style.color === checkedButtonColor) {
                        filters.push(button.textContent)
                    }
                }
    
                const allCategoriesButton = productsFiltersBlock.querySelector('button')
    
                if (filters.length) {
                    allCategoriesButton.style.background = 'rgb(242, 242, 242)'
                    allCategoriesButton.style.color = 'rgb(50, 50, 50)'
                    productFilters.categories = filters
                    filterProducts()
                    return
                }

                allCategoriesButton.style.background = 'rgba(79, 118, 181, .8)'
                allCategoriesButton.style.color = checkedButtonColor
                productFilters.categories = []
                filterProducts()
            }
    
            button.append(buttonName)
            productsFiltersBlock.append(button)
        }
    
        productCategories.value = ''
    })

    productPricesHistoryLineChart = new Chart(document.querySelector(`#product-prices-history-line-chart`), {
        type: 'line',
        data: {
            datasets: getChartDatasets(1, true)
        },
        options: {
            scales: {
                x: {
                    display: false
                }
            },
            plugins: {
                tooltip: {
                    enabled: true
                },
                legend: {
                    display: false
                },
                datalabels: {
                    display: false
                }
            }
        }
    })
}

const showAllProducts = () => {
    animateChange(productsTable)
    const filterButtons = productsFiltersBlock.querySelectorAll('button:not(:first-of-type)')

    for (const button of filterButtons) {
        button.style.background = 'rgb(242, 242, 242)'
        button.style.color = 'rgb(50, 50, 50)'
    }

    const allCategoriesButton = productsFiltersBlock.querySelector('button')
    allCategoriesButton.style.background = 'rgba(79, 118, 181, .8)'
    allCategoriesButton.style.color = 'rgb(230, 230, 230)'

    productFilters.categories = []
    filterProducts()
}

const productModal = document.querySelector('.create-product-modal')
const productInfoModal = document.querySelector('.product-info-modal')

const createProductModal = () => {
    imageData = ''
    productModal.querySelector('h1').textContent = 'Створити товар'
    productModal.querySelector('img').src = EMPTY_IMAGE_URL
    productModal.querySelectorAll('input:not(input[type=radio])').forEach(i => i.value = '')
    productModal.querySelector('select').value = ''
    productModal.querySelector('input[name=product-type]').checked = true
    productModal.querySelector('input[name=product-unit]').checked = true
    productModal.querySelector('button').onpointerup = () => createProduct()

    const stockPricesBlock = productModal.querySelector('.stock-prices')
    const stockPricesBlockHeader = stockPricesBlock.querySelector('h2')
    stockPricesBlock.innerHTML = ''
    stockPricesBlock.append(stockPricesBlockHeader)

    for (const stock of stocksNames) {
        const stockHeader = document.createElement('h4')
        stockHeader.textContent = stock.name

        const stockPriceInput = document.createElement('span')
        stockPriceInput.classList = 'enter-value'
        stockPriceInput.dataset.id = stock.id

        stockPriceInput.onpointerup = e => {
            calculatorNumbers.forEach(n => n.classList.remove('active'))
            enterInput = stockPriceInput

            calculatorModal.style.display = 'flex'
            const calculatorRect = calculator.getBoundingClientRect()
            calculator.style.top = (e.clientY - calculatorRect.height * 1.6) + 'px'
            calculator.style.left = (e.clientX - calculatorRect.width * .7) + 'px'

            if (e.clientX + calculatorRect.width > window.innerWidth) {
                calculator.style.left = (window.innerWidth - calculatorRect.width * 1.5) + 'px'
            }
        }

        const stockPriceBlock = document.createElement('div')
        stockPriceBlock.append(stockHeader, stockPriceInput)
        stockPricesBlock.append(stockPriceBlock)
    }

    hideBodyOverflow()
    productModal.style.display = 'flex'
}

const createProductRow = product => {
    const editAction = createEditSpan('product')
    const deleteAction = createDeleteSpan('product')
    const actionsColumn = document.createElement('td')

    if (loginInfo.title < 2) {
        actionsColumn.classList = 'product-actions'
        actionsColumn.append(editAction, deleteAction)
    }

    const tr = document.createElement('tr')
    tr.onpointerup = e => {
        if (e.target.tagName.toLowerCase() === 'span') {
            return
        }

        showPageLoad()
        hideBodyOverflow()

        productInfoModal.querySelector('.product-name').textContent = product.name
        productInfoModal.querySelector('.product-category').textContent = product.category
        productInfoModal.querySelector('.product-type').textContent = productIndexToType[product.type]
        productInfoModal.querySelector('.product-unit').textContent = productIndexToUnit[product.unit]

        const stockPricesTable = productInfoModal.querySelector('table')
        stockPricesTable.innerHTML = stockPricesTable.querySelector('tbody').innerHTML

        get(`Product/product/${product.id}`).then(response => {
            hidePageLoad()

            productInfoModal.querySelector('img').src = response.imageData ? response.imageData : EMPTY_IMAGE_URL

            for (const stockPrice of response.productStockPrices) {
                const tr = document.createElement('tr')
                tr.append(
                    createTd(stockPrice.stockName),
                    createTd(stockPrice.buyingCost ? stockPrice.buyingCost.toFixed(2) + ' грн' : ''),
                    sellingCostColumn = createTd(stockPrice.sellingCost.toFixed(2) + ' грн')
                )
                stockPricesTable.append(tr)
            }

            const productPricesHistory = productInfoModal.querySelector('.product-prices-history')

            if (response.pricesHistory.length < 2) {
                productPricesHistory.style.display = 'none'
            } else {
                productPricesHistory.style.display = ''

                productPricesHistoryLineChart.options.plugins.tooltip.callbacks.title = context => {
                    if (context[0].dataIndex === 0) {
                        return ''
                    }
    
                    const difference = response.pricesHistory[context[0].dataIndex] - response.pricesHistory[context[0].dataIndex - 1]
    
                    if (difference === 0) {
                        return ''
                    }
    
                    return difference > 0 ? '+' + difference.toFixed(2) : '-' + Math.abs(difference).toFixed(2)
                }
    
                productPricesHistoryLineChart.data.labels = response.pricesHistory
                productPricesHistoryLineChart.data.datasets[0].data = response.pricesHistory
                productPricesHistoryLineChart.update()
            }

            productInfoModal.style.display = 'flex'
            productInfoModal.querySelector('div').scroll(0, 0)
        }).catch(() => {
            hidePageLoad()
            showMessage('error', getErrorMessage('товар'))
        })
    }

    if (loginInfo.title < 2) {
        editAction.onpointerup = () => {
            imageData = product.imageData
            productModal.querySelector('h1').textContent = 'Редагувати товар'
            productModal.querySelector('img').src = product.imageData ? product.imageData : EMPTY_IMAGE_URL
            productModal.querySelectorAll('input').item(1).value = product.name
            productModal.querySelector('select').value = product.category
            productModal.querySelectorAll('input[name=product-type]').item(product.type).checked = true
            productModal.querySelectorAll('input[name=product-unit]').item(product.unit).checked = true
    
            get(`Product/stock-prices/${product.id}`).then(response => {
                const stockPricesBlock = productModal.querySelector('.stock-prices')
                const stockPricesBlockHeader = stockPricesBlock.querySelector('h2')
                stockPricesBlock.innerHTML = ''
                stockPricesBlock.append(stockPricesBlockHeader)
    
                for (const productStockPrice of response) {
                    const stockHeader = document.createElement('h4')
                    stockHeader.textContent = productStockPrice.stockName
            
                    const stockPriceInput = document.createElement('span')
                    stockPriceInput.classList = 'enter-value'
                    stockPriceInput.dataset.id = productStockPrice.id
                    stockPriceInput.dataset.stockId = productStockPrice.stockId
                    stockPriceInput.textContent = productStockPrice.sellingCost

                    stockPriceInput.onpointerup = e => {
                        calculatorNumbers.forEach(n => n.classList.remove('active'))
                        enterInput = stockPriceInput

                        calculatorModal.style.display = 'flex'
                        const calculatorRect = calculator.getBoundingClientRect()
                        calculator.style.top = (e.clientY - calculatorRect.height * 1.6) + 'px'
                        calculator.style.left = (e.clientX - calculatorRect.width * .7) + 'px'

                        if (e.clientX + calculatorRect.width > window.innerWidth) {
                            calculator.style.left = (window.innerWidth - calculatorRect.width * 1.5) + 'px'
                        }
                    }
    
                    const stockPriceBlock = document.createElement('div')
                    stockPriceBlock.append(stockHeader, stockPriceInput)
                    stockPricesBlock.append(stockPriceBlock)
                }
            }).catch(() => showMessage('error', getErrorMessage('ціни для товару')))
    
            productModal.querySelector('button').onpointerup = () => editProduct(product.id, tr)
            hideBodyOverflow()
            productModal.style.display = 'flex'
        }

        deleteAction.onpointerup = () => showConfirm(`Видалити товар\n${product.name}?`, () => {
            delete product.category

            remove('Product', product).then(() => {
                setTimeout(() => hideModal(confirmModal), 1)
                showMessage('info', deleteSuccessMessage('товар'))
                products.splice(products.findIndex(p => p.id === product.id), 1)
                productsTable.removeChild(tr)

                if (productsTable.children.length === 1) {
                    productsTable.style.display = ''
                    productsInput.style.display = ''
                    productsFiltersBlock.style.display = ''
                }
            }).catch(() => showMessage('error', deleteErrorMessage('товар')))
        })
    }

    tr.append(
        createTd(product.name),
        createTd(product.category),
        loginInfo.title < 2 ? actionsColumn : createTd()
    )
    return tr
}

const fillProductsTable = product => {
    if (!product) {
        productsTable.innerHTML = productsTable.querySelector('tbody').innerHTML
        productsTable.append(createEmptyDataDiv())
        return
    }

    productsTable.append(createProductRow(product))
}

const productTypeToIndex = {
    'Товар': 0,
    'Послуга': 1
}

const productIndexToType = {
    0: 'Товар',
    1: 'Послуга'
}

const productUnitToIndex = {
    'штуки': 0,
    'кілограми': 1,
    'метри': 2
}

const productIndexToUnit = {
    0: 'штуки',
    1: 'кілограми',
    2: 'метри'
}

const createProduct = () => {
    const nameElement = productModal.querySelector('.product-name')
    const name = nameElement.value

    if (!name) {
        showMessage('error', 'Введіть назву товару')
        return
    }

    const categoryElement = productModal.querySelector('.product-category')
    const category = categoryElement.value
    
    if (!category) {
        showMessage('error', 'Оберіть категорію для товару')
        return
    }

    const type = productTypeToIndex[productModal.querySelector('input[name=product-type]:checked').value]
    const unit = productUnitToIndex[productModal.querySelector('input[name=product-unit]:checked').value]

    const stockPricesBlock = productModal.querySelectorAll('.stock-prices div')

    if (productModal.querySelector('.stock-prices').children.length === 1) {
        showMessage('error', 'Ви не вказали ціну для жодного складу. Спочатку створіть склад')
        return
    }

    for (const stockPriceBlock of stockPricesBlock) {
        if (!stockPriceBlock.querySelector('span').textContent) {
            showMessage('error', 'Введіть ціну продажу для усіх складів')
            return
        }
    }

    const payButton = productModal.querySelector('button')
    payButton.disabled = true

    const stockPrices = []

    for (const stockPriceBlock of stockPricesBlock) {
        const input = stockPriceBlock.querySelector('span')
        const sellingCost = +input.textContent

        stockPrices.push({
            stockId: input.dataset.id,
            sellingCost
        })
    }

    const product = {
        imageData,
        name,
        categoryId: +categoryElement.selectedOptions[0].dataset.id,
        type,
        unit,
        stockPrices
    }

    post('Product', product).then(response => {
        hideModalEnableButton(productModal, payButton)
        showMessage('success', createSuccessMessage('товар'))
        product.id = response
        product.category = category
        products.push(product)
        fillProductsTable(product)
        productsTable.style.display = 'block'
        productsInput.style.display = 'block'
        productsFiltersBlock.style.display = 'flex'
    }).catch(e => {
        hideModalEnableButton(productModal, payButton)

        if (e.message === '403') {
            showMessage('error', 'Товар із такою назвою вже існує')
            return
        }

        showMessage('error', createErrorMessage('товар'))
    })
}

const editProduct = (id, oldRow) => {
    const nameElement = productModal.querySelector('.product-name')
    const name = nameElement.value

    if (!name) {
        showMessage('error', 'Введіть назву товару')
        return
    }

    const categoryElement = productModal.querySelector('.product-category')
    const type = productTypeToIndex[productModal.querySelector('input[name=product-type]:checked').value]
    const unit = productUnitToIndex[productModal.querySelector('input[name=product-unit]:checked').value]

    const stockPricesBlock = productModal.querySelectorAll('.stock-prices div')

    for (const stockPriceBlock of stockPricesBlock) {
        if (!stockPriceBlock.querySelector('span').textContent) {
            showMessage('error', 'Введіть ціну продажу для усіх складів')
            return
        }
    }

    const payButton = productModal.querySelector('button')
    payButton.disabled = true

    const stockPrices = []

    for (const stockPriceBlock of stockPricesBlock) {
        const input = stockPriceBlock.querySelector('span')
        const sellingCost = +input.textContent

        stockPrices.push({
            id: input.dataset.id,
            stockId: input.dataset.stockId,
            sellingCost
        })
    }

    const product = {
        id,
        imageData,
        name,
        categoryId: +categoryElement.selectedOptions[0].dataset.id,
        type,
        unit,
        stockPrices
    }

    put('Product', product).then(() => {
        hideModalEnableButton(productModal, payButton)
        showMessage('info', updateSuccessMessage('товар'))
        product.category = categoryElement.value
        const newRow = createProductRow(product)
        productsTable.replaceChild(newRow, oldRow)
    }).catch(e => {
        hideModalEnableButton(productModal, payButton)

        if (e.message === '403') {
            showMessage('error', 'Товар із такою назвою вже існує')
            return
        }
        
        showMessage('error', updateErrorMessage('товар'))
    })
}

let productFilters

const filterProducts = () => {
    animateChange(productsTable)
    let filteredProducts = [...products]

    if (productFilters.searchQuery) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(productFilters.searchQuery))
    }

    if (productFilters.categories.length) {
        filteredProducts = filteredProducts.filter(p => productFilters.categories.some(c => c === p.category))
    }

    if (productFilters.sort === 'asc') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
    } else if (productFilters.sort === 'desc') {
        filteredProducts.sort((b, a) => a.name.localeCompare(b.name))
    }

    if (!filteredProducts.length) {
        fillProductsTable(null)
        return
    }

    productsTable.innerHTML = productsTable.querySelector('tbody').innerHTML
    filteredProducts.forEach(p => fillProductsTable(p))
}

const searchProduct = () => {
    animateChange(productsTable)
    productFilters.searchQuery = productsInput.value.trim().toLowerCase()
    filterProducts()
}

const sortProducts = () => {
    const sortIcon = productsTable.querySelector('tbody tr td:first-child').querySelectorAll('span').item(1)

    if (sortIcon.innerHTML === 'unfold_more') {
        sortIcon.innerHTML = 'arrow_drop_up'
        productFilters.sort = 'asc'
    } else if (sortIcon.innerHTML === 'arrow_drop_up') {
        sortIcon.innerHTML = 'arrow_drop_down'
        productFilters.sort = 'desc'
    } else {
        sortIcon.innerHTML = 'unfold_more'
        productFilters.sort = ''
    }

    filterProducts()
}
