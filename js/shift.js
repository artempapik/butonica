let shiftsTable, monthShifts, grouppedShifts

const shiftInfoModal = document.querySelector('.shift-info-modal')
const shiftModalContent = shiftInfoModal.querySelector('.shift-info-modal-content')
const shiftEmployeesInfoModal = document.querySelector('.shift-employees-info-modal')

const getShifts = month => {
    showLoadAnimation()
    
    get(`Shift/${loginInfo.employeeId}/${month || new Date().getMonth() + 1}`).then(response => {
        shiftsTable.querySelector('.table-no-data')?.remove()
        monthShifts = response
        const sortedShifts = monthShifts.toSorted((a, b) => a.employee.localeCompare(b.employee))

        if (Map.groupBy) {
            grouppedShifts = Map.groupBy(sortedShifts, s => s.employee)
        } else {
            const groupBy = (list, keyGetter) => {
                const map = new Map()

                list.forEach(item => {
                    const key = keyGetter(item)
                    const collection = map.get(key)

                    if (!collection) {
                        map.set(key, [item])
                    } else {
                        collection.push(item)
                    }
                })

                return map
            }

            grouppedShifts = groupBy(sortedShifts, s => s.employee)
        }

        shiftsTable.querySelectorAll('tr:not(tbody tr)').forEach(tr => tr.remove())
        shiftsTable.style.display = 'block'
        replaceLoadIcons()
        shiftEmployeesInfoModal.querySelector('button').style.display = ''
        shiftEmployeesInfoModal.querySelectorAll('li').forEach(e => e.classList.remove('active'))

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

    const shiftsCalendar = new VanillaCalendar('.shift-table td:nth-child(3)', {
        type: 'month',
        input: true,
        settings: {
            lang: 'uk'
        },
        actions: {
            clickMonth(_, self) {
                shiftsCalendar.hide()
                animateChange(shiftsTable)
                getShifts(self.selectedMonth + 1)
            }
        }
    })

    shiftsCalendar.init()
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

        shiftInfoModal.querySelector('.shift-title span').textContent = employeesNames ? employeesNames[shift.employee] : shift.employee
        shiftInfoModal.querySelector('.shift-time .time span').textContent = formatWeekDate(shift.start, true)

        const setDisplayForShiftEnd = display => {
            document.querySelector('.shift-time span:nth-child(2)').style.display = display
            document.querySelector('.shift-time span:last-child').style.display = display
        }

        if (shift.end) {
            setDisplayForShiftEnd('block')
            shiftInfoModal.querySelector('.shift-time span:last-child').textContent = formatWeekDate(shift.end, true)
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

                    const operationName = cashRegisterOperationTypeToName[operation.type]
                    const type = createSpan(operationName)
                    let shortenedId = ''

                    if (operation.orderId) {
                        const orderId = operation.orderId.toString()
                        shortenedId = orderId.length > 4 ? orderId.substring(orderId.length - 4) : orderId
                    }

                    if (operation.type === 2) {
                        type.textContent += ' ' + shortenedId
                    }

                    if (operation.type === 4) {
                        const orderSpan = createSpan(`(зам. ${shortenedId})`)
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

                    const deleteIcon = document.createElement('span')
                    deleteIcon.classList = 'remove-shift-operation material-symbols-outlined'
                    deleteIcon.innerHTML = operation.type === 2 ? 'cancel' : 'delete'

                    deleteIcon.onpointerup = () => {
                        const confirmText = operation.type === 2 ? `Скасувати замовлення ${operation.orderId}?` : `Видалити ${operationName.toLowerCase()} на ${operation.sum} грн?`

                        showConfirm(confirmText, () => remove(`Shift/operation/${operation.id}`).then(response => {
                            setTimeout(() => hideModal(confirmModal), 1)
                            cashRegisterOperation.remove()

                            if (operation.type === 2) {
                                for (const surchargeSpan of shiftInfoModal.querySelectorAll('.surcharge .order-number')) {
                                    if (surchargeSpan.textContent.includes(shortenedId)) {
                                        surchargeSpan.closest('.form').remove()
                                    }
                                }
                            }

                            shiftEndSums.querySelector('.cash .end-sum').textContent = response.shiftEndCash.toFixed(2) + ' грн'
                            shiftEndSums.querySelector('.terminal-cash .end-sum').textContent = response.shiftEndTerminalCash.toFixed(2) + ' грн'
                            shiftEndSums.querySelector('.bonus-cash .end-sum').textContent = response.shiftEndBonusCash.toFixed(2) + ' грн'
                            showMessage('info', operation.type === 2 ? 'Замовлення скасовано' : operationName + ' видалено')
                        }).catch(() => showMessage('error', deleteErrorMessage(operationName))))
                    }

                    if (operation.payType === 2) {
                        info.append(deleteIcon)
                    } else {
                        info.append(moneyPaidSpan, deleteIcon)
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

                            // const productNameTd = createTd(product.name)
                            // const inDecSpan = document.createElement('div')
                            // inDecSpan.classList = i ? 'increase' : 'decrease'
                            // inDecSpan.textContent = i ? 'націнка +3% (+4 грн)' : 'уцінка –5% (–6 грн)'
                            // productNameTd.append(inDecSpan)

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

                    content.onpointerup = e => {
                        if (e.target.classList.contains('remove-shift-operation')) {
                            return
                        }

                        const cashRegisterContent = cashRegisterOperation.querySelector('.inner-content')

                        if (!cashRegisterContent.style.display) {
                            content.classList.add('active')
                            cashRegisterContent.style.display = 'block'
                            return
                        }

                        content.classList.remove('active')
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
            
            const types = [0, 1, 5, 3, 2, 4]

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
        formatWeekDate(shift.start),
        shift.end ? formatWeekDate(shift.end) : createTd(),
        revenueTd,
        statusTd
    )
    return tr
}

const fillShiftsTable = shift => shiftsTable.append(createShiftRow(shift))

const showShiftByEmployeeFilter = () => {
    if (!monthShifts.length) {
        showMessage('info', 'У вас відсутні зміни в цьому місяці')
        return
    }

    const employeesList = shiftEmployeesInfoModal.querySelector('ul')

    if (![...employeesList.querySelectorAll('li')].some(e => e.classList.contains('active'))) {
        employeesList.innerHTML = ''

        for (const grouppedShift of grouppedShifts) {
            const employeeLogin = createSpan(grouppedShift[0])
            const employeeName = createSpan(employeesNames ? employeesNames[grouppedShift[0]] : '')
            const employeeInfo = document.createElement('div')
            employeeInfo.classList = 'employee-info'
            employeeInfo.append(employeeLogin, employeeName)

            const shiftLabel = createSpan('Робочих змін:')
            const shiftCountLabel = createSpan(grouppedShift[1].length)
            const shiftCountSpan = document.createElement('span')
            shiftCountSpan.classList = 'shift-count'
            shiftCountSpan.append(shiftLabel, shiftCountLabel)
        
            const revenueLabel = createSpan('Виручка:')
            const revenueValueLabel = createSpan(grouppedShift[1].reduce((total, {revenue}) => total + revenue, 0).toFixed(2))
            const revenueValueSpan = document.createElement('span')
            revenueValueSpan.classList = 'revenue'
            revenueValueSpan.append(revenueLabel, revenueValueLabel)
        
            const shiftInfoBlock = document.createElement('div')
            shiftInfoBlock.classList = 'shift-info'
            shiftInfoBlock.append(shiftCountSpan, revenueValueSpan)
        
            const li = document.createElement('li')
    
            li.onpointerup = () => {
                if (li.classList.contains('active')) {
                    hideModal(shiftEmployeesInfoModal)
                    return
                }
    
                employeesList.querySelectorAll('li').forEach(e => e.classList.remove('active'))
                li.classList.add('active')
                shiftEmployeesInfoModal.querySelector('button').style.display = 'flex'
                shiftsTable.querySelectorAll('tr:not(tbody tr)').forEach(tr => tr.remove())
                grouppedShifts.get(li.querySelector('.employee-info span').textContent).forEach(s => fillShiftsTable(s))
                hideModal(shiftEmployeesInfoModal)
                animateChange(shiftsTable)
            }
    
            li.append(employeeInfo, shiftInfoBlock)
            employeesList.append(li)
        }
    }

    hideBodyOverflow()
    shiftEmployeesInfoModal.style.display = 'flex'
    shiftEmployeesInfoModal.querySelector('div').scroll(0, 0)
}

const cancelShiftEmployee = () => {
    for (const shift of shiftEmployeesInfoModal.querySelectorAll('li')) {
        shift.classList.remove('active')
    }

    shiftEmployeesInfoModal.querySelector('button').style.display = ''
    shiftsTable.querySelectorAll('tr:not(tbody tr)').forEach(tr => tr.remove())
    monthShifts.forEach(s => fillShiftsTable(s))
    hideModal(shiftEmployeesInfoModal)
    animateChange(shiftsTable)
}
