let contractorsTable, contractors

const showContractorInfo = e => {
    main.innerHTML = menuItemsContents['contractor']
    fillSelectedMenuItem(e)
    contractorsTable = document.querySelector('.contractor-table table')

    get(`Contractor/${loginInfo.companyId}`).then(response => {
        contractors = response
        contractorsTable.style.display = 'block'

        if (!contractors.length) {
            contractorsTable.append(createEmptyDataDiv())
        }

        contractors.forEach(fillContractorsTable)
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('постачальників')))
}

const contractorModal = document.querySelector('.create-contractor-modal')
const contractorInfoModal = document.querySelector('.contractor-info-modal')

const createContractorModal = () => {
    contractorModal.querySelector('h1').textContent = 'Створити постачальника'
    contractorModal.querySelectorAll('input').forEach(i => i.value = '')
    contractorModal.querySelector('textarea').value = ''
    contractorModal.querySelector('button').onpointerup = () => createContractor()
    hideBodyOverflow()
    contractorModal.style.display = 'flex'
}

const createContractorRow = contractor => {
    const editAction = createEditSpan('contractor')
    const deleteAction = createDeleteSpan('contractor')
    const actionsColumn = document.createElement('td')
    actionsColumn.classList = 'contractor-actions'
    actionsColumn.append(editAction, deleteAction)

    const tr = document.createElement('tr')
    tr.onpointerup = e => {
        const tagName = e.target.tagName.toLowerCase()
        if (tagName === 'a' || tagName === 'span') {
            return
        }

        showPageLoad()
        hideBodyOverflow()

        contractorInfoModal.querySelector('.contractor-name').textContent = contractor.name
        showHideNodeInfo(contractorInfoModal, 'contractor-email', contractor.email)
        contractorInfoModal.querySelector('.contractor-phone').href = 'tel:' + contractor.phone
        showHideNodeInfo(contractorInfoModal, 'contractor-phone', formatPhoneNumber(contractor.phone))
        showHideNodeInfo(contractorInfoModal, 'contractor-comment', contractor.comment)
        contractorInfoModal.querySelector('.contractor-product-sum').textContent = contractor.productSum.toFixed(2) + ' грн'
        contractorInfoModal.querySelector('.contractor-paid').textContent = contractor.paid.toFixed(2) + ' грн'

        const deltaElement = contractorInfoModal.querySelector('.contractor-delta')
        deltaElement.classList = 'contractor-delta'
        deltaElement.classList.add(contractor.delta < 0 ? 'contractor-debt' : 'contractor-overpayment')
        deltaElement.textContent = contractor.delta.toFixed(2) + ' грн'

        const contractorSupplies = contractorInfoModal.querySelector('.contractor-supplies')
        contractorSupplies.innerHTML = ''

        const supplyHeader = document.createElement('h1')
        let supplies, supplyIndex

        const supplyDate = document.createElement('input')
        supplyDate.type = 'date'
        supplyDate.onchange = () => {
            supplyIndex = 0
            const date = new Date(supplyDate.value)

            get(`Supply/${contractor.id}/${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`)
                .then(response => {
                    arrowsBlock.style.display = response.length < 2 ? '' : 'flex'
                    supplies = response
                    fillTableSelectedSupply(supplies[0])
                })
                .catch(() => showMessage('error', getErrorMessage('поставки постачальника')))
        }

        const arrowLeft = document.createElement('span')
        arrowLeft.classList = 'material-symbols-outlined'
        arrowLeft.textContent = 'chevron_left'
        arrowLeft.onpointerup = () => {
            if (supplyIndex !== 0) {
                supplyIndex--
                fillTableSelectedSupply(supplies[supplyIndex])
            }
        }

        const arrowRight = document.createElement('span')
        arrowRight.classList = 'material-symbols-outlined'
        arrowRight.textContent = 'chevron_right'
        arrowRight.onpointerup = () => {
            if (supplyIndex !== supplies.length - 1) {
                supplyIndex++
                fillTableSelectedSupply(supplies[supplyIndex])
            }
        }

        const arrowsBlock = document.createElement('div')
        arrowsBlock.classList = 'arrows-block'
        arrowsBlock.append(arrowLeft, arrowRight)

        const div = document.createElement('div')
        div.classList = 'contractor-supplies-header'

        const headerDiv = document.createElement('div')
        headerDiv.append(supplyHeader, supplyDate)
        div.append(headerDiv, arrowsBlock)
        contractorSupplies.append(div)

        const fillTableSelectedSupply = response => {
            contractorSupplies.innerHTML = ''
            contractorSupplies.append(div)

            if (response) {
                supplyHeader.textContent = 'Поставки за:'

                const supply = response.supply
                const products = response.products
                const associatedCosts = response.associatedCosts

                const suppliesInfo = document.createElement('div')
                suppliesInfo.classList = 'contractor-supplies-info'

                const supplyDateHeader = document.createElement('h2')
                supplyDateHeader.textContent = 'Дата'

                const supplyDateSubHeader = document.createElement('h3')
                supplyDateSubHeader.textContent = formatWeekDate(supply.date, true)

                const supplyDateDiv = document.createElement('div')
                supplyDateDiv.classList = 'form'
                supplyDateDiv.append(supplyDateHeader, supplyDateSubHeader)
                suppliesInfo.append(supplyDateDiv)

                const supplyStockHeader = document.createElement('h2')
                supplyStockHeader.textContent = 'Склад'

                const supplyStockSubHeader = document.createElement('h3')
                supplyStockSubHeader.textContent = supply.stock

                const supplyStockDiv = document.createElement('div')
                supplyStockDiv.classList = 'form'
                supplyStockDiv.append(supplyStockHeader, supplyStockSubHeader)
                suppliesInfo.append(supplyStockDiv)

                const supplyPaidSumHeader = document.createElement('h2')
                supplyPaidSumHeader.textContent = 'Сума оплати'

                if (supply.paidSum) {
                    const supplyPaidSumSubHeader = document.createElement('h3')
                    supplyPaidSumSubHeader.textContent = supply.paidSum.toFixed(2) + ' грн'
    
                    const supplyPaidSumDiv = document.createElement('div')
                    supplyPaidSumDiv.classList = 'form'
                    supplyPaidSumDiv.append(supplyPaidSumHeader, supplyPaidSumSubHeader)
                    suppliesInfo.append(supplyPaidSumDiv)
                }

                const supplyPayDateHeader = document.createElement('h2')
                supplyPayDateHeader.textContent = 'Дата оплати'

                const supplyPayDateSubHeader = document.createElement('h3')
                supplyPayDateSubHeader.textContent = formatWeekDate(supply.payDate, true)

                const supplyPayDateDiv = document.createElement('div')
                supplyPayDateDiv.classList = 'form'
                supplyPayDateDiv.append(supplyPayDateHeader, supplyPayDateSubHeader)
                supplyPayDateDiv.style.display = supplyPayDateSubHeader.textContent ? '' : 'none'
                suppliesInfo.append(supplyPayDateDiv)

                const supplyCommentHeader = document.createElement('h2')
                supplyCommentHeader.textContent = 'Коментар'

                const supplyCommentSubHeader = document.createElement('h3')
                supplyCommentSubHeader.textContent = supply.comment

                const supplyCommentDiv = document.createElement('div')
                supplyCommentDiv.classList = 'form'
                supplyCommentDiv.append(supplyCommentHeader, supplyCommentSubHeader)
                supplyCommentDiv.style.display = supply.comment ? '' : 'none'
                suppliesInfo.append(supplyCommentDiv)
                
                const suppliesProducts = document.createElement('div')
                suppliesProducts.classList = 'contractor-supplies-products'

                const suppliesHeader = document.createElement('h2')
                suppliesHeader.textContent = 'Товари'

                const suppliesTable = document.createElement('table')
                const tr = document.createElement('tr')
                tr.append(
                    createTd('Товар'),
                    createTd('К-ть'),
                    createTd('Ціна'),
                    createTd('Сума')
                )

                const tbody = document.createElement('tbody')
                tbody.append(tr)
                suppliesTable.append(tbody)

                for (const product of products) {
                    const tr = document.createElement('tr')
                    tr.append(
                        createTd(product.name),
                        createTd(product.amount),
                        createTd(product.price.toFixed(2)),
                        createTd(product.sum.toFixed(2))
                    )
                    suppliesTable.append(tr)
                }

                const associatedSuppliesHeader = document.createElement('h2')
                const associatedCostsTable = document.createElement('table')

                const suppliesDiv = document.createElement('div')
                suppliesDiv.classList = 'form contractor-supply-products'

                if (associatedCosts.length) {
                    associatedSuppliesHeader.textContent = 'Супутні витрати'

                    const associatedTr = document.createElement('tr')
                    associatedTr.append(createTd('Назва'), createTd('Ціна'),)

                    const associatedTbody = document.createElement('tbody')
                    associatedTbody.append(associatedTr)
                    associatedCostsTable.append(associatedTbody)

                    for (const associatedCost of associatedCosts) {
                        const tr = document.createElement('tr')
                        tr.append(
                            createTd(associatedCost.name),
                            createTd(associatedCost.cost.toFixed(2) + ' грн'),
                        )
                        associatedCostsTable.append(tr)
                    }

                    suppliesDiv.append(suppliesHeader, suppliesTable, associatedSuppliesHeader, associatedCostsTable)
                } else {
                    suppliesDiv.append(suppliesHeader, suppliesTable)
                }

                suppliesProducts.append(suppliesDiv)

                const allSupplies = document.createElement('div')
                allSupplies.classList = 'all-supplies'
                allSupplies.append(suppliesInfo, suppliesProducts)
                contractorSupplies.append(allSupplies)

                const togetherWord = document.createElement('span')
                togetherWord.textContent = 'Разом: '

                const totalSum = document.createElement('span')
                totalSum.textContent = supply.totalSum.toFixed(2) + ' грн'

                const totalSumDiv = document.createElement('h2')
                totalSumDiv.classList = 'total-sum'

                totalSumDiv.append(togetherWord, totalSum)

                const associatedTotalSumDiv = document.createElement('h2')
                associatedTotalSumDiv.classList = 'total-sum'

                if (associatedCosts.length) {
                    const associatedTogetherWord = document.createElement('span')
                    associatedTogetherWord.textContent = 'Із супутніми витратами: '

                    const associatedTotalSum = document.createElement('span')
                    associatedTotalSum.textContent = supply.totalSumAssociatedCosts.toFixed(2) + ' грн'

                    associatedTotalSumDiv.append(associatedTogetherWord, associatedTotalSum)
                }

                contractorSupplies.append(totalSumDiv)

                if (associatedCosts.length) {
                    contractorSupplies.append(associatedTotalSumDiv)
                }
            } else {
                supplyHeader.textContent = 'Поставки відсутні'
            }
        }

        get(`Supply/contractor/${contractor.id}`).then(response => {
            hidePageLoad()
            fillTableSelectedSupply(response)
            contractorInfoModal.style.display = 'flex'
            contractorInfoModal.querySelector('.contractor-info-modal-content').scroll(0, 0)
        }).catch(() => {
            hidePageLoad()
            showMessage('error', getErrorMessage('поставки постачальника'))
        })
    }

    editAction.onpointerup = () => {
        contractorModal.querySelector('h1').textContent = 'Редагувати постачальника'
        const inputs = contractorModal.querySelectorAll('input')
        inputs.item(0).value = contractor.name
        inputs.item(1).value = contractor.email
        inputs.item(2).value = contractor.phone
        contractorModal.querySelector('textarea').value = contractor.comment
        contractorModal.querySelector('button').onpointerup = () => editContractor(contractor, tr)
        hideBodyOverflow()
        contractorModal.style.display = 'flex'
    }

    deleteAction.onpointerup = () => showConfirm(`Видалити постачальника\n${contractor.name}?`, () =>
        remove('Contractor', contractor).then(() => {
            setTimeout(() => hideModal(confirmModal), 1)
            showMessage('info', deleteSuccessMessage('постачальника'))
            contractors.splice(contractors.findIndex(c => c.id === contractor.id), 1)
            contractorsTable.removeChild(tr)

            if (contractorsTable.children.length === 1) {
                contractorsTable.append(createEmptyDataDiv())
            }
        }).catch(() => showMessage('error', deleteErrorMessage('постачальника'))))

    const phoneLink = document.createElement('a')
    phoneLink.href = 'tel:' + contractor.phone
    phoneLink.textContent = formatPhoneNumber(contractor.phone)

    tr.append(
        createTd(contractor.name),
        createTd(contractor.email),
        createTd(phoneLink),
        actionsColumn
    )
    return tr
}

const fillContractorsTable = contractor => contractorsTable.append(createContractorRow(contractor))

const createContractor = () => {
    const nameElement = contractorModal.querySelector('.contractor-name')
    const name = nameElement.value.trim()

    if (!name) {
        showMessage('error', "Введіть ім'я постачальника")
        return
    }

    const payButton = contractorModal.querySelector('button')
    payButton.disabled = true

    const contractor = {
        companyId: loginInfo.companyId,
        name,
        email: contractorModal.querySelector('.contractor-email').value.trim(),
        phone: contractorModal.querySelector('.contractor-phone').value.trim(),
        comment: contractorModal.querySelector('.contractor-comment').value.trim(),
        paid: 0,
        productSum: 0,
        delta: 0
    }

    post('Contractor', contractor).then(response => {
        hideModalEnableButton(contractorModal, payButton)
        showMessage('success', createSuccessMessage('постачальника'))
        contractor.id = response
        contractors.push(contractor)
        checkEmptyTable(contractorsTable)
        fillContractorsTable(contractor)
    }).catch(() => {
        hideModalEnableButton(contractorModal, payButton)
        showMessage('error', createErrorMessage('постачальника'))
    })
}

const editContractor = (oldContractor, oldRow) => {
    const nameElement = contractorModal.querySelector('.contractor-name')
    const name = nameElement.value

    if (!name) {
        showMessage('error', "Введіть ім'я постачальника")
        return
    }

    const payButton = contractorModal.querySelector('button')
    payButton.disabled = true

    const contractor = {
        id: oldContractor.id,
        companyId: loginInfo.companyId,
        name,
        email: contractorModal.querySelector('.contractor-email').value.trim(),
        phone: contractorModal.querySelector('.contractor-phone').value.trim(),
        comment: contractorModal.querySelector('.contractor-comment').value.trim(),
        paid: oldContractor.paid,
        productSum: oldContractor.productSum,
        delta: oldContractor.delta
    }

    put('Contractor', contractor).then(() => {
        hideModalEnableButton(contractorModal, payButton)
        showMessage('info', updateSuccessMessage('постачальника'))
        const newRow = createContractorRow(contractor)
        contractorsTable.replaceChild(newRow, oldRow)
    }).catch(() => {
        hideModalEnableButton(contractorModal, payButton)
        showMessage('error', updateErrorMessage('постачальника'))
    })
}

const sortContractors = () => {
    animateChange(contractorsTable)
    contractorsTable.innerHTML = contractorsTable.querySelector('tbody').innerHTML

    const sortIcon = contractorsTable.querySelector('tbody tr td:first-child').querySelectorAll('span').item(1)
    const sortedContractors = [...contractors]

    if (sortIcon.innerHTML === 'unfold_more') {
        sortIcon.innerHTML = 'arrow_drop_up'
        sortedContractors.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortIcon.innerHTML === 'arrow_drop_up') {
        sortIcon.innerHTML = 'arrow_drop_down'
        sortedContractors.sort((b, a) => a.name.localeCompare(b.name))
    } else {
        sortIcon.innerHTML = 'unfold_more'
    }

    sortedContractors.forEach(fillContractorsTable)
}
