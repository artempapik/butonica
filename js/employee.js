let employeesTable
const EMPLOYEE = 'працівника'

const showEmployeeInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['employee']
    employeesTable = document.querySelector('.employee-table table')

    if (loginInfo.title > 0) {
        document.querySelector('button').remove()
    }

    get(`Stock/ids-names/${loginInfo.companyId}`).then(response => {
        const employeeStocks = employeeModal.querySelector('.employee-stock')
        employeeStocks.innerHTML = ''

        for (const stock of response) {
            const option = document.createElement('option')
            option.text = stock.name
            option.dataset.id = stock.id
            employeeStocks.add(option)
        }
    })

    get(`Employee/${loginInfo.companyId}`).then(response => {
        if (response.length) {
            employeesTable.style.display = 'block'
        }
    
        response.forEach(e => fillEmployeesTable(e))
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('працівників')))
}

const employeeModal = document.querySelector('.create-employee-modal')
const employeeInfoModal = document.querySelector('.employee-info-modal')

const createEmployeeModal = () => {
    employeeModal.querySelector('h1').textContent = `Створити ${EMPLOYEE}`
    employeeModal.querySelectorAll('input').forEach(i => i.value = '')
    employeeModal.querySelector('.employee-title').value = ''
    employeeModal.querySelector('.stock-employee').style.display = 'flex'
    employeeModal.querySelector('.active-employee').style.display = 'flex'
    employeeModal.querySelector('.active-employee input').checked = false
    employeeModal.querySelector('button').onpointerup = () => createEmployee()
    hideBodyOverflow()
    employeeModal.style.display = 'flex'
}

const employeeTitleToBackground = {
    0: '0, 119, 204',
    1: '127, 0, 255',
    2: '34, 139, 34',
    3: '232, 132, 35'
}

const hideEmployeeTitle = e => employeeModal.querySelector('.stock-employee').style.display = e.target.selectedIndex < 2 ? 'none' : ''

const createEmployeeRow = employee => {
    const editAction = createEditSpan('employee')
    const deleteAction = createDeleteSpan('employee')
    const actionsColumn = document.createElement('td')

    if (loginInfo.title === 0) {
        actionsColumn.classList = 'employee-actions'
        actionsColumn.append(editAction, deleteAction)
    }

    const tr = document.createElement('tr')
    tr.onpointerup = e => {
        if (e.target.tagName.toLowerCase() === 'span' &&
            e.target.className &&
            e.target.className !== 'material-symbols-outlined') {
            return
        }

        hideBodyOverflow()
        employeeInfoModal.querySelector('.employee-full-name').textContent = employee.fullName
        employeeInfoModal.querySelector('.employee-login').textContent = employee.email
        employeeInfoModal.querySelector('.employee-stock').textContent = employee.title === 0 ? '–' : employee.stock
        employeeInfoModal.querySelector('.employee-title').textContent = employeeTitleToName[employee.title]
        employeeInfoModal.querySelector('.employee-registration-date').textContent = formatDate(employee.registrationDate)
        showHideNodeInfo(employeeInfoModal, 'employee-birth-date', formatDate(employee.birthDate, false, false))
        showHideNodeInfo(employeeInfoModal, 'employee-phone', formatPhoneNumber(employee.phone))
        employeeInfoModal.style.display = 'flex'
        employeeInfoModal.querySelector('.employee-info-modal-content').scroll(0, 0)
    }

    if (loginInfo.title === 0) {
        editAction.onpointerup = () => {
            employeeModal.querySelector('.stock-employee').style.display = 'flex'
            employeeModal.querySelector('.active-employee').style.display = 'flex'

            employeeModal.querySelector('h1').textContent = `Редагувати ${EMPLOYEE}`
            employeeModal.querySelector('.employee-login').value = employee.email
            employeeModal.querySelector('.employee-password').value = employee.password
            employeeModal.querySelector('.employee-title').selectedIndex = employee.title
            employeeModal.querySelector('.active-employee input').checked = employee.isActive
            employeeModal.querySelector('.employee-full-name').value = employee.fullName
            employeeModal.querySelector('.employee-phone').value = employee.phone
            employeeModal.querySelector('.employee-birth-date').value = employee.birthDate ? getDate(employee.birthDate) : ''

            if (getComputedStyle(actionsColumn.querySelector('.delete-employee')).display === 'none') {
                employeeModal.querySelector('.employee-title').parentNode.style.display = 'none'
                employeeModal.querySelector('.stock-employee').style.display = 'none'
                employeeModal.querySelector('.active-employee').style.display = 'none'
            }

            employeeModal.querySelector('button').onpointerup = () => editEmployee(employee, tr)
            employeeModal.style.display = 'flex'
        }

        deleteAction.onpointerup = () => {
            if (confirm(`${CONFIRM_DELETE_TEXT} ${EMPLOYEE} "${employee.fullName}"?\nПісля видалення ви втратите доступ до його робочих змін.`)) {
                remove('Employee', employee).then(() => {
                    showMessage('info', deleteSuccessMessage(EMPLOYEE))
                    employeesTable.removeChild(tr)

                    if (employeesTable.children.length === 1) {
                        employeesTable.style.display = ''
                    }
                }).catch(() => showMessage('error', deleteErrorMessage(EMPLOYEE)))
            }
        }
    }

    const span = document.createElement('span')
    span.textContent = employeeTitleToName[employee.title]
    span.style.background = `rgb(${employeeTitleToBackground[employee.title]})`

    const titleTd = document.createElement('td')
    titleTd.append(span)

    const activeIcon = document.createElement('img')
    activeIcon.src = `img/${employee.isActive ? 'check' : 'decline'}.png`

    if (!employee.isActive) {
        activeIcon.classList.add('scaled')
    }

    const activeEmployeeTd = document.createElement('td')
    activeEmployeeTd.append(activeIcon)

    tr.append(
        createTd(employee.fullName),
        createTd(employee.title === 0 ? '–' : employee.stock),
        titleTd,
        activeEmployeeTd,
        createTd(formatPhoneNumber(employee.phone)),
        loginInfo.title === 0 ? actionsColumn : createTd()
    )
    return tr
}

const fillEmployeesTable = employee => employeesTable.append(createEmployeeRow(employee))

const createEmployee = () => {
    const emailElement = employeeModal.querySelector('.employee-login')
    const email = emailElement.value.trim()

    if (!email) {
        showMessage('error', 'Введіть логін працівника')
        return
    }

    const passwordElement = employeeModal.querySelector('.employee-password')
    const password = passwordElement.value.trim()

    if (!password) {
        showMessage('error', 'Введіть пароль працівника')
        return
    }

    if (password.length < 4) {
        showMessage('error', 'В паролі має бути хоча би 4 символи')
        return
    }

    const titleElement = employeeModal.querySelector('.employee-title')
    const title = titleElement.selectedIndex

    if (title === -1) {
        showMessage('error', 'Оберіть посаду працівника')
        return
    }

    const fullNameElement = employeeModal.querySelector('.employee-full-name')
    const fullName = fullNameElement.value.trim()

    if (!fullName) {
        showMessage('error', 'Введіть ПІБ працівника')
        return
    }

    const birthDateElement = employeeModal.querySelector('.employee-birth-date')
    const birthDate = birthDateElement.value ? new Date(birthDateElement.value) : null

    const employee = {
        companyId: loginInfo.companyId,
        email,
        password,
        title,
        stockId: +employeeModal.querySelector('.employee-stock').selectedOptions[0].dataset.id,
        isActive: employeeModal.querySelector('.active-employee input').checked,
        fullName,
        phone: employeeModal.querySelector('.employee-phone').value.trim(),
        birthDate,
        registrationDate: new Date()
    }

    if (employee.title < 2) {
        delete employee.stockId
    }

    hideModal(employeeModal)

    post('Employee', employee).then(response => {
        showMessage('success', createSuccessMessage(EMPLOYEE))
        employee.id = response
        fillEmployeesTable(employee)
        employeesTable.style.display = 'block'
    }).catch(e => {
        if (e.message === '403') {
            showMessage('error', `Ви не можете створити ще одного ${EMPLOYEE}`)
            return
        }

        if (e.message === '406') {
            showMessage('error', 'Такий логін вже існує в системі')
            return
        }

        showMessage('error', createErrorMessage(EMPLOYEE))
    })
}

const editEmployee = (oldEmployee, oldRow) => {
    const emailElement = employeeModal.querySelector('.employee-login')
    const email = emailElement.value.trim()

    if (!email) {
        showMessage('error', 'Введіть логін працівника')
        return
    }

    const passwordElement = employeeModal.querySelector('.employee-password')
    const password = passwordElement.value.trim()

    if (!password) {
        showMessage('error', 'Введіть пароль працівника')
        return
    }

    if (password.length < 4) {
        showMessage('error', 'В паролі має бути хоча би 4 символи')
        return
    }

    const fullNameElement = employeeModal.querySelector('.employee-full-name')
    const fullName = fullNameElement.value.trim()

    if (!fullName) {
        showMessage('error', 'Введіть ПІБ працівника')
        return
    }

    const birthDateElement = employeeModal.querySelector('.employee-birth-date')
    const birthDate = birthDateElement.value ? new Date(birthDateElement.value) : null

    const employee = {
        id: oldEmployee.id,
        companyId: loginInfo.companyId,
        email,
        password,
        title: employeeModal.querySelector('.employee-title').selectedIndex,
        stockId: +employeeModal.querySelector('.employee-stock').selectedOptions[0].dataset.id,
        isActive: employeeModal.querySelector('.active-employee input').checked,
        fullName,
        phone: employeeModal.querySelector('.employee-phone').value.trim(),
        birthDate,
        registrationDate: oldEmployee.registrationDate
    }

    if (employee.title < 2) {
        delete employee.stockId
    }

    hideModal(employeeModal)

    put('Employee', employee).then(() => {
        showMessage('info', updateSuccessMessage(EMPLOYEE))
        const newRow = createEmployeeRow(employee)
        employeesTable.replaceChild(newRow, oldRow)

        if (employee.id === loginInfo.employeeId) {
            loginInfo.fullName = employee.fullName
            loginInfo.title = employee.title
            localStorage.setItem('login-info', JSON.stringify(loginInfo))
            document.querySelector('.profile').textContent = getInitials(loginInfo.fullName)
            document.querySelector('.profile-info div span:last-child').textContent = loginInfo.fullName + ' — ' + employeeTitleToName[loginInfo.title]
        }
    }).catch(e => {
        if (e.message === '406') {
            showMessage('error', 'Такий логін вже існує в системі')
            return
        }

        showMessage('error', updateErrorMessage(EMPLOYEE))
    })
}
