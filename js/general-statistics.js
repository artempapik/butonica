const getStatisticsValues = month => get(`Statistics/general/${loginInfo.companyId}/${month || new Date().getMonth() + 1}`).then(response => {
    const statValues = document.querySelectorAll('.general-statistics-info .stat-value span:first-child')
    statValues.item(0).parentNode.classList = `stat-value ${getClassForNumber(response[0])}`

    for (let i = 0; i < statValues.length; i++) {
        statValues.item(i).textContent = (+response[i]).toFixed(2)
    }

    replaceLoadIcons()
}).catch(() => showMessage('error', getErrorMessage('статистику')))

const showGeneralStatisticsInfo = e => {
    fillSelectedMenuItem(e)
    main.innerHTML = menuItemsContents['generalstatistics']
    getStatisticsValues(0)
}
