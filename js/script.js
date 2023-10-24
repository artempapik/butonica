const BASE_URL = 'https://botanice.user30503.realhost-free.net'
// const BASE_URL = 'https://localhost:7099'

const EMPTY_IMAGE_URL = 'img/empty-flower.webp'

let imageData

const uploadImage = e => {
    const image = e.target.files[0]
    toBase64(image).then(response => {
        e.target.parentNode.querySelector('input').value = ''
        e.target.parentNode.querySelector('img').src = response
        imageData = response
    }).catch(() => console.log('Error converting company image to base64.'))
}

const removeImage = e => {
    imageData = ''
    e.target.parentNode.parentNode.querySelector('img').src = EMPTY_IMAGE_URL
}

const toBase64 = file => new Promise(resolve => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
})

const showMessage = (type, text) => {
    const typeToColor = {
        error: ['rgba(220, 20, 60, .9)', 'rgb(250, 250, 250)'],
        info : ['rgb(0, 71, 171)', 'rgb(240, 240, 240)'],
        success: ['rgb(46, 139, 87)', 'rgb(245, 245, 245)']
    }

    const message = document.querySelector('#message')
    message.style.display = 'block'
    message.textContent = text

    const colors = typeToColor[type]
    message.style.background = colors[0]
    message.style.color = colors[1]

    const animationTime = 400
    const delayTime = 2500
    const disappearTime = animationTime + delayTime - 50

    setTimeout(() => {
        message.animate([
            { top: '3%', opacity: '1' },
            { top: '0', opacity: '0' },
        ], animationTime)
    }, delayTime)

    setTimeout(() => message.style.display = '', disappearTime)
}

const get = async url => {
    const response = await fetch(`${BASE_URL}/${url}`)

    if (response.status >= 400) {
        throw new Error('403 ' + await response.text())
    }

    return response.status === 204 ? '' : await response.json()
}

const doRequest = async (method, url, data) => {
    const response = await fetch(`${BASE_URL}/${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })

    if (response.status === 200) {
        return await response.json()
    }

    if (response.status === 204) {
        return ''
    }

    if (response.status === 206) {
        return await response.text()
    }

    if (response.status >= 400) {
        throw new Error(response.status)
    }
}

const post = async (url, data) => await doRequest('post', url, data)
const put = async (url, data) => await doRequest('put', url, data)
const remove = async (url, data) => await doRequest('delete', url, data)

const createTd = text => {
    const td = document.createElement('td')
    td.textContent = text
    return td
}

const createSpan = (text = '') => {
    const span = document.createElement('span')
    span.textContent = text
    return span
}

const createIconSpan = (className, icon) => {
    const span = document.createElement('span')
    span.classList = `${icon}-${className} material-symbols-outlined`
    span.textContent = icon
    return span
}

const createEditSpan = className => createIconSpan(className, 'edit')
const createDeleteSpan = className => createIconSpan(className, 'delete')

const getClassForNumber = number => {
    if (number > 0) {
        return 'positive-left'
    } else if (number < 0) {
        return 'negative-left'
    }

    return ''
}

const createEmptyDataDiv = () => {
    const emptyIconSpan = document.createElement('span')
    emptyIconSpan.classList = 'material-symbols-outlined'
    emptyIconSpan.textContent = 'image'

    const noDataSpan = document.createElement('span')
    noDataSpan.textContent = 'Даних немає'

    const emptyDataDiv = document.createElement('div')
    emptyDataDiv.classList = 'table-no-data'
    emptyDataDiv.append(emptyIconSpan, noDataSpan)
    return emptyDataDiv
}

const setCurrentDate = e => {
    const parent = e.target.parentNode
    const input = parent.querySelector('input')

    if (input) {
        input.valueAsDate = new Date()
        return
    }

    parent.parentNode.querySelector('input').valueAsDate = new Date()
}

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

const ERROR_TEXT = 'Не вдалося'
const CONFIRM_DELETE_TEXT = 'Ви дійсно бажаєте видалити'

const getErrorMessage = text => `${ERROR_TEXT} завантажити ${text}`
const createErrorMessage = text => `${ERROR_TEXT} створити ${text}`
const updateErrorMessage = text => `${ERROR_TEXT} оновити ${text}`
const deleteErrorMessage = text => `${ERROR_TEXT} видалити ${text}`

const createSuccessMessage = text => `${capitalize(text)} створено`
const updateSuccessMessage = text => `${capitalize(text)} відредаговано`
const deleteSuccessMessage = text => `${capitalize(text)} видалено`

const themes = ['dark_mode', 'light_mode']
let isDarkTheme = false

const theme = document.querySelector('.theme')
theme.onpointerup = () => {
    isDarkTheme = !isDarkTheme
    theme.innerHTML = themes[+isDarkTheme]
}

const main = document.querySelector('main')

const menuItems = document.querySelectorAll('.menu-item')
menuItems.forEach(menuItem => menuItem.onpointerup = () => {
    const submenu = menuItem.parentNode.querySelector('ul')

    if (!submenu) {
        return
    }

    const expandIcon = menuItem.parentNode.querySelector('.menu-item').children.item(1)

    if (submenu.style.display) {
        submenu.style.display = ''
        expandIcon.innerHTML = 'expand_more'
        return
    }

    submenu.style.display = 'flex'
    expandIcon.innerHTML = 'expand_less'
})

const menuItemsContents = {
    company: `
        <div class="company-header">
            <h1>Деталі компанії</h1>
        </div>
        <div class="company-container">
            <div class="content">
                <div class="upload-image">
                    <img src="img/empty-flower.webp">
                    <span class="files-buttons">
                        <label for="company-files">
                            <span class="material-symbols-outlined">attach_file</span>
                        </label>
                        <span class="remove-image material-symbols-outlined" onpointerup="removeImage(event)">delete_forever</span>
                    </span>
                    <input id="company-files" type="file" onchange="uploadImage(event)">
                </div>
                <div class="inputs">
                    <div class="form">
                        <h2>
                            <span>
                                <span class="required">*</span>
                                <span>Назва</span>
                            </span>
                        </h2>
                        <input class="company-name" maxlength="30">
                    </div>
                    <div class="form">
                        <h2>Контактні дані</h2>
                        <textarea class="company-contact-info" maxlength="100" rows="3"></textarea>
                    </div>
                </div>
            </div>
            <button class="save" onpointerup="updateCompanyInfo()">Зберегти</button>
        </div>
    `,
    stock: `
        <div class="stock-header">
            <h1>Торгові точки</h1>
            <button onpointerup="createStockModal()">Створити</button>
        </div>
        <div class="stock-table">
            <table>
                <tr>
                    <td>Назва</td>
                    <td>Адреса</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    cashregister: `
        <div class="cash-register-header">
            <h1>Каси</h1>
            <button onpointerup="createCashRegisterModal()">Створити</button>
        </div>
        <div class="cash-register-table">
            <table>
                <tr>
                    <td>Назва</td>
                    <td>
                        <span class="material-symbols-outlined">attach_money</span>
                        <span>Готівка</span>
                    </td>
                    <td>
                        <span class="material-symbols-outlined">contactless</span>
                        <span>Термінал</span>
                    </td>
                    <td>Статус</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    employee: `
        <div class="employee-header">
            <h1>Працівники</h1>
            <button onpointerup="createEmployeeModal()">Створити</button>
        </div>
        <div class="employee-table">
            <table>
                <tr>
                    <td>ПІБ</td>
                    <td>Магазин</td>
                    <td>Посада</td>
                    <td>Активний</td>
                    <td>Телефон</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    category: `
        <div class="category-header">
            <h1>Категорії</h1>
            <button onpointerup="createCategoryModal()">Створити</button>
        </div>
        <input onkeyup="searchCategory()" class="search-category" placeholder="Пошук категорії">
        <div class="category-table">
            <table>
                <tr>
                    <td onpointerup="sortCategories()">
                        <span>Назва</span>
                        <span class="material-symbols-outlined">unfold_more</span>
                    </td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    product: `
        <div class="product-header">
            <h1>Товари</h1>
            <button onpointerup="createProductModal()">Створити</button>
        </div>
        <input onkeyup="searchProduct()" class="search-product" placeholder="Пошук товару">
        <div class="product-filters">
            <h4>Категорії:</h4>
            <button onpointerup="showAllProducts()">Всі</button>
        </div>
        <div class="product-table">
            <table>
                <tr>
                    <td onpointerup="sortProducts()">
                        <span>Назва</span>
                        <span class="material-symbols-outlined">unfold_more</span>
                    </td>
                    <td>Категорія</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    contractor: `
        <div class="contractor-header">
            <h1>Постачальники</h1>
            <button onpointerup="createContractorModal()">Створити</button>
        </div>
        <div class="contractor-table">
            <table>
                <tr>
                    <td onpointerup="sortContractors()">
                        <span>Ім'я</span>
                        <span class="material-symbols-outlined">unfold_more</span>
                    </td>
                    <td>Email</td>
                    <td>Телефон</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    supply: `
        <div class="supply-header">
            <h1>Поставки</h1>
            <button onpointerup="createSupplyModal()">Створити</button>
        </div>
        <div class="supply-table">
            <table>
                <tr>
                    <td onpointerup="sortSupplies()">
                        <span>Дата</span>
                        <span class="material-symbols-outlined">unfold_more</span>
                    </td>
                    <td>Постачальник</td>
                    <td>Склад</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    leftover: `
        <div class="leftover-header">
            <h1>Залишки по складах</h1>
        </div>
        <input onkeyup="searchLeftover()" class="search-leftover" placeholder="Пошук товару">
        <div>
        <div class="leftover-category-filters">
            <h4>Категорії:</h4>
            <button onpointerup="showAllLeftoverCategories()">Всі</button>
        </div>
        </div>
        <div class="leftover-stock-filters">
            <h4>Склади:</h4>
            <button onpointerup="showAllLeftoverStocks()">Всі</button>
        </div>
        <div class="leftover-table">
            <table>
                <tr>
                    <td onpointerup="sortLeftoverByName()">
                        <span>Товар</span>
                        <span class="material-symbols-outlined">unfold_more</span>
                    </td>
                    <td onpointerup="sortLeftoverByStock()">
                        <span>Склад</span>
                        <span class="material-symbols-outlined">unfold_more</span>
                    </td>
                    <td onpointerup="sortLeftoverByAmount()">
                        <span>Кількість</span>
                        <span class="material-symbols-outlined">unfold_more</span>
                    </td>
                    <td>Ціна закупівлі</td>
                </tr>
            </table>
            <div>
                <span>Загальна ціна закупівлі:</span>
                <span></span>
            </div>
        </div>
    `,
    inventory: `
        <div class="inventory-header">
            <h1>Інвентаризація</h1>
            <button onpointerup="createInventoryModal()">Створити</button>
        </div>
        <div class="inventory-filters">
            <h4>Склади:</h4>
            <button onpointerup="showAllInventories()">Всі</button>
        </div>
        <div class="inventory-table">
            <table>
                <tr>
                    <td>Склад</td>
                    <td>Дата</td>
                    <td>Результат</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    sale: `
        <div class="sale-header">
            <h1>Продаж</h1>
            <input class="search-sale-product" onkeyup="searchSaleProductFlavor(event)" placeholder="Пошук товару або букету">
            <div>
                <input type="checkbox" onclick="showFlowerImages()">
                <label>зображення</label>
            </div>
        </div>
        <div class="sale-content">
            <div class="sale-products"></div>
            <div class="sale-panel">
                <div class="sale-cash-register">
                    <div class="cash-register">
                        <button onpointerup="showCashRegisterOperations()">
                            <span class="material-symbols-outlined">attach_money</span>
                            <span>Каса</span>
                        </button>
                        <button onpointerup="endEmployeeShift()">
                            <span class="material-symbols-outlined">close</span>
                            <span>Закрити зміну</span>
                        </button>
                    </div>
                    <div class="cash-register-products">
                        <div class="shifts">
                            <div class="empty-cart">
                                <span class="material-symbols-outlined">shopping_cart</span>
                                <span>Кошик порожній</span>
                            </div>
                            <span class="add-shift material-symbols-outlined" onpointerup="addShift()">add_circle</span>
                        </div>
                        <div class="products">
                            <div class="products-header">
                                <div>
                                    <span class="material-symbols-outlined">shopping_cart</span>
                                    <div class="shopping-cart-total">0</div>
                                </div>
                                <span class="remove-cart material-symbols-outlined" onpointerup="removeSaleCart()">delete</span>
                            </div>
                            <div class="sale-products"></div>
                        </div>
                    </div>
                </div>
                <div class="sale-pay-buttons">
                    <div class="to-pay">
                        <span class="to-pay-message">До сплати:</span>
                        <div>
                            <input type="number" oninput="handlePriceInput(event)">
                            <span>грн</span>
                        </div>
                    </div>
                    <div class="checkout" onpointerup="createSaleOrderModal()">Оформити замовлення</div>
                    <div class="checkout-clients">
                        <span>Клієнт:</span>
                        <div>
                            <select></select>
                            <input onkeyup="searchClientByPhone()" class="search-checkout-client" placeholder="Телефон" maxlength="13">
                        </div>
                        <span>Очистити</span>
                    </div>
                    <div class="sale-payment" onpointerup="createSaleModal()">Оплата</div>
                </div>
            </div>
        </div>
    `,
    client: `
        <div class="client-header">
            <h1>Клієнти</h1>
            <button onpointerup="createClientModal()">Створити</button>
        </div>
        <div class="client-bonus">
            <span>Відсоток бонусів:</span>
            <div>
                <input type="number" min="0" max="100" oninput="handlePriceInput(event)">
                <span>%</span>
            </div>
            <button onpointerup="setClientDiscount()">Обрати</button>
        </div>
        <div class="client-table">
            <table>
                <tr>
                    <td>ПІБ</td>
                    <td>Email</td>
                    <td>Телефон(и)</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    waste: `
        <div class="waste-header">
            <h1>Списання</h1>
            <button onpointerup="createWasteModal()">Створити</button>
        </div>
        <div class="waste-table">
            <table>
                <tr>
                    <td>Дата</td>
                    <td>Склад</td>
                    <td>Хто списав</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    shift: `
        <div class="shift-header">
            <h1>Робочі зміни</h1>
        </div>
        <div class="shift-table">
            <table>
                <tr>
                    <td>Каса</td>
                    <td>Працівник</td>
                    <td>Час відкриття</td>
                    <td>Час закриття</td>
                    <td>Виручка</td>
                    <td>Статус</td>
                </tr>
            </table>
        </div>
    `,
    allorder: `
        <div class="order-header">
            <h1>Всі замовлення</h1>
            <button onpointerup="createInternetOrderModal()">Створити</button>
        </div>
        <div class="all-order-table">
            <table>
                <tr>
                    <td>№</td>
                    <td>Дата</td>
                    <td>Замовник</td>
                    <td>Тип</td>
                    <td>Статус</td>
                    <td>Мітки</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    completedorder: `
        <div class="order-header">
            <h1>Виконані замовлення</h1>
            <button onpointerup="createInternetOrderModal()">Створити</button>
        </div>
        <div class="completed-order-table">
            <table>
                <tr>
                    <td>№</td>
                    <td>Дата</td>
                    <td>Замовник</td>
                    <td>Тип</td>
                    <td>Статус</td>
                    <td>Мітки</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    pendingorder: `
        <div class="order-header">
            <h1>Замовлення в очікуванні</h1>
            <button onpointerup="createInternetOrderModal()">Створити</button>
        </div>
        <div class="pending-order-table">
            <table>
                <tr>
                    <td>№</td>
                    <td>Дата</td>
                    <td>Замовник</td>
                    <td>Тип</td>
                    <td>Статус</td>
                    <td>Мітки</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    flavor: `
        <div class="flavor-header">
            <h1>Букети та композиції</h1>
            <button onpointerup="createFlavorModal()">Створити</button>
        </div>
        <div class="flavor-table">
            <table>
                <tr>
                    <td>Назва</td>
                    <td>Склад букету</td>
                    <td>Ціна</td>
                    <td>Склад</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    storeexpense: `
        <div class="store-expense-header">
            <h1>Витрати магазину</h1>
            <button onpointerup="createStoreExpenseModal()">Створити</button>
        </div>
        <div class="store-expense-table">
            <table>
                <tr>
                    <td>Дата</td>
                    <td>Склад</td>
                    <td>Сума</td>
                    <td>Коментар</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
    label: `
        <div class="label-header">
            <h1>Мітки</h1>
            <button onpointerup="createLabelModal()">Створити</button>
        </div>
        <div class="label-table">
            <table>
                <tr>
                    <td>Назва</td>
                    <td>Дії</td>
                </tr>
            </table>
        </div>
    `,
}

const fillSelectedMenuItem = e => {
    document.querySelector('header').style.display = ''
    document.querySelector('main').style.padding = '0 1.5rem 0 2.5rem'

    document.querySelectorAll('.main-menu span:last-child').forEach(i => i.style.display = '')
    document.querySelectorAll('.menu-item').forEach(i => i.style.width = '')
    document.querySelector('.main-menu').style.padding = '1.3rem .9rem'
    document.querySelectorAll('.sub-menu li').forEach(i => {
        i.style.marginLeft = '2rem'
        i.style.color = ''
        i.querySelector('div').style.justifyContent = ''
        i.querySelector('div span').style.fontWeight = ''
    })

    document.querySelectorAll('.sub-menu div, li div').forEach(m => m.style.background = '')
    const selectedMenuItemColor = 'rgba(79, 118, 181, .15)'

    for (const mainMenuItem of document.querySelectorAll('li')) {
        if (mainMenuItem.contains(e.target)) {
            mainMenuItem.querySelector('div').style.background = selectedMenuItemColor
            break
        }
    }

    let menuItem = e.target.parentNode

    if (menuItem.onpointerup) {
        menuItem = menuItem.querySelector('div')
    }

    if (menuItem.className !== 'menu-item-content') {
        menuItem.style.background = selectedMenuItemColor
    }
}

const formatPhoneNumber = phone => phone?.length === 10 ?
    `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6, 8)}-${phone.substring(8)}` :
    phone

const padTime = time => time.toString().padStart(2, '0')

const getDate = date => {
    date = new Date(date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

const formatDate = (date, includeTime = true) => {
    if (!date) {
        return ''
    }

    date = new Date(date)
    const formattedDate = date.toLocaleDateString('ru')
    return includeTime ? `${formattedDate}, ${padTime(date.getHours())}:${padTime(date.getMinutes())}` : formattedDate
}

const handlePriceInput = e => {
    if (!(e.keyCode === 8 || e.keyCode === 46 || e.charCode >= 48 && e.charCode <= 57)) {
        e.preventDefault()
    }
}

document.querySelectorAll('.close-modal').forEach(b => b.onpointerup = () => {
    for (const modal of [
        stockModal,
        cashRegisterModal,
        employeeModal,
        categoryModal,
        productModal,
        contractorModal,
        supplyModal,
        inventoryModal,
        clientModal,
        wasteModal,
        saleOrderModal,
        internetOrderModal,
        flavorModal,
        storeExpenseModal,
        labelModal
    ]) {
        if (modal) {
            modal.style.display = ''
        }
    }
})

window.onpointerup = e => {
    for (const modal of [
        productInfoModal,
        contractorInfoModal,
        supplyInfoModal,
        inventoryInfoModal,
        clientInfoModal,
        wasteInfoModal,
        saleModal,
        cashRegisterOperationsModal,
        shiftInfoModal,
        orderInfoModal,
        flavorInfoModal,
        flavorTemplatesModal,
        employeeInfoModal
    ]) {
        if (e.target === modal) {
            modal.style.display = ''
        }
    }
}

const getInitials = fullName => {
    const words = fullName.split(' ')
    let initials = words[0][0].toUpperCase()
    return words.length > 1 ? initials + words[1][0].toUpperCase() : initials
}

let loginInfo = JSON.parse(localStorage.getItem('login-info'))
const loginModal = document.querySelector('.login-modal')

const employeeTitleToName = {
    0: 'Директор',
    1: 'Адміністратор',
    2: 'Флорист',
    3: 'Менеджер'
}

const removeMenus = title => {
    if (title > 1) {
        const mainMenuItems = document.querySelectorAll('li')

        for (const menu of [
            'Торгові точки',
            'Постачальники',
            'Поставки',
            'Інвентаризація',
            'Витрати магазину',
            'Мітки'
        ]) {
            for (const mainMenuItem of mainMenuItems) {
                if (mainMenuItem.querySelector('span:last-child').textContent === menu) {
                    mainMenuItem.remove()
                    break
                }
            }
        }

        document.querySelector('.subscription').style.display = 'none'
    }
}

const getDayWord = d => {
    if (d === 21 || d === 1) {
        return 'день'
    }

    if (d === 24 || d === 23 || d === 22 || d === 4 || d === 3 || d === 2) {
        return 'дні'
    }

    return 'днів'
}

const getSubscriptionExpiresText = date => {
    const daysLeft = 30 - Math.floor((new Date() - date) / (1000 * 60 * 60 * 24))
    return daysLeft > 0 ? `${daysLeft} ${getDayWord(daysLeft)}` : 'ОПЛАТІТЬ ПІДПИСКУ'
}

if (loginInfo) {
    get(`Company/start-subscription/${loginInfo.companyId}`).then(response => {
        loginInfo.startSubscription = response

        document.querySelector('.profile').textContent = getInitials(loginInfo.fullName)
        document.querySelector('.profile-info div span:last-child').textContent = loginInfo.fullName + ' — ' + employeeTitleToName[loginInfo.title]
        document.querySelector('.subscription-text span:last-child').textContent = getSubscriptionExpiresText(new Date(loginInfo.startSubscription))
        removeMenus(loginInfo.title)
    })//.catch(() => showMessage('error', getErrorMessage('підписку')))
} else {
    loginModal.style.display = 'flex'
}

const login = () => {
    const email = loginModal.querySelector('input[type=email]').value
    const password = loginModal.querySelector('input[type=password]').value
    const companyUser = { email, password }

    post('Company/login', companyUser).then(response => {
        const loggedUser = {
            companyId: response.companyId,
            employeeId: response.employeeId,
            title: response.title,
            fullName: response.fullName,
            startSubscription: new Date(response.startSubscription)
        }

        localStorage.setItem('login-info', JSON.stringify(loggedUser))
        loginInfo = loggedUser

        loginModal.style.display = ''
        showMessage('success', 'Ви увійшли в систему')

        removeMenus(loggedUser.title)
        document.querySelector('.profile').textContent = getInitials(loggedUser.fullName)
        document.querySelector('.profile-info div span:last-child').textContent = loggedUser.fullName + ' — ' + employeeTitleToName[loggedUser.title]
        document.querySelector('.subscription-text span:last-child').textContent = getSubscriptionExpiresText(loggedUser.startSubscription)
    }).catch(() => showMessage('error', 'Невірний логін або пароль'))
}

const profileInfo = document.querySelector('.profile-info')
const openProfile = () => profileInfo.style.display = profileInfo.style.display === 'flex' ? '' : 'flex'

const logout = () => {
    if (confirm('Ви дійсно бажаєте вийти з системи?')) {
        localStorage.setItem('login-info', null)
        location.reload()
    }
}

const keepDatalistOptions = selector => {
    const options = [...document.querySelectorAll(`#${selector} option`)].map(o => ({
        id: +o.dataset.id,
        value: o.value
    }))

    for (const input of document.querySelectorAll(`input[list=${selector}]`)) {
        input.onfocus = e => {
            e.target.placeholder = e.target.value
            e.target.value = ''
        }
    
        input.onblur = e => {
            if (!options.some(o => o.value === e.target.value)) {
                e.target.value = e.target.placeholder
                return
            }
            
            e.target.placeholder = e.target.value
        }
    
        input.onchange = e => {
            const option = options.find(o => o.value === e.target.value)
    
            if (option) {
                e.target.dataset.id = option.id
            }
    
            e.target.blur()
        }
    }
}
