let labelsTable

const showLabelInfo = e => {
    main.innerHTML = menuItemsContents['label']
    fillSelectedMenuItem(e)
    labelsTable = document.querySelector('.label-table table')

    get(`Label/${loginInfo.companyId}`).then(response => {
        labelsTable.style.display = 'block'

        if (!response.length) {
            labelsTable.append(createEmptyDataDiv())
        }

        response.forEach(fillLabelsTable)
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('мітки')))
}

const labelModal = document.querySelector('.create-label-modal')

const labelIndexToBackground = {
    0: '255, 234, 0',
    1: '255, 170, 51',
    2: '232, 132, 35',
    3: '255, 68, 51',
    4: '240, 0, 0',
    5: '191, 64, 191',
    6: '127, 0, 255',
    7: '0, 71, 171',
    8: '100, 149, 237',
    9: '0, 166, 174',
    10: '34, 139, 34',
    11: '154, 205, 50'
}

const labelIndexToColor = {
    0: '40, 40, 40',
    1: '30, 30, 30',
    2: '250, 250, 250',
    3: '245, 245, 245',
    4: '245, 245, 245',
    5: '240, 240, 240',
    6: '240, 240, 240',
    7: '240, 240, 240',
    8: '235, 235, 235',
    9: '250, 250, 250',
    10: '250, 250, 250',
    11: '20, 20, 20',
}

let colorIndex = 0

const createLabelColors = (activeIndex = 0) => {
    const labelColors = labelModal.querySelector('.label-colors')
    labelColors.innerHTML = ''

    for (const key in labelIndexToBackground) {
        const labelColor = document.createElement('div')
        labelColor.classList = 'label-color'
        labelColor.style.background = `rgb(${labelIndexToBackground[key]})`

        labelColor.onpointerup = () => {
            for (const labelColor of labelColors.querySelectorAll('div')) {
                labelColor.style.outline = '.1rem rgb(200, 200, 200) solid'
            }

            labelColor.style.outline = '.2rem rgb(70, 70, 70) solid'
            colorIndex = key
        }

        if (+key === +activeIndex) {
            labelColor.style.outline = '.2rem rgb(70, 70, 70) solid'
            colorIndex = key
        }

        labelColors.append(labelColor)
    }
}

const createLabelModal = () => {
    labelModal.querySelector('h1').textContent = 'Створити мітку'
    labelModal.querySelector('input').value = ''
    createLabelColors()
    labelModal.querySelector('button').onpointerup = () => createLabel()
    hideBodyOverflow()
    labelModal.style.display = 'flex'
}

const createLabelRow = label => {
    const editAction = createEditSpan('label')
    const deleteAction = createDeleteSpan('label')
    const actionsColumn = document.createElement('td')
    actionsColumn.classList = 'label-actions'
    actionsColumn.append(editAction, deleteAction)

    const tr = document.createElement('tr')

    editAction.onpointerup = () => {
        labelModal.querySelector('h1').textContent = 'Редагувати мітку'
        labelModal.querySelector('input').value = label.name
        createLabelColors(label.color)
        labelModal.querySelector('button').onpointerup = () => editLabel(label.id, tr)
        hideBodyOverflow()
        labelModal.style.display = 'flex'
    }

    deleteAction.onpointerup = () =>
        showConfirm(`Видалити мітку «${label.name}»?`, () =>
            remove('Label', label).then(() => {
                setTimeout(() => hideModal(confirmModal), 1)
                showMessage('info', deleteSuccessMessage('мітку'))
                labelsTable.removeChild(tr)

                if (labelsTable.children.length === 1) {
                    labelsTable.append(createEmptyDataDiv())
                }
            }).catch(() => showMessage('error', deleteErrorMessage('мітку'))))

    const span = document.createElement('span')
    span.textContent = label.name
    span.style.background = `rgb(${labelIndexToBackground[label.color]})`
    span.style.color = `rgb(${labelIndexToColor[label.color]})`

    const nameTd = document.createElement('td')
    nameTd.append(span)

    tr.append(nameTd, actionsColumn)
    return tr
}

const fillLabelsTable = label => labelsTable.append(createLabelRow(label))

const createLabel = () => {
    const nameElement = labelModal.querySelector('input')
    const name = nameElement.value.trim()

    if (!name) {
        showMessage('error', 'Введіть назву мітки')
        return
    }

    const payButton = labelModal.querySelector('button')
    payButton.disabled = true

    const label = {
        companyId: loginInfo.companyId,
        name,
        color: +colorIndex
    }

    post('Label', label).then(response => {
        hideModalEnableButton(labelModal, payButton)
        showMessage('success', createSuccessMessage('мітку'))
        label.id = response
        checkEmptyTable(labelsTable)
        fillLabelsTable(label)
    }).catch(() => {
        hideModalEnableButton(labelModal, payButton)
        showMessage('error', createErrorMessage('мітку'))
    })
}

const editLabel = (id, oldRow) => {
    const nameElement = labelModal.querySelector('input')
    const name = nameElement.value.trim()

    if (!name) {
        showMessage('error', 'Введіть назву мітки')
        return
    }

    const payButton = labelModal.querySelector('button')
    payButton.disabled = true

    const label = {
        id,
        companyId: loginInfo.companyId,
        name,
        color: +colorIndex
    }

    put('Label', label).then(() => {
        hideModalEnableButton(labelModal, payButton)
        showMessage('info', updateSuccessMessage('мітку'))
        const newRow = createLabelRow(label)
        labelsTable.replaceChild(newRow, oldRow)
    }).catch(() => {
        hideModalEnableButton(labelModal, payButton)
        showMessage('error', updateErrorMessage('мітку'))
    })
}
