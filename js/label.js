let labelsTable
const LABEL = 'мітку'

const showLabelInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['label']
    labelsTable = document.querySelector('.label-table table')

    get(`Label/${loginInfo.companyId}`).then(response => {
        if (response.length) {
            labelsTable.style.display = 'block'
        }
    
        response.forEach(l => fillLabelsTable(l))
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
                labelColor.style.outline = '.1rem rgb(150, 150, 150) solid'
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
    labelModal.querySelector('h1').textContent = `Створити ${LABEL}`
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
        labelModal.querySelector('h1').textContent = `Редагувати ${LABEL}`
        labelModal.querySelector('input').value = label.name
        createLabelColors(label.color)
        labelModal.querySelector('button').onpointerup = () => editLabel(label.id, tr)
        hideBodyOverflow()
        labelModal.style.display = 'flex'
    }

    deleteAction.onpointerup = () => {
        if (confirm(`Ви дійсно бажаєте видалити ${LABEL} "${label.name}"?`)) {
            remove('Label', label).then(() => {
                showMessage('info', deleteSuccessMessage(LABEL))
                labelModal.style.display = ''
                labelsTable.removeChild(tr)

                if (labelsTable.children.length === 1) {
                    labelsTable.style.display = ''
                }
            }).catch(() => showMessage('error', deleteErrorMessage(LABEL)))
        }
    }

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

    const label = {
        companyId: loginInfo.companyId,
        name,
        color: +colorIndex
    }

    post('Label', label).then(response => {
        showMessage('success', createSuccessMessage(LABEL))
        label.id = response
        fillLabelsTable(label)
        labelsTable.style.display = 'block'
        labelModal.style.display = ''
    }).catch(() => {
        labelModal.style.display = ''
        showMessage('error', createErrorMessage(LABEL))
    })
}

const editLabel = (id, oldRow) => {
    const nameElement = labelModal.querySelector('input')
    const name = nameElement.value.trim()

    if (!name) {
        showMessage('error', 'Введіть назву мітки')
        return
    }

    const label = {
        id,
        companyId: loginInfo.companyId,
        name,
        color: +colorIndex
    }

    put('Label', label).then(() => {
        showMessage('info', updateSuccessMessage(LABEL))
        const newRow = createLabelRow(label)
        labelsTable.replaceChild(newRow, oldRow)
        labelModal.style.display = ''
    }).catch(() => {
        labelModal.style.display = ''
        showMessage('error', updateErrorMessage(LABEL))
    })
}
