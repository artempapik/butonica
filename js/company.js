let uploadImageBlock

const showCompanyInfo = e => {
    main.innerHTML = menuItemsContents['company']
    fillSelectedMenuItem(e)
    
    if (localStorage.getItem('animations-disabled') || false) {
        main.querySelector('.company-container').classList.remove('animate')
    }

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
    }).catch(() => showMessage('error', getErrorMessage('компанію')))
}

const updateCompanyInfo = () => {
    const nameElement = document.querySelector('.company-name')
    const name = nameElement.value.trim()

    if (!name) {
        showMessage('error', 'Введіть назву компанії')
        return
    }

    const payButton = document.querySelector('button')
    payButton.disabled = true
    
    const company = {
        id: loginInfo.companyId,
        startSubscription: loginInfo.startSubscription,
        imageData,
        name,
        contactInfo: document.querySelector('.company-contact-info').value.trim()
    }

    put('Company', company)
        .then(() => {
            payButton.disabled = false
            showMessage('info', updateSuccessMessage('компанію'))
        })
        .catch(() => {
            payButton.disabled = false
            showMessage('error', updateErrorMessage('компанію'))
        })
}
