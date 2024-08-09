let uploadImageBlock

const copyToClipboard = () => {
    navigator.clipboard.writeText(
        '🌸 ' +
        document.querySelector('.company-name').value +
        '\n' +
        document.querySelector('.company-contact-info').value
    )
    
    showMessage('info', 'Скопійовано')
}

const showCompanyInfo = e => {
    main.innerHTML = menuItemsContents['company']
    fillSelectedMenuItem(e)
    uploadImageBlock = document.querySelector('.upload-image')

    if (loginInfo.title > 0) {
        document.querySelector('label').remove()
        document.querySelector('.desire-gain').remove()
    } else {
        const desireGains = document.querySelectorAll('.dg input')
        desireGains.item(0).value = localStorage.getItem('day-gain')
        desireGains.item(1).value = localStorage.getItem('week-gain')
        desireGains.item(2).value = localStorage.getItem('month-gain')
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

    const payButton = document.querySelector('.save')
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
            const desireGains = document.querySelectorAll('.dg input')
            localStorage.setItem('day-gain', +desireGains.item(0).value)
            localStorage.setItem('week-gain', +desireGains.item(1).value)
            localStorage.setItem('month-gain', +desireGains.item(2).value)
            payButton.disabled = false
            showMessage('info', updateSuccessMessage('відомості'))
        })
        .catch(() => {
            payButton.disabled = false
            showMessage('error', updateErrorMessage('відомості'))
        })
}
