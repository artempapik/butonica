const showGeneralStatisticsInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['generalstatistics']

    get(`Statistics/general/${loginInfo.companyId}`).then(response => {
        const statValues = document.querySelectorAll('.general-statistics-info .stat-value span:first-child')
        statValues.item(0).parentNode.classList.add(getClassForNumber(response[0]))

        for (let i = 0; i < statValues.length; i++) {
            statValues.item(i).textContent = (+response[i]).toFixed(2)
        }

        replaceLoadIcons()
    }).catch(() => showMessage('error', getErrorMessage('статистику')))
}
