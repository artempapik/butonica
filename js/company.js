let uploadImageBlock

const COMPANY = 'компанію'

const showCompanyInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['company']
    uploadImageBlock = document.querySelector('.upload-image')

    if (loginInfo.title > 0) {
        document.querySelector('label').remove()
        document.querySelector('button').remove()
    }

    get(`Company/${loginInfo.companyId}`).then(response => {
        if (!response) {
            return
        }

        if (response.imageData) {
            uploadImageBlock.querySelector('img').src = response.imageData
        }

        main.querySelector('.company-name').value = response.name
        main.querySelector('.company-contact-info').value = response.contactInfo
        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage(COMPANY)))
}

const updateCompanyInfo = () => {
    const nameElement = document.querySelector('.company-name')
    const name = nameElement.value.trim()

    if (!name) {
        showMessage('error', 'Введіть назву компанії')
        return
    }
    
    const company = {
        id: loginInfo.companyId,
        startSubscription: loginInfo.startSubscription,
        imageData,
        name,
        contactInfo: document.querySelector('.company-contact-info').value.trim()
    }

    put('Company', company)
        .then(() => showMessage('info', updateSuccessMessage(COMPANY)))
        .catch(() => showMessage('error', updateErrorMessage(COMPANY)))
}
