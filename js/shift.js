let shiftsTable

const shiftInfoModal = document.querySelector('.shift-info-modal')
const shiftModalContent = shiftInfoModal.querySelector('.shift-info-modal-content')

const showShiftInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['shift']
    shiftsTable = document.querySelector('.shift-table table')

    get(`Shift/${loginInfo.employeeId}`).then(response => {
        if (response.length) {
            shiftsTable.style.display = 'block'
        }

        response.forEach(s => fillShiftsTable(s))
    }).catch(() => showMessage('error', getErrorMessage('робочі зміни')))
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
        get(`Shift/${shift.id}/operations`).then(response => {
            const operations = shiftInfoModal.querySelector('.operations')
            operations.innerHTML = ''

            for (const operation of response) {
                const time = document.createElement('span')
                time.textContent = operation.time

                const type = createSpan(cashRegisterOperationTypeToName[operation.type])

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

                const info = document.createElement('div')

                if (operation.payType === 2) {
                    info.append(expandIcon)
                } else {
                    info.append(bonusPaidSpan, moneyPaidSpan, expandIcon)
                }
                
                const content = document.createElement('div')
                content.classList = 'content'
                content.append(header, info)

                const innerContent = document.createElement('div')
                innerContent.classList = 'inner-content'

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
                            createTd(product.sum.toFixed(2) + ' грн')
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
                    if (expandIcon.innerHTML === 'expand_more') {
                        expandIcon.innerHTML = 'expand_less'
                        cashRegisterOperation.querySelector('.inner-content').style.display = 'block'
                        return
                    }

                    expandIcon.innerHTML = 'expand_more'
                    cashRegisterOperation.querySelector('.inner-content').style.display = ''
                }

                operations.append(cashRegisterOperation)
            }

            const shiftEndSums = shiftInfoModal.querySelector('.shift-end-sums')
            shiftEndSums.querySelector('.cash .end-sum').textContent = shift.shiftEndCash.toFixed(2) + ' грн'
            shiftEndSums.querySelector('.terminal-cash .end-sum').textContent = shift.shiftEndTerminalCash.toFixed(2) + ' грн'
            shiftEndSums.querySelector('.bonus-cash .end-sum').textContent = shift.shiftEndBonusCash.toFixed(2) + ' грн'

            shiftInfoModal.style.display = 'flex'
            shiftModalContent.scroll(0, 0)
        }).catch(() => showMessage('error', getErrorMessage('зміну')))
    }

    const span = document.createElement('span')
    span.textContent = shift.end ? 'Закрита' : 'Відкрита'
    span.style.background = shift.end ? 'rgb(220, 0, 0)' : 'rgb(0, 71, 171)'

    const statusTd = document.createElement('td')
    statusTd.append(span)

    tr.append(
        createTd(shift.cashRegister),
        createTd(shift.employee),
        createTd(formatDate(shift.start)),
        createTd(formatDate(shift.end)),
        createTd(shift.revenue.toFixed(2) + ' грн'),
        statusTd
    )
    return tr
}

const fillShiftsTable = shift => shiftsTable.append(createShiftRow(shift))
