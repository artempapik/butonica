let shiftsTable

const shiftInfoModal = document.querySelector('.shift-info-modal')
const shiftModalContent = shiftInfoModal.querySelector('.shift-info-modal-content')

const getShifts = month => {
    showLoadAnimation()
    
    get(`Shift/${loginInfo.employeeId}/${month || new Date().getMonth() + 1}`).then(response => {
        shiftsTable.innerHTML = shiftsTable.querySelector('tbody').innerHTML
        shiftsTable.style.display = 'block'
        replaceLoadIcons()

        if (!response.length) {
            shiftsTable.append(createEmptyDataDiv())
            return
        }

        response.forEach(s => fillShiftsTable(s))
    }).catch(() => showMessage('error', getErrorMessage('робочі зміни')))
}

const showShiftInfo = e => {
    main.innerHTML = menuItemsContents['shift']
    fillSelectedMenuItem(e)
    shiftsTable = document.querySelector('.shift-table table')
    getShifts(0)
}

const cashRegisterOperationTypeToName = {
    0: 'Внесення',
    1: 'Винесення',
    2: 'Замовлення',
    3: 'Продаж',
    4: 'Доплата'
}

const payTypeToName = {
    0: 'Готівка',
    1: 'Термінал',
    2: 'Безкоштовно'
}

const createShiftRow = shift => {
    const tr = document.createElement('tr')
    tr.onpointerup = () => {
        showPageLoad()
        hideBodyOverflow()

        shiftInfoModal.querySelector('.shift-title span').textContent = shift.employee
        shiftInfoModal.querySelector('.shift-time .time span').textContent = formatDate(shift.start)

        const setDisplayForShiftEnd = display => {
            document.querySelector('.shift-time span:nth-child(2)').style.display = display
            document.querySelector('.shift-time span:last-child').style.display = display
        }

        if (shift.end) {
            setDisplayForShiftEnd('block')
            shiftInfoModal.querySelector('.shift-time span:last-child').textContent = formatDate(shift.end)
            shiftInfoModal.querySelector('.shift-time span').style.color = 'rgb(200, 200, 200)'
        } else {
            shiftInfoModal.querySelector('.shift-time span').style.color = 'rgb(50, 50, 50)'
            setDisplayForShiftEnd('none')
        }

        get(`Shift/${shift.id}/operations`).then(response => {
            hidePageLoad()

            const setShiftStartLabel = () => {
                operationsBlock.querySelector('.form:first-child').classList.add('shift-start')
                operationsBlock.querySelector('.types span').textContent = 'Початок зміни:'
            }

            const operationsBlock = shiftInfoModal.querySelector('.operations')
            operationsBlock.innerHTML = ''

            const fillShiftOperations = operations => {
                operationsBlock.innerHTML = ''

                for (const operation of operations) {
                    const time = document.createElement('span')
                    time.textContent = operation.time

                    const type = createSpan(cashRegisterOperationTypeToName[operation.type])

                    if (operation.type === 2) {
                        type.textContent += ' ' + operation.orderId
                    }

                    if (operation.type === 4) {
                        const orderSpan = createSpan(`(зам. №${operation.orderId})`)
                        orderSpan.classList = 'order-number'
                        type.append(orderSpan)
                    }

                    const payType = createSpan(operation.payType === null ? '' : payTypeToName[operation.payType])

                    const types = document.createElement('span')
                    types.classList = 'types'
                    types.append(type, payType)

                    const header = document.createElement('div')
                    header.append(time, types)

                    const info = document.createElement('div')

                    if (operation.bonusSum) {
                        const bonusPaidIcon = document.createElement('span')
                        bonusPaidIcon.classList = 'material-symbols-outlined'
                        bonusPaidIcon.textContent = 'savings'
        
                        const bonusPaid = document.createElement('span')
                        const bonusSum = operation.bonusSum || 0
                        bonusPaid.classList = getClassForNumber(bonusSum)
                        bonusPaid.textContent = bonusSum.toFixed(2) + ' грн'
        
                        const bonusPaidSpan = document.createElement('span')
                        bonusPaidSpan.classList = 'bonus-paid'
                        bonusPaidSpan.append(bonusPaidIcon, bonusPaid)

                        info.append(bonusPaidSpan)
                    }

                    const moneyPaidIcon = document.createElement('span')
                    moneyPaidIcon.classList = 'material-symbols-outlined'
                    moneyPaidIcon.textContent = operation.payType === 0 ? 'attach_money' : 'contactless'

                    const moneyPaid = document.createElement('span')
                    const moneySum = operation.products ? operation.products.length ? operation.sum : operation.type ? -operation.sum : operation.sum : operation.sum
                    moneyPaid.classList = getClassForNumber(moneySum)
                    moneyPaid.textContent = moneySum.toFixed(2) + ' грн'

                    const moneyPaidSpan = document.createElement('span')
                    moneyPaidSpan.classList = 'money-paid'
                    moneyPaidSpan.append(moneyPaidIcon, moneyPaid)

                    const expandIcon = document.createElement('span')
                    expandIcon.classList = 'expand-shift material-symbols-outlined'
                    expandIcon.innerHTML = 'expand_more'

                    if (operation.payType === 2) {
                        info.append(expandIcon)
                    } else {
                        info.append(moneyPaidSpan, expandIcon)
                    }
                    
                    const content = document.createElement('div')
                    content.classList = 'content'
                    content.append(header, info)

                    const innerContent = document.createElement('div')
                    innerContent.classList = 'inner-content'

                    if (!(localStorage.getItem('animations-disabled') || false)) {
                        innerContent.classList.add('animate')
                    }

                    const cashRegisterOperation = document.createElement('div')
                    cashRegisterOperation.classList = 'form'

                    if (operation.type < 2) {
                        innerContent.textContent = operation.comment ? 'Коментар: ' + operation.comment : 'Коментар відсутній'
                    } else if (operation.type === 4) {
                        cashRegisterOperation.classList.add('surcharge')
                    } else {
                        const table = document.createElement('table')
                        const tr = document.createElement('tr')
                        tr.append(
                            createTd('Назва'),
                            createTd('К-ть'),
                            createTd('Сума')
                        )

                        const tbody = document.createElement('tbody')
                        tbody.append(tr)
                        table.append(tbody)

                        for (const product of operation.products) {
                            const tr = document.createElement('tr')
                            tr.append(
                                createTd(product.name),
                                createTd(product.amount),
                                createTd(product.sum.toFixed(2))
                            )
                            table.append(tr)
                        }

                        innerContent.append(table)
                    }

                    if (operation.type === 0 ||
                        operation.type === 1 ||
                        operation.type === 4) {
                        cashRegisterOperation.classList.add('cash-register-operation')
                    }

                    cashRegisterOperation.append(content, innerContent)

                    content.onpointerup = () => {
                        const cashRegisterContent = cashRegisterOperation.querySelector('.inner-content')

                        if (expandIcon.innerHTML === 'expand_more') {
                            content.classList.add('active')
                            expandIcon.innerHTML = 'expand_less'
                            cashRegisterContent.style.display = 'block'
                            return
                        }

                        content.classList.remove('active')
                        expandIcon.innerHTML = 'expand_more'
                        cashRegisterContent.style.display = ''
                    }

                    operationsBlock.append(cashRegisterOperation)
                }
            }

            const viewTypes = shiftInfoModal.querySelectorAll('.shift-view-by .view')
            viewTypes.forEach(vt => {
                vt.classList.remove('active')
                vt.classList.remove('not-active')
            })
            
            const types = [0, 1, 3, 2, 4]

            for (const [index, viewType] of viewTypes.entries()) {
                viewType.onpointerup = () => {
                    if (viewType.classList.contains('active')) {
                        viewTypes.forEach(vt => vt.classList.remove('not-active'))
                        viewType.classList.remove('active')
                        fillShiftOperations(response)
                        setShiftStartLabel()
                        return
                    }

                    viewTypes.forEach(vt => {
                        vt.classList.remove('active')
                        vt.classList.add('not-active')
                    })

                    viewType.classList.add('active')
                    viewType.classList.remove('not-active')

                    const filteredOperations = response.filter(o => o.type === types[index])

                    if (filteredOperations.length) {
                        fillShiftOperations(filteredOperations)

                        if (!index) {
                            setShiftStartLabel()
                        }

                        return
                    }

                    operationsBlock.innerHTML = ''
                    operationsBlock.append(createEmptyDataDiv())
                }
            }

            fillShiftOperations(response)

            setShiftStartLabel()
            const shiftEndSums = shiftInfoModal.querySelector('.shift-end-sums')
            shiftEndSums.querySelector('.cash .end-sum').textContent = shift.shiftEndCash.toFixed(2) + ' грн'
            shiftEndSums.querySelector('.terminal-cash .end-sum').textContent = shift.shiftEndTerminalCash.toFixed(2) + ' грн'
            shiftEndSums.querySelector('.bonus-cash .end-sum').textContent = shift.shiftEndBonusCash.toFixed(2) + ' грн'

            shiftInfoModal.style.display = 'flex'
            shiftModalContent.scroll(0, 0)
        }).catch(() => {
            hidePageLoad()
            showMessage('error', getErrorMessage('зміну'))
        })
    }

    const span = document.createElement('span')
    span.textContent = shift.end ? 'Закрита' : 'Відкрита'
    span.style.background = shift.end ? 'rgba(220, 0, 0, .75)' : 'linear-gradient(180deg, #4B91F7 0%, #367AF6 100%)'

    const statusTd = document.createElement('td')
    statusTd.append(span)

    const revenueTd = createTd(shift.revenue.toFixed(2))
    revenueTd.append(createSpan('грн'))

    tr.append(
        createTd(shift.cashRegister),
        createTd(shift.employee),
        createTd(formatDate(shift.start)),
        createTd(formatDate(shift.end)),
        revenueTd,
        statusTd
    )
    return tr
}

const fillShiftsTable = shift => shiftsTable.append(createShiftRow(shift))
