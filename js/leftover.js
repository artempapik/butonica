let leftoversTable, leftoversInput, leftoverProducts
let leftoverCategoryFilters, leftoverStockFilters, leftoverTotalSum

const showLeftoverInfo = e => {
    main.innerHTML = menuItemsContents['leftover']
    fillSelectedMenuItem(e)

    leftoversTable = document.querySelector('.leftover-table table')
    leftoversInput = document.querySelector('.search-leftover')
    leftoverCategoryFilters = document.querySelector('.leftover-category-filters')
    leftoverStockFilters = document.querySelector('.leftover-stock-filters')
    leftoverTotalSum = document.querySelector('.leftover-table div span:last-child')

    leftoverFilters = {
        searchQuery: '',
        categories: [],
        stocks: [],
        sortByName: '',
        sortByAmount: ''
    }

    get(`Supply/leftovers/${loginInfo.companyId}`).then(response => {
        leftoverProducts = response
        leftoversTable.style.display = 'block'

        if (leftoverProducts.length) {
            leftoversInput.style.display = 'block'
            leftoverCategoryFilters.style.display = 'flex'
            document.querySelector('.leftover-table div').style.display = 'flex'
        } else {
            leftoversTable.append(createEmptyDataDiv())
        }

        calculateTotalCost(leftoverProducts)
        fillLeftoversTable(leftoverProducts)
        setFixedTable(leftoversTable.querySelectorAll('tbody td:first-child, tbody td:nth-child(2)'))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('залишки')))

    get(`Category/names/${loginInfo.companyId}`).then(response => fillLeftoverFilters(leftoverCategoryFilters, response, 'name', 'categories'))

    get(`Stock/names/${loginInfo.companyId}`).then(response => {
        if (response.length < 2) {
            leftoverStockFilters.style.display = ''
            return
        }

        leftoverStockFilters.style.display = 'flex'
        fillLeftoverFilters(leftoverStockFilters, response, 'name', 'stocks')
    })
}

const fillLeftoverFilters = (filtersBlock, items, key, filterKey) => {
    for (const item of items) {
        const buttonName = document.createElement('span')
        buttonName.textContent = item[key]
        const button = document.createElement('button')

        button.onpointerup = () => {
            animateChange(leftoversTable)
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
                leftoverFilters[filterKey] = filters
                filterLeftovers()
                return
            }

            allCategoriesButton.style.background = 'rgba(79, 118, 181, .8)'
            allCategoriesButton.style.color = checkedButtonColor
            leftoverFilters[filterKey] = []
            filterLeftovers()
        }

        button.append(buttonName)
        filtersBlock.append(button)
    }
}

const showAllLeftovers = (filtersBlock, key) => {
    animateChange(leftoversTable)
    const filterButtons = filtersBlock.querySelectorAll('button:not(:first-of-type)')

    for (const button of filterButtons) {
        button.style.background = 'rgb(242, 242, 242)'
        button.style.color = 'rgb(50, 50, 50)'
    }

    const allCategoriesButton = filtersBlock.querySelector('button')
    allCategoriesButton.style.background = 'rgba(79, 118, 181, .8)'
    allCategoriesButton.style.color = 'rgb(230, 230, 230)'

    leftoverFilters[key] = []
    filterLeftovers()
}

const showAllLeftoverCategories = () => showAllLeftovers(leftoverCategoryFilters, 'categories')
const showAllLeftoverStocks = () => showAllLeftovers(leftoverStockFilters, 'stocks')

const leftoverInfoModal = document.querySelector('.leftover-info-modal')

const fillLeftoversTable = leftoverProducts => {
    leftoversTable.innerHTML = leftoversTable.querySelector('tbody').innerHTML

    if (!leftoverProducts.length) {
        leftoversTable.append(createEmptyDataDiv())
        return
    }

    for (const product of leftoverProducts) {
        const tr = document.createElement('tr')
        tr.onpointerup = e => {
            if (e.target.tagName.toLowerCase() === 'span') {
                return
            }

            leftoverInfoModal.querySelector('h1').textContent = product.name
            // showPageLoad()
            hideBodyOverflow()

            const flavorInfo = [
                {
                    name: 'Букет 60001',
                    amount: 5
                },
                {
                    name: 'Букет 60002',
                    amount: 2
                },
                {
                    name: 'Букет 60003',
                    amount: 10
                }
            ]

            const orderInfo = [
                {
                    number: '5734',
                    date: 'вт 15 чер',
                    amount: 7
                },
                {
                    number: '5735',
                    date: 'ср 16 чер',
                    amount: 5
                },
                {
                    number: '5736',
                    date: 'чт 17 чер',
                    amount: 10
                }
            ]

            const flavorInfoTable = leftoverInfoModal.querySelector('.flavor-info-table')
            flavorInfoTable.innerHTML = flavorInfoTable.querySelector('tbody').innerHTML

            const orderInfoTable = leftoverInfoModal.querySelector('.order-info-table')
            orderInfoTable.innerHTML = orderInfoTable.querySelector('tbody').innerHTML

            for (const flavor of flavorInfo) {
                const tr = document.createElement('tr')
                tr.append(
                    createTd(flavor.name),
                    createTd(flavor.amount)
                )
                flavorInfoTable.append(tr)
            }

            for (const order of orderInfo) {
                const tr = document.createElement('tr')
                tr.append(
                    createTd(order.number),
                    createTd(order.date),
                    createTd(order.amount)
                )
                orderInfoTable.append(tr)
            }

            leftoverInfoModal.style.display = 'flex'
            leftoverInfoModal.querySelector('div').scroll(0, 0)
            // catch
        }

        const productNameColumn = document.createElement('td')
        productNameColumn.textContent = product.name

        const leftoverProductStockColumn = document.createElement('td')
        leftoverProductStockColumn.textContent = product.stock

        const productAmountColumn = document.createElement('td')
        productAmountColumn.classList = getClassForNumber(product.amount)
        productAmountColumn.textContent = product.amount

        const productBuyingCostColumn = document.createElement('td')

        if (product.buyingCost) {
            const isUp = product.change === null || product.change === 0 ? null : product.change > 0
            const buyingIcon = createSpan(isUp === null ? 'remove' : isUp ? 'arrow_drop_up' : 'arrow_drop_down')
            buyingIcon.classList = 'material-symbols-outlined'
            buyingIcon.style.color = isUp === null ? 'rgb(150, 150, 150)' : isUp ? 'green' : 'red'
            productBuyingCostColumn.append(buyingIcon, createSpan(product.buyingCost.toFixed(2)))

            if (isUp !== null) {
                tippy(productBuyingCostColumn, {
                    content: `${isUp ? 'зросла' : 'впала'} на ${Math.abs(product.change)} грн`,
                    placement: 'right'
                })
            }
        } else {
            const noneSpan = createSpan('–')
            noneSpan.style.textAlign = 'center'
            productBuyingCostColumn.append(noneSpan)
        }

        const createTdWithText = field => {
            const td = createTd()
            const value = product['in' + field]

            if (value) {
                td.append(createSpan(`${value} шт`))
            } else {
                td.textContent = '–'
            }

            return td
        }
        
        tr.append(
            productNameColumn,
            leftoverProductStockColumn,
            productAmountColumn,
            productBuyingCostColumn,
            createTdWithText('Flavor'),
            createTdWithText('Order')
        )
        leftoversTable.append(tr)
    }
}

let leftoverFilters

const calculateTotalCost = products => {
    const totalBuyingCost = products.reduce((total, current) => total + (current.amount > 0 ? current.buyingCost * current.amount : 0), 0)
    leftoverTotalSum.classList = getClassForNumber(totalBuyingCost)
    leftoverTotalSum.textContent = totalBuyingCost.toFixed(2) + ' грн'
}

const filterLeftovers = (shouldRecalculateTotalCost = true) => {
    animateChange(leftoversTable)
    let filteredLeftovers = [...leftoverProducts]

    if (leftoverFilters.searchQuery) {
        filteredLeftovers = filteredLeftovers.filter(p => p.name.toLowerCase().includes(leftoverFilters.searchQuery))
    }

    if (leftoverFilters.categories.length) {
        filteredLeftovers = filteredLeftovers.filter(p => leftoverFilters.categories.some(c => c === p.category))
    }

    if (leftoverFilters.stocks.length) {
        filteredLeftovers = filteredLeftovers.filter(p => leftoverFilters.stocks.some(f => f === p.stock))
    }

    if (leftoverFilters.sortByName === 'asc') {
        filteredLeftovers.sort((a, b) => a.name.localeCompare(b.name))
    } else if (leftoverFilters.sortByName === 'desc') {
        filteredLeftovers.sort((b, a) => a.name.localeCompare(b.name))
    }

    if (leftoverFilters.sortByAmount === 'asc') {
        filteredLeftovers.sort((a, b) => a.amount - b.amount)
    } else if (leftoverFilters.sortByAmount === 'desc') {
        filteredLeftovers.sort((b, a) => a.amount - b.amount)
    }

    if (shouldRecalculateTotalCost) {
        calculateTotalCost(filteredLeftovers)
    }
    
    fillLeftoversTable(filteredLeftovers)
}

const changeSortIconAndUpdateFilters = (childNumber, key) => {
    const sortIcon = leftoversTable.querySelector(`tbody tr td:nth-child(${childNumber})`).querySelectorAll('span').item(1)

    if (sortIcon.innerHTML === 'unfold_more') {
        sortIcon.innerHTML = 'arrow_drop_up'
        leftoverFilters[key] = 'asc'
    } else if (sortIcon.innerHTML === 'arrow_drop_up') {
        sortIcon.innerHTML = 'arrow_drop_down'
        leftoverFilters[key] = 'desc'
    } else {
        sortIcon.innerHTML = 'unfold_more'
        leftoverFilters[key] = ''
    }

    filterLeftovers(false)
}

const sortLeftoverByName = () => changeSortIconAndUpdateFilters(1, 'sortByName')
const sortLeftoverByAmount = () => changeSortIconAndUpdateFilters(3, 'sortByAmount')

const searchLeftover = () => {
    animateChange(leftoversTable)
    leftoverFilters.searchQuery = leftoversInput.value.trim().toLowerCase()
    filterLeftovers()
}
