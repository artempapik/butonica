const Environment = {
    DEV: 'https://localhost:7099',
    PROD: 'https://botanice.user30503.realhost-free.net'
}

const BASE_URL = Environment.PROD
const EMPTY_IMAGE_URL = 'img/empty-flower.webp'

let imageData, currentPage, dayValue, monthIndex, yearValue, dateString = 'виберіть дату', dateQueryString

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

const header = document.querySelector('header')

header.onpointerup = e => {
    if (e.target === header && !document.querySelector('#screensaver')) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

const showMessage = (type, text) => {
    const typeToColor = {
        error: ['rgba(220, 20, 60, .9)', 'rgb(250, 250, 250)'],
        info : ['rgb(0, 71, 171)', 'rgb(240, 240, 240)'],
        success: ['rgb(46, 139, 87)', 'rgb(245, 245, 245)']
    }

    const message = document.querySelector('#message')
    message.style.display = 'block'

    text = text.split('\n')
    message.querySelector('div').textContent = text[0]

    if (text.length !== 1) {
        message.querySelector('div:last-child').textContent = text[1]
    }

    const colors = typeToColor[type]
    message.style.background = colors[0]
    message.style.color = colors[1]

    const animationTime = 400
    const delayTime = 2500
    const disappearTime = animationTime + delayTime - 50

    setTimeout(() => {
        message.animate([
            { top: '3%', opacity: '1' },
            { top: '0', opacity: '0' }
        ], animationTime)
    }, delayTime)

    setTimeout(() => {
        message.style.display = ''
        message.querySelectorAll('div').forEach(m => m.textContent = '')
    }, disappearTime)
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

const showLoadAnimation = () => {
    if (document.querySelector('.header-items #loader')) {
        return
    }

    const div = document.createElement('div')
    div.id = 'loader'
    document.querySelector('.header-items').insertAdjacentElement('afterbegin', div)
    document.querySelector('.header-items span').style.display = ''
}

const replaceLoadIcons = () => {
    document.querySelector('.header-items #loader')?.remove()
    document.querySelector('.header-items span').style.display = 'block'
}

const createTd = value => {
    const td = document.createElement('td')

    if (value instanceof HTMLElement) {
        td.append(value)
    } else {
        td.textContent = value
    }

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
    }
    
    if (number < 0) {
        return 'negative-left'
    }

    return 'zero-left'
}

const createEmptyDataDiv = () => {
    const emptyImage = document.createElement('img')
    emptyImage.src = 'img/empty-box.webp'

    const noDataSpan = document.createElement('span')
    noDataSpan.textContent = 'Даних немає'

    const emptyDataDiv = document.createElement('div')
    emptyDataDiv.classList = 'table-no-data'
    emptyDataDiv.append(emptyImage, noDataSpan)
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
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">info</span>
                <h1>Деталі компанії</h1>
            </div>
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
                            <span class="material-symbols-outlined" onpointerup="copyToClipboard('company-name')">content_copy</span>
                        </h2>
                        <input class="company-name" maxlength="30">
                    </div>
                    <div class="form">
                        <h2>
                            <span>Контактні дані</span>
                            <span class="material-symbols-outlined" onpointerup="copyToClipboard('company-contact-info')">content_copy</span>
                        </h2>
                        <textarea class="company-contact-info" maxlength="100" rows="3"></textarea>
                    </div>
                </div>
            </div>
            <button class="save" type="button" onpointerup="updateCompanyInfo()">
                <div class="loader-button"></div>
                <span>Зберегти</span>
            </button>
        </div>
    `,
    stock: `
        <div class="stock-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">storefront</span>
                <h1>Торгові точки</h1>
            </div>
            <button onpointerup="createStockModal()">Створити</button>
        </div>
        <div class="stock-table">
            <table>
                <tr>
                    <td>Назва</td>
                    <td>Адреса</td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    cashregister: `
        <div class="cash-register-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">account_tree</span>
                <h1>Каси</h1>
            </div>
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
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    employee: `
        <div class="employee-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">person_apron</span>
                <h1>Працівники</h1>
            </div>
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
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    category: `
        <div class="category-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">list</span>
                <h1>Категорії</h1>
            </div>
            <button onpointerup="createCategoryModal()">Створити</button>
        </div>
        <input type="search" oninput="searchCategory()" class="search-category" placeholder="Пошук категорії">
        <div class="category-table">
            <table>
                <tr>
                    <td onpointerup="sortCategories()">
                        <span>Назва</span>
                        <span class="material-symbols-outlined">unfold_more</span>
                    </td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    product: `
        <div class="product-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">filter_vintage</span>
                <h1>Товари</h1>
            </div>
            <button onpointerup="createProductModal()">Створити</button>
        </div>
        <input type="search" oninput="searchProduct()" class="search-product" placeholder="Пошук товару">
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
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    contractor: `
        <div class="contractor-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">group_add</span>
                <h1>Постачальники</h1>
            </div>
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
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    supply: `
        <div class="supply-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">local_shipping</span>
                <div class="supplies-date-filter">
                    <h1>Поставки</h1>
                    <div class="supply-view-type">
                        <div class="type active">
                            <img src="img/calendar.png">
                            <span>за місяць</span>
                        </div>
                        <div class="type">
                            <img src="img/period.png">
                            <span>за період</span>
                        </div>
                    </div>
                    <div class="month-filter">
                        <select onchange="getSupplies(event.target.selectedIndex)">
                            <option>поточний місяць</option>
                            <option>січень</option>
                            <option>лютий</option>
                            <option>березень</option>
                            <option>квітень</option>
                            <option>травень</option>
                            <option>червень</option>
                            <option>липень</option>
                            <option>серпень</option>
                            <option>вересень</option>
                            <option>жовтень</option>
                            <option>листопад</option>
                            <option>грудень</option>
                        </select>
                    </div>
                    <div class="period-filter">
                        <div class="filters-block">
                            <div>
                                <span>з</span>
                                <input class="period-from" type="date">
                            </div>
                            <div>
                                <span>до</span>
                                <input class="period-to" type="date">
                            </div>
                        </div>
                        <button onpointerup="getSuppliesByPeriod()">ок</button>
                    </div>
                </div>
            </div>
            <button onpointerup="createSupplyModal()">Створити</button>
        </div>
        <div class="supply-table">
            <table>
                <tr>
                    <td>Дата</td>
                    <td>Постачальник</td>
                    <td>Склад</td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    leftover: `
        <div class="leftover-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">directory_sync</span>
                <h1>Залишки по складах</h1>
            </div>
        </div>
        <input type="search" oninput="searchLeftover()" class="search-leftover" placeholder="Пошук товару">
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
                    <td>Склад</td>
                    <td onpointerup="sortLeftoverByAmount()">
                        <span>Кількість</span>
                        <span class="material-symbols-outlined">unfold_more</span>
                    </td>
                    <td>Ціна закупівлі</td>
                    <td>Використано</td>
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
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">edit_calendar</span>
                <div class="inventory-date-filter">
                    <h1>Інвентаризація</h1>
                    <div class="month-filter">
                        <div>за:</div>
                        <select onchange="getInventories(event.target.selectedIndex)">
                            <option>поточний місяць</option>
                            <option>січень</option>
                            <option>лютий</option>
                            <option>березень</option>
                            <option>квітень</option>
                            <option>травень</option>
                            <option>червень</option>
                            <option>липень</option>
                            <option>серпень</option>
                            <option>вересень</option>
                            <option>жовтень</option>
                            <option>листопад</option>
                            <option>грудень</option>
                        </select>
                    </div>
                </div>
            </div>
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
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    sale: `
        <div class="sale-header">
            <h1>Продаж</h1>
            <input type="search" class="search-sale-product" oninput="searchSaleProductFlavor(event)" placeholder="Пошук товару або букету">
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
                        <div class="add-client">
                            <span class="material-symbols-outlined" onpointerup="createClientModal(false)">add_circle</span>
                            <span>Клієнт:</span>
                        </div>
                        <div class="select-client">
                            <select></select>
                            <input oninput="searchClientByPhone()" class="search-checkout-client" placeholder="Телефон" maxlength="13">
                        </div>
                        <span class="material-symbols-outlined clear-client">cancel</span>
                    </div>
                    <div class="sale-payment" onpointerup="createSaleModal()">Оплата</div>
                </div>
            </div>
        </div>
    `,
    client: `
        <div class="client-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">person_add</span>
                <h1>Клієнти</h1>
            </div>
            <button onpointerup="createClientModal()">Створити</button>
        </div>
        <div class="client-bonus">
            <span>Відсоток бонусів:</span>
            <div>
                <input type="number" min="0" max="100" oninput="handlePriceInput(event)">
                <span>%</span>
            </div>
            <button type="button">
                <div class="loader-button"></div>
                <span onpointerup="setClientDiscount()">Обрати</span>
            </button>
        </div>
        <div class="client-table">
            <table>
                <tr>
                    <td>ПІБ</td>
                    <td>Email</td>
                    <td>Телефон(и)</td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    waste: `
        <div class="waste-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">delete</span>
                <div class="wastes-date-filter">
                    <h1>Списання</h1>
                    <div class="month-filter">
                        <div>за:</div>
                        <select onchange="getWastes(event.target.selectedIndex)">
                            <option>поточний місяць</option>
                            <option>січень</option>
                            <option>лютий</option>
                            <option>березень</option>
                            <option>квітень</option>
                            <option>травень</option>
                            <option>червень</option>
                            <option>липень</option>
                            <option>серпень</option>
                            <option>вересень</option>
                            <option>жовтень</option>
                            <option>листопад</option>
                            <option>грудень</option>
                        </select>
                    </div>
                </div>
            </div>
            <button onpointerup="createWasteModal()">Створити</button>
        </div>
        <div class="waste-table">
            <table>
                <tr>
                    <td>Дата</td>
                    <td>Склад</td>
                    <td>Хто списав</td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    shift: `
        <div class="shift-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">fact_check</span>
                <div class="shifts-date-filter">
                    <h1>Робочі зміни</h1>
                    <div class="month-filter">
                        <div>за:</div>
                        <select onchange="getShifts(event.target.selectedIndex)">
                            <option>поточний місяць</option>
                            <option>січень</option>
                            <option>лютий</option>
                            <option>березень</option>
                            <option>квітень</option>
                            <option>травень</option>
                            <option>червень</option>
                            <option>липень</option>
                            <option>серпень</option>
                            <option>вересень</option>
                            <option>жовтень</option>
                            <option>листопад</option>
                            <option>грудень</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="shift-table">
            <table>
                <tr>
                    <td>Каса</td>
                    <td>Працівник</td>
                    <td>Відкриття</td>
                    <td>Закриття</td>
                    <td>Виручка</td>
                    <td>Статус</td>
                </tr>
            </table>
        </div>
    `,
    allorder: `
        <div class="order-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">list_alt</span>
                <h1>Всі замовлення</h1>
                <div class="calendar-component">
                <div>виберіть дату</div>
                <div class="calendar-icons">
                    <img src="img/refresh.png">
                    <img src="img/calendar.png">
                </div>
            </div>
                <div class="change-page">
                    <div class="arrows">
                        <span class="arrow-group">
                            <span class="material-symbols-outlined first-last-page" onpointerup="firstAllOrderPage(event)">first_page</span>
                            <span class="material-symbols-outlined last-page" onpointerup="previousAllOrderPage(event)">arrow_circle_left</span>
                        </span>
                        <span class="arrow-group">
                            <span class="material-symbols-outlined" onpointerup="nextAllOrderPage(event)">arrow_circle_right</span>
                            <span class="material-symbols-outlined first-last-page" onpointerup="lastAllOrderPage(event)">last_page</span>
                        </span>
                    </div>
                    <div class="page-number">
                        <span>сторінка</span>
                        <span>1</span>
                        <span></span>
                    </div>
                </div>
            </div>
            <button onpointerup="createInternetOrderModal()">Створити</button>
        </div>
        <div class="all-order-table">
            <table>
                <tr>
                    <td>№</td>
                    <td>
                        <img src="img/time_left.png">
                    </td>
                    <td>Дата</td>
                    <td>Замовник</td>
                    <td>Тип</td>
                    <td>Статус</td>
                    <td>Мітки</td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    pendingorder: `
        <div class="order-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">hourglass_empty</span>
                <h1>Замовлення в очікуванні</h1>
                <input type="date" onchange="getPendingOrdersByDate(event)">
            </div>
            <button onpointerup="createInternetOrderModal()">Створити</button>
        </div>
        <div class="pending-order-table">
            <table>
                <tr>
                    <td>№</td>
                    <td>
                        <img src="img/time_left.png">
                    </td>
                    <td>Дата</td>
                    <td>Замовник</td>
                    <td>Тип</td>
                    <td>Статус</td>
                    <td>Мітки</td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    completedorder: `
        <div class="order-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">done</span>
                <h1>Виконані замовлення</h1>
                <div class="change-page">
                    <div class="arrows">
                        <span class="arrow-group">
                            <span class="material-symbols-outlined first-last-page" onpointerup="firstCompletedOrderPage(event)">first_page</span>
                            <span class="material-symbols-outlined last-page" onpointerup="previousCompletedOrderPage(event)">arrow_circle_left</span>
                        </span>
                        <span class="arrow-group">
                            <span class="material-symbols-outlined" onpointerup="nextCompletedOrderPage(event)">arrow_circle_right</span>
                            <span class="material-symbols-outlined first-last-page" onpointerup="lastCompletedOrderPage(event)">last_page</span>
                        </span>
                    </div>
                    <div class="page-number">
                        <span>сторінка</span>
                        <span>1</span>
                        <span></span>
                    </div>
                </div>
            </div>
            <button onpointerup="createInternetOrderModal()">Створити</button>
        </div>
        <div class="completed-order-table">
            <table>
                <tr>
                    <td>№</td>
                    <td>
                        <span class="material-symbols-outlined">history_toggle_off</span>
                    </td>
                    <td>Дата</td>
                    <td>Замовник</td>
                    <td>Тип</td>
                    <td>Статус</td>
                    <td>Мітки</td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    flavor: `
        <div class="flavor-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">local_florist</span>
                <h1>Букети та композиції</h1>
            </div>
            <button onpointerup="createFlavorModal()">Створити</button>
        </div>
        <div class="flavor-table">
            <table>
                <tr>
                    <td>Назва</td>
                    <td>Склад букету</td>
                    <td>Ціна</td>
                    <td>Склад</td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    storeexpense: `
        <div class="store-expense-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">receipt_long</span>
                <div class="store-expenses-date-filter">
                    <h1>Витрати магазину</h1>
                    <div class="month-filter">
                        <div>за:</div>
                        <select onchange="getStoreExpenses(event.target.selectedIndex)">
                            <option>поточний місяць</option>
                            <option>січень</option>
                            <option>лютий</option>
                            <option>березень</option>
                            <option>квітень</option>
                            <option>травень</option>
                            <option>червень</option>
                            <option>липень</option>
                            <option>серпень</option>
                            <option>вересень</option>
                            <option>жовтень</option>
                            <option>листопад</option>
                            <option>грудень</option>
                        </select>
                    </div>
                </div>
            </div>
            <button onpointerup="createStoreExpenseModal()">Створити</button>
        </div>
        <div class="store-expense-table">
            <table>
                <tr>
                    <td>Дата</td>
                    <td>Склад</td>
                    <td>Сума</td>
                    <td>Коментар</td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    label: `
        <div class="label-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">label</span>
                <h1>Мітки</h1>
            </div>
            <button onpointerup="createLabelModal()">Створити</button>
        </div>
        <div class="label-table">
            <table>
                <tr>
                    <td>Назва</td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    generalstatistics: `
        <div class="general-statistics-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">show_chart</span>
                <div class="statistics-date-filter">
                    <h1>Загальна статистика</h1>
                    <div class="month-filter">
                        <div>за:</div>
                        <select onchange="getStatisticsValues()">
                            <option>поточний місяць</option>
                            <option>всі місяці</option>
                            <option>січень</option>
                            <option>лютий</option>
                            <option>березень</option>
                            <option>квітень</option>
                            <option>травень</option>
                            <option>червень</option>
                            <option>липень</option>
                            <option>серпень</option>
                            <option>вересень</option>
                            <option>жовтень</option>
                            <option>листопад</option>
                            <option>грудень</option>
                        </select>
                        <div class="year-filter">
                            <select onchange="getStatisticsValues()">
                                <option>2024</option>
                                <option>2023</option>
                            </select>
                            <div>року</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ul class="general-statistics-info">
            <li>
                <span class="stat-title gain">Прибуток:</span>
                <span class="stat-value gain">
                    <span></span>
                    <span>грн</span>
                </span>
            </li>
            <li>
                <ul>
                    <li>
                        <span class="stat-title">Дохід від продаж:</span>
                        <span class="stat-value">
                            <span></span>
                            <span>грн</span>
                        </span>
                    </li>
                    <li class="sub-value">
                        <span class="stat-title">продажі:</span>
                        <span class="stat-value">
                            <span></span>
                        </span>
                    </li>
                    <li class="sub-value">
                        <span class="stat-title">інтернет-замовлення:</span>
                        <span class="stat-value">
                            <span></span>
                        </span>
                    </li>
                </ul>
            </li>
            <li>
                <span class="stat-title">Витрати магазину:</span>
                <span class="stat-value">
                    <span></span>
                    <span>грн</span>
                </span>
            </li>
            <li>
                <span class="stat-title">Витрати на товар:</span>
                <span class="stat-value">
                    <span></span>
                    <span>грн</span>
                </span>
            </li>
        </ul>
        <div class="pie-charts">
            <canvas id="income-by-label-pie-chart"></canvas>
            <canvas id="income-pie-chart"></canvas>
            <canvas id="expenses-pie-chart"></canvas>
            <canvas id="expenses-income-pie-chart"></canvas>
        </div>
        <div class="bar-charts">
            <div>
                <canvas id="year-gain-bar-chart"></canvas>
            </div>
            <div>
                <canvas id="year-income-expense-bar-chart"></canvas>
            </div>
            <div>
                <canvas id="year-profitability-line-chart"></canvas>
            </div>
        </div>
    `
}

const copyToClipboard = className => {
    navigator.clipboard.writeText(document.querySelector('.' + className).value)
    showMessage('info', 'Скопійовано')
}

const menuButton = document.querySelector('.logo-panel span')
const menu = document.querySelector('aside')

const pressMenuButton = display => {
    hideBodyOverflow()
    menu.style.display = display
}

menuButton.onpointerup = () => menu.style.display ? pressMenuButton('') : pressMenuButton('flex')

const fillSelectedMenuItem = e => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    currentPage = 1
    dayValue = null
    monthIndex = null
    yearValue = null
    dateString = 'виберіть дату'
    setTimeout(() => hideModal(menu), 1)

    header.style.display = ''
    main.style.background = 'unset'
    main.classList.remove('sale-padding')

    document.querySelectorAll('.main-menu span:last-child').forEach(i => i.style.display = '')
    document.querySelectorAll('.menu-item').forEach(i => i.style.width = '')
    document.querySelector('.main-menu').classList.remove('sale-padding')
    document.querySelectorAll('.sub-menu li').forEach(i => {
        i.classList.remove('sale-padding')
        i.style.color = ''
        i.querySelector('div').style.justifyContent = ''
        i.querySelector('div span').style.fontWeight = ''
    })

    document.querySelectorAll('.sub-menu div, li div').forEach(m => {
        m.style.background = ''
        m.style.boxShadow = ''
    })

    const selectedMenuItemColor = 'rgba(79, 118, 181, .15)'
    const selectedMenuItemBoxShadow = 'rgba(0, 0, 0, .16) 0 1px 4px'

    for (const mainMenuItem of document.querySelectorAll('li')) {
        if (mainMenuItem.contains(e.target)) {
            mainMenuItem.querySelector('div').style.background = selectedMenuItemColor
            mainMenuItem.querySelector('div').style.boxShadow = selectedMenuItemBoxShadow
            break
        }
    }

    let menuItem = e.target.parentNode

    if (menuItem.onpointerup) {
        menuItem = menuItem.querySelector('div')
    }

    if (menuItem.className !== 'menu-item-content') {
        menuItem.style.background = selectedMenuItemColor
        menuItem.style.boxShadow = selectedMenuItemBoxShadow
    }
}

const showHideNodeInfo = (modal, className, value) => {
    const node = modal.querySelector('.' + className)

    if (!value) {
        node.parentNode.style.display = 'none'
        return
    }

    node.parentNode.style.display = ''
    node.textContent = value
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

const numberToMonth = {
    1: 'січня',
    2: 'лютого',
    3: 'березня',
    4: 'квітня',
    5: 'травня',
    6: 'червня',
    7: 'липня',
    8: 'серпня',
    9: 'вересня',
    10: 'жовтня',
    11: 'листопада',
    12: 'грудня'
}

const formatDate = (date, includeTime = true, includeYear = true) => {
    if (!date) {
        return ''
    }

    date = new Date(date)
    const formattedDate = date.toLocaleDateString('ru')

    if (includeTime) {
        return `${formattedDate}, ${padTime(date.getHours())}:${padTime(date.getMinutes())}`
    }

    if (includeYear) {
        return formattedDate
    }

    return `${+formattedDate.substring(0, 2)} ${numberToMonth[+formattedDate.substring(3, 5)]}`
}

const handlePriceInput = e => {
    if (!(e.keyCode === 8 || e.keyCode === 46 || e.charCode >= 48 && e.charCode <= 57)) {
        e.preventDefault()
    }
}

const hideBodyOverflow = () => document.body.style.overflow = 'hidden'

const hideModal = modal => {
    modal.style.display = ''

    if (!intervalId) {
        document.body.style.overflow = ''
    }
}

const hideModalEnableButton = (modal, button) => {
    hideModal(modal)
    button.disabled = false
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
            setTimeout(() => hideModal(modal), 1)
        }
    }
})

window.onpointerup = e => {
    for (const modal of [
        menu,
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
        employeeInfoModal,
        notesModal,
        calendarModal,
        changelogModal
    ]) {
        if (e.target === modal) {
            setTimeout(() => hideModal(modal), 1)

            if (e.target === calendarModal) {
                setDefaultDateSelects(monthIndex, yearValue)
                fillCalendarDays()

                if (dayValue) {
                    for (const calendarDay of calendarDays) {
                        if (calendarDay.textContent === dayValue) {
                            calendarDay.classList.add('active')
                            break
                        }
                    }
                }

                document.querySelector('.calendar-component div').textContent = dateString
                document.querySelector('.calendar-component').classList.remove('active')
            }
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
    const mainMenuItems = document.querySelectorAll('li')

    if (title > 1) {
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

    if (title) {
        for (const mainMenuItem of mainMenuItems) {
            if (mainMenuItem.querySelector('span:last-child').textContent === 'Статистика') {
                mainMenuItem.remove()
                break
            }
        }
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
    }).catch(() => showMessage('error', getErrorMessage('підписку')))
} else {
    loginModal.style.display = 'flex'
}

const login = () => {
    const payButton = loginModal.querySelector('button')
    payButton.disabled = true

    const email = loginModal.querySelector('input').value
    const password = loginModal.querySelector('input[type=password]').value
    const companyUser = { email, password }

    post('Company/login', companyUser).then(response => {
        hideModalEnableButton(loginModal, payButton)

        const loggedUser = {
            companyId: response.companyId,
            employeeId: response.employeeId,
            title: response.title,
            fullName: response.fullName,
            startSubscription: new Date(response.startSubscription)
        }

        localStorage.setItem('login-info', JSON.stringify(loggedUser))
        loginInfo = loggedUser

        showMessage('success', 'Ви увійшли в систему')

        removeMenus(loggedUser.title)
        document.querySelector('.profile').textContent = getInitials(loggedUser.fullName)
        document.querySelector('.profile-info div span:last-child').textContent = loggedUser.fullName + ' — ' + employeeTitleToName[loggedUser.title]
        document.querySelector('.subscription-text span:last-child').textContent = getSubscriptionExpiresText(loggedUser.startSubscription)
    }).catch(e => {
        payButton.disabled = false

        if (e.message === '403') {
            showMessage('error', 'Період підписки вичерпано.\nОплатіть підписку')
            return
        }

        showMessage('error', 'Невірний логін або пароль')
    })
}

const profileInfo = document.querySelector('.profile-info')
const openProfile = () => profileInfo.style.display = profileInfo.style.display === 'flex' ? '' : 'flex'

document.onscroll = () => profileInfo.style.display = ''
document.ondblclick = e => e.preventDefault()

document.onpointerdown = e => {
    if (e.button === 1) {
        e.preventDefault()
    }
}

const isMobile = 'ontouchstart' in window

document.onpointerup = e => {
    if (isMobile) {
        document.activeElement.blur()
    }

    if (e.target.classList.contains('profile')) {
        return
    }

    profileInfo.style.display = ''
}

const confirmModal = document.querySelector('.confirm-modal')
const confirmModalText = confirmModal.querySelector('.text')

const showConfirm = (text, f) => {
    hideBodyOverflow()
    confirmModalText.querySelectorAll('span').forEach(m => m.textContent = '')
    text = text.split('\n')
    confirmModalText.querySelector('span').textContent = text[0]

    if (text.length !== 1) {
        confirmModalText.querySelector('span:last-child').textContent = text[1]
    }

    confirmModal.querySelector('button').onpointerup = f
    confirmModal.style.display = 'flex'
}

const logout = () => showConfirm('Вийти з Butonica?', () => {
    localStorage.setItem('login-info', null)
    location.reload()
})

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

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const screensaverMarkup = `
    <div id="screensaver">
        <img src="img/parsley.png">
        <span class="logo-text">
            <span>Butonica</span>
            <span>Облік Вашого бізнесу</span>
        </span>
    </div>
`

let intervalId

const toggleScreensaver = () => {
    const screensaver = document.querySelector('#screensaver')
    const toggleScreensaverButton = document.querySelector('.profile-info div:nth-child(3)')
    const screensaverItems = [main, menu]

    if (screensaver) {
        clearInterval(intervalId)
        intervalId = null
        document.body.style.overflow = ''
        clocks[0].style.display = ''

        screensaverItems.forEach(i => {
            i.style.filter = ''
            i.style.pointerEvents = ''
            i.style.opacity = ''
        })

        screensaver.remove()
        toggleScreensaverButton.classList.remove('screensaver')
        return
    }

    hideBodyOverflow()

    const setTime = (c, d) => {
        c.querySelector('.hours').textContent = padTime(d.getHours())
        c.querySelector('.minutes').textContent = padTime(d.getMinutes())
        c.querySelector('.seconds').textContent = padTime(d.getSeconds())
    }

    intervalId = setInterval(() => {
        const date = new Date()
        clocks.forEach(clock => setTime(clock, date))
    }, 1000)

    setTime(clocks[0], new Date())
    clocks[0].style.display = 'flex'

    screensaverItems.forEach(i => {
        i.style.filter = 'grayscale()'
        i.style.pointerEvents = 'none'
        i.style.opacity = '.4'
    })

    const setDirection = () => {
        root.style.setProperty('--screensaver-delay', -(getRandom(1, 20) + getRandom(1, 10) / 10) + 's')
        root.style.setProperty('--screensaver-move-x', getRandom(6, 12) + getRandom(1, 10) / 10 + 's')
        root.style.setProperty('--screensaver-move-y', getRandom(8, 14) + getRandom(1, 10) / 10 + 's')
        root.style.setProperty('--box-shadow-delay', getRandom(5, 30) + 's')
    }

    const root = document.querySelector(':root')
    setDirection()

    toggleScreensaverButton.classList.add('screensaver')
    document.body.insertAdjacentHTML('beforeend', screensaverMarkup)
    document.querySelector('#screensaver').onpointerup = () => setDirection()
}

const notesModal = document.querySelector('.notes-modal')
const notes = JSON.parse(localStorage.getItem('notes')) || []

const getNoteMarkup = (text, author, index) => {
    const noteText = document.createElement('span')
    noteText.classList = 'text'
    noteText.textContent = text

    const noteAuthor = document.createElement('span')
    noteAuthor.classList = 'author'
    noteAuthor.textContent = author

    const noteSpan = document.createElement('span')
    noteSpan.classList = 'note'
    noteSpan.append(noteText, noteAuthor)

    const deleteIcon = createSpan('delete_forever')
    deleteIcon.classList = 'material-symbols-outlined'

    const li = document.createElement('li')
    li.append(noteSpan, deleteIcon)

    deleteIcon.onpointerup = () => {
        li.remove()
        notes.splice(index, 1)
        localStorage.setItem('notes', JSON.stringify(notes))
        showMessage('info', 'Замітку видалено')

        if (!notes.length) {
            createNote()
        }
    }

    return li
}

document.querySelector('.notes').onpointerup = () => {
    hideBodyOverflow()

    if (!notes.length) {
        notesModal.querySelector('textarea').value = ''
        notesModal.querySelector('li').style.display = 'flex'
        notesModal.style.display = 'flex'
        return
    }

    const ul = notesModal.querySelector('ul')
    const addNoteLi = document.createElement('li')
    addNoteLi.innerHTML = ul.querySelector('li').innerHTML
    ul.innerHTML = ''
    ul.append(addNoteLi)

    for (let i = 0; i < notes.length; i++) {
        ul.append(getNoteMarkup(notes[i].text, notes[i].author, i))
    }

    notesModal.style.display = 'flex'
    notesModal.querySelector('div').scroll(0, 0)
}

const createNote = () => {
    const addNote = notesModal.querySelector('li')

    if (addNote.style.display === 'flex') {
        saveNote()
        return
    }

    addNote.style.display = 'flex'
}

const saveNote = () => {
    const text = notesModal.querySelector('textarea').value.trim()

    if (!text) {
        showMessage('error', 'Текст замітки порожній')
        return
    }

    notesModal.querySelector('ul').append(getNoteMarkup(text, loginInfo.fullName, notes.length))
    notes.push({ text, author: loginInfo.fullName })
    localStorage.setItem('notes', JSON.stringify(notes))

    showMessage('success', 'Замітку збережено')
    notesModal.querySelector('li').style.display = ''
    notesModal.querySelector('textarea').value = ''
}

const loaderPage = document.querySelector('#loader-page')

const showPageLoad = () => loaderPage.style.display = 'flex'
const hidePageLoad = () => loaderPage.style.display = ''

const calendarModal = document.querySelector('.calendar-modal')
const calendar = calendarModal.querySelector('#calendar')
const calendarDays = calendar.querySelectorAll('.week-days span')

const setDefaultDateSelects = (monthIndex, yearValue) => {
    const date = new Date()
    monthSelect.selectedIndex = monthIndex || date.getMonth()
    yearSelect.value = yearValue || date.getFullYear()
}

const fillCalendarDays = () => {
    calendarDays.forEach(d => {
        d.classList = 'inactive'
        d.textContent = '–'
    })

    const startDay = new Date(+yearSelect.value, monthSelect.selectedIndex, 1).getDay() || 7
    const daysInMonth = new Date(+yearSelect.value, monthSelect.selectedIndex + 1, 0).getDate()

    for (let i = startDay - 1, day = 1; i < daysInMonth + startDay - 1; i++, day++) {
        calendarDays[i].classList = ''
        calendarDays[i].textContent = day
    }
}

const [monthSelect, yearSelect] = calendar.querySelectorAll('.month-year-select select')
setDefaultDateSelects()
fillCalendarDays()

monthSelect.onchange = () => {
    calendarDays.forEach(d => d.classList.remove('active'))
    const calendarText = document.querySelector('.calendar-component div')

    if (monthSelect.selectedIndex === 12) {
        calendar.querySelectorAll('.week-names, .week-days').forEach(e => e.classList.add('year-view'))
        calendarDays.forEach(d => d.classList.add('year-view'))
        calendarText.textContent = `за весь ${yearSelect.value} рік`
        return
    }

    calendar.querySelectorAll('.week-names, .week-days').forEach(e => e.classList.remove('year-view'))
    calendarDays.forEach(d => d.classList.remove('year-view'))
    calendarText.textContent = `${monthSelect.value} ${yearSelect.value}`
    fillCalendarDays()
}

yearSelect.onchange = () => {
    calendarDays.forEach(d => d.classList.remove('active'))
    const calendarText = document.querySelector('.calendar-component div')

    if (monthSelect.selectedIndex === 12) {
        calendarText.textContent = `за весь ${yearSelect.value} рік`
        return
    }

    calendarText.textContent = `${monthSelect.value} ${yearSelect.value}`
    fillCalendarDays()
}

const calendarMonthToText = {
    0: 'січня',
    1: 'лютого',
    2: 'березня',
    3: 'квітня',
    4: 'травня',
    5: 'червня',
    6: 'липня',
    7: 'серпня',
    8: 'вересня',
    9: 'жовтня',
    10: 'листопада',
    11: 'грудня'
}

calendarDays.forEach(d => d.onpointerup = () => {
    if (monthSelect.selectedIndex === 12 || d.classList.contains('inactive')) {
        return
    }

    const calendarText = document.querySelector('.calendar-component div')

    if (d.classList.contains('active')) {
        d.classList.remove('active')
        calendarText.textContent = `${monthSelect.value} ${yearSelect.value}`
        return
    }

    calendarDays.forEach(d => d.classList.remove('active'))
    d.classList = 'active'
    calendarText.textContent = `${d.textContent} ${calendarMonthToText[monthSelect.selectedIndex]}, ${yearSelect.value}`
})

const setToday = () => {
    setDefaultDateSelects()
    fillCalendarDays()
    const day = new Date().getDate().toString()

    for (const calendarDay of calendarDays) {
        if (calendarDay.textContent === day) {
            calendarDay.classList = 'active'
            document.querySelector('.calendar-component div').textContent = `${day} ${calendarMonthToText[monthSelect.selectedIndex]}, ${yearSelect.value}`
            break
        }
    }

    checkDate(getAllOrdersByDate)
}

const checkDate = f => {
    dateString = document.querySelector('.calendar-component div').textContent
    setTimeout(() => hideModal(calendarModal), 1)
    document.querySelector('.calendar-component').classList.remove('active')

    let day

    for (const calendarDay of calendarDays) {
        if (calendarDay.classList.contains('active')) {
            day = calendarDay.textContent
            break
        }
    }

    dayValue = day
    monthIndex = monthSelect.selectedIndex
    yearValue = yearSelect.value
    document.querySelector('.calendar-component img').classList.add('active')

    if (monthSelect.selectedIndex === 12) {
        dateQueryString = yearSelect.value
        f()
        return
    }

    if (dateString === 'виберіть дату') {
        const date = new Date()
        const newDateString = `${monthSelect.value} ${date.getFullYear()}`
        document.querySelector('.calendar-component div').textContent = newDateString
        dateString = newDateString
        dateQueryString = `${date.getMonth() + 1}/${date.getFullYear()}`
        f()
        return
    }

    dateQueryString = `${monthSelect.selectedIndex + 1}/${yearSelect.value}`

    if (day) {
        dateQueryString = `${day}/${dateQueryString}`
    }

    f()
}

const clocks = [...document.querySelectorAll('.clock-screensaver, .clock-modal')]
clocks[0].onpointerup = () => clocks[1].style.display = 'flex'

clocks[1].onpointerup = () => {
    clocks[1].animate([
        { opacity: '1', height: '100%' },
        { opacity: '0', height: '0' }
    ], 700)

    setTimeout(() => clocks[1].style.display = '', 690)
}

const changelogModal = document.querySelector('.changelog-modal')

const CHANGELOG_TYPES = {
    success: 'success',
    fire: 'fire',
    exclamation: 'exclamation',
    bug: 'bug'
}

const changelogs = [
    {
        v: '1.7',
        date: '08.02.24',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'новий розділ – «Changelog», у якому зібрана вся інформація про останні оновлення сервісу'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'тепер завантаження сервісу супроводжується анімацією'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'Butonica наразі визначає, чи є доступ до інтернету, і виводить спеціальне вікно, якщо доступ зник'
            },
            {
                text: 'тепер поставка у постачальника має незалежний скрол – решта інформації залишається статичною'
            },
            {
                text: 'робити інвентаризацію стало зручніше з усіх пристроїв'
            },
            {
                text: 'іконка часу у «виконаних замовленнях» тепер не відображається'
            }
        ]
    },
    {
        v: '1.6.5',
        date: '02.02.24',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: "у «робочих змінах» з'явилася фільтрація за типом операції та іконка годинника біля часу відкриття зміни"
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'тепер продажі можна проводити в мінус товару'
            }
        ]
    },
    {
        v: '1.6.4',
        date: '28.01.24',
        changes: [
            {
                type: CHANGELOG_TYPES.bug,
                text: 'фікс багу у меню продаж, який виникав при відкритті зміни'
            },
            {
                type: CHANGELOG_TYPES.bug,
                text: 'фікс помилки із некоректним розміром годинника в режимі очікування'
            },
            {
                type: CHANGELOG_TYPES.bug,
                text: 'фікс помилки з надто великим календарем у мобільному режимі'
            }
        ]
    },
    {
        v: '1.6.3',
        date: '26.01.24',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: "«режим очікування» отримав оновлення: з'явився годинник із можливістю розгортання на весь екран; при активації режиму вся сторінка стає сірою та неактивною – запобігання випадкових натискань"
            },
            {
                text: "якщо в замовлені ім'я отримувача не було введено, тепер під його іменем буде напис «Не вказано»"
            },
            {
                text: 'логотип сайту отримав нову анімацію при наведенні'
            }
        ]
    },
    {
        v: '1.6.2',
        date: '20.01.24',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'нове уніфіковане меню при видаленні елементів сайту, виході з системи та доплаті замовлень'
            },
            {
                type: CHANGELOG_TYPES.bug,
                text: 'фікс невеликих помилок із календарем, витратами магазину та статистики в мобільному режимі'
            },
            {
                text: 'календар тепер має кнопку, яка дозволяє швидко скидувати введену дату'
            }
        ]
    },
    {
        v: '1.6.1',
        date: '14.01.24',
        changes: [
            {
                text: 'тепер система забороняє створювати 2 однакові категорії або товара'
            },
            {
                text: 'мінорний редизайн іконок'
            }
        ]
    },
    {
        v: '1.6',
        date: '10.01.24',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'новий компонент «календар» (поки працює в тестовому режимі). Дозволяє переглядати замовлення за днем, місяцев або роком'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: 'тепер залишки відображають кількість квітів, яку використано в букетах'
            },
            {
                type: CHANGELOG_TYPES.bug,
                text: 'фікс багу із входом у систему з довільним регістром'
            }
        ]
    },
    {
        v: '1.5.2',
        date: '04.01.24',
        changes: [
            {
                type: CHANGELOG_TYPES.bug,
                text: 'фікс багу, коли інколи при створенні товару виникало дублювання складів'
            },
            {
                type: CHANGELOG_TYPES.bug,
                text: 'фікс багу, коли анімація очікування після кліку на кнопку «Зберегти» не зникала'
            },
            {
                text: 'тепер, якщо період підписки закінчився, система дає ще 3 дні на оплату, після чого вхід блокується'
            }
        ]
    },
    {
        v: '1.5.1',
        date: '29.12.23',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'зміна кольорової гами графіків для відповідання стилістиці бутоніки; зміна шрифтів, додавання тіней та підписи під необхідні типи графіків'
            }
        ]
    },
    {
        v: '1.5',
        date: '25.12.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'редизайн «загальної статистики»; поява річної статистики та графіків доходів, витрат і прибутків'
            }
        ]
    },
    {
        v: '1.4',
        date: '19.12.23',
        changes: [
            {
                type: CHANGELOG_TYPES.success,
                text: 'новий розділ сайту – «Загальна статистика»'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: "у шапці сайту з'явилися замітки із можливістю швидко зберігати, переглядати та видаляти ваші замітки"
            }
        ]
    },
    {
        v: '1.3.4',
        date: '11.12.23',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'можливість перегляду поставок за періодом'
            },
            {
                text: 'зміна шрифту для деяких числових значень на більш підходящий'
            }
        ]
    },
    {
        v: '1.3.3',
        date: '07.12.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'у телефонному режимі тепер відображається кнопка, яка відкриває повноцінне меню, замість маленьких кнопок раніше'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'натиснення на будь-який елемент, що відкривається у спливаючому вікні, тепер показує анімацію свого завантаження'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'день народження клієнтів тепер відображається у зручнішому форматі («10 вересня» замість «10.09.1998»)'
            }
        ]
    },
    {
        v: '1.3.2',
        date: '03.12.23',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'собівартість букету тепер приховується для флористів'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'тепер шапка сайту стала фіксованю при скролі та клікабельною – при кліку сторінка прогортується нагору'
            },
            {
                text: 'галочки «активних» та «неактивних» працівників отримали редизайн'
            }
        ]
    },
    {
        v: '1.3.1',
        date: '30.11.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'тепер кожне натиснення на кнопку «Зберегти» блокує її та показує анімацію збереження – це виключає помилки із повторним натисненням та подвійним збереженням'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'можливість посторінкового гортання «всіх» та «виконаних» замовлень – відображається 50 останніх замовлень на сторінці'
            },
            {
                text: 'впроваджено декілька анімацій (натиснення на профіль, відкритті підпунктів меню, на спливаючих вікнах та робочих змінах)'
            },
            {
                text: 'тепер інстаграм клієнта відображається у вигляді іконки соціальної мережі'
            }
        ]
    },
    {
        v: '1.3',
        date: '23.11.23',
        changes: [
            {
                type: CHANGELOG_TYPES.success,
                text: 'Butonica повністю адаптовано для планшетів і смартфонів – тепер ви можете повноцінно слідкувати за вашим бізнесом у мобільному режимі'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: "на сайті з'явився «режим очікування» – можливість увімкнути приємну анімацію в періоди, коли сайт не використовується"
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: 'тип замовлення тепер показано у вигляді іконки замість слів «доставка» й «самовивіз»'
            }
        ]
    },
    {
        v: '1.2.1',
        date: '16.11.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: "з'явилася можливість редагувати редагувати час та коментар до замовлення"
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: "на кожному розділі сайту тепер присутня анімація завантаження – особливо корисно для повільного інтернету або значної кількості елементів у таблиці"
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: "тепер у меню «Продаж» у розділі «Каса» для внесень і винесень можна додавати швидкі коментарі, використовуючи стікери («Кур'єр», «Сміття», «Вода», «Аренда приміщення» та «Розмін»)"
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'також вибір типу операції додатково супроводжується кольором – зелений для «внесень» і червоний для «винесень»'
            },
            {
                text: 'при початковому перегляді Butonica тепер замість пустої білої сторінки з меню відображається бекграунд-анімація у стилістиці сервісу'
            }
        ]
    },
    {
        v: '1.2',
        date: '10.11.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'можливість перегляду розділів «Робочі зміни», «Поставки», «Списання», «Інвентаризації», «Витрати магазину» за місяцем'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'також для наведених вище розділів введене сортування у зворотньому порядку – починаючи з останнього доданого'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'замовлення «в очікуванні» виводяться, починаючи з найближчого замовлення; «всі замовлення» – починаючи з останнього виконаного'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'при відкритті робочої зміни тепер видно, хто й коли її починав і закінчував'
            }
        ]
    },
    {
        v: '1.1',
        date: '04.11.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'можливість створювати клієнта з меню «Продаж»'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: 'можливість перегляду замовлень за датою'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: "у таблиці замовлень з'явився стовпець, що показує час, який залишився до замовлення"
            }
        ]
    },
    {
        v: '1.0.1',
        date: '28.10.23',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'на всі поля вводу додано хрестики для швидкого видалення'
            },
            {
                text: 'редизайн компоненту «прапорець» у стилі iOS'
            },
            {
                text: 'змінено порядок замовлень: «всі», «в очікуванні», «виконані»'
            }
        ]
    },
    {
        v: '1.0',
        date: '24.10.23',
        changes: [
            {
                type: CHANGELOG_TYPES.success,
                text: 'реліз першої стабільної версії Butonica'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: 'можливість створювати інтернет-замовлення, які не будуть враховуватися в касі'
            }
        ]
    },
    {
        v: '0.9.9',
        date: '22.10.23',
        changes: [
            {
                type: CHANGELOG_TYPES.bug,
                text: 'фікс усіх знайдених багів із замовленнями'
            }
        ]
    },
    {
        v: '0.9.8',
        date: '18.10.23',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'додано можливість пошуку клієнта у продажах за номером телефона'
            },
            {
                type: CHANGELOG_TYPES.bug,
                text: "пофікшено кілька багів, пов'язаних зі скасуванням та доплатою замовлень"
            }
        ]
    },
    {
        v: '0.9.7',
        date: '16.10.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'реалізація функціоналу доплати замовлень – доплата також відображається у статистиці робочої зміни'
            },
            {
                text: 'тепер флористи й менеджери не можуть змінювати відсоток бонусів'
            }
        ]
    },
    {
        v: '0.9.6',
        date: '15.10.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'можливість оплачувати замовлення бонусами – вони списуються з рахунку клієнта'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: '«всі замовлення» тепер відображаються в зворотньому порядку – починаючи від останнього доданого'
            },
            {
                text: 'тепер у статистиці робочих змін підписується тип оплати кожного продажу та замовлення'
            },
            {
                text: 'в робочих змінах тепер спочатку відображається відкрита зміна'
            }
        ]
    },
    {
        v: '0.9.5',
        date: '14.10.23',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'тепер скасувати замовлення може тільки директор, адміністратор або той, хто його створював'
            },
            {
                text: 'реалізація роботи з робочими змінами для різних працівників'
            }
        ]
    },
    {
        v: '0.9.4',
        date: '11.10.23',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'тепер працівники можуть бачити лише власні зміни'
            },
            {
                text: 'тепер не можна створити працівника з тим логіном, який вже існує в системі'
            },
            {
                text: 'якщо тип замовлення «самовивіз», то дані отримувача й адреса тепер не відображаються'
            }
        ]
    },
    {
        v: '0.9.3',
        date: '10.10.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: "для букетів з'явилася можливість зберігати шаблони"
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'букети тепер відображають собівартість'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'додана можливість помічати працівника як активного або неактивного – це потрібно для збереження робочих змін працівника, який більше не працює'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'тепер працівник не може зайти в «Продаж», якщо зміна відкрита іншим працівником'
            },
            {
                text: 'на працівника можна натискати і переглядати дані про нього'
            }
        ]
    },
    {
        v: '0.9.2',
        date: '06.10.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'завершено розділ меню «Букети та композиції»; букети тепер відображаться в продажах та при продажі розкладаються на квіти та коректно списуються'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: 'завершено розділ меню «Мітки»; для флористів і менеджерів пункт не відображається'
            }
        ]
    },
    {
        v: '0.9.1',
        date: '27.09.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'для замовлень тепер можна обирати відсоток бонусів'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'тепер на сайті присутні ролі користувачів – обмеження для флористів та менеджерів у перегляді, видаленні та редагуванні розділів сайту'
            },
            {
                text: "для важливих спливаючих вікон з'явився хрестик, щоб випадково їх не закривати"
            }
        ]
    },
    {
        v: '0.9',
        date: '24.09.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'завершено розділ меню «Витрати магазину», його можуть переглядати лише директор і адміністратор'
            },
            {
                text: 'іконка профіля користувача тепер відображає кількість днів до закінчення підписки'
            },
            {
                text: 'завершено базовий функціонал розділу меню «Букети та композиції»'
            }
        ]
    },
    {
        v: '0.8.1',
        date: '21.09.23',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'при перегляді замовлень клієнта тепер також відображається загальна сума всіх його замовлень'
            },
            {
                text: "під назвою сайту з'явився невеличкий припис"
            },
            {
                text: 'оптимізація бази даних для збереження великої кількості картинок'
            }
        ]
    },
    {
        v: '0.8',
        date: '17.09.23',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'при виборі постачальника та товара у меню тепер можна здійснювати пошук за назвою'
            },
            {
                text: 'товари в поставках, списаннях, замовленнях і меню «Продаж» тепер відображаються в алфавітному порядку'
            },
            {
                text: 'всі картинки стали заокруглені та стали відбивати невеликі тіні'
            },
            {
                text: 'редизайн іконок головного меню'
            },
            {
                text: 'списання тепер відображає інформацію про те, хто зробив його'
            }
        ]
    },
    {
        v: '0.7.2',
        date: '15.09.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'до замовлення тепер можна додавати картинку'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: 'натискання на клієнта тепер відображає усі замовлення цього клієнта'
            },
            {
                text: 'кількість квітів в меню «Продаж» тепер перераховується одразу після продажу'
            },
            {
                text: 'пункт меню «Статистика» переміщено в низ сайту'
            }
        ]
    },
    {
        v: '0.7.1',
        date: '12.09.23',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'шапка таблиці відображається при скролі сайту'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'при переході в меню продаж меню сайта згортається в компактний режим, а шапка сайту приховується'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'баланс каси у зміні тепер перераховується після кожної операції з касою'
            },
            {
                text: 'мінімалістична смуга прокрутки'
            },
            {
                text: 'колір наведення в меню змінено із помаранчевого на блідо-блакитний'
            },
            {
                text: 'біля всіх полів із пошуком тепер відображається іконка лупи'
            }
        ]
    },
    {
        v: '0.7',
        date: '09.09.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'функціонал профілів користувачів, кожний із власним логіном і паролем'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'при відкритті зміни сума каси заноситься в робочі зміну в якості першого внесення'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'при закритті зміни в касі зберігається стан готівки та терміналу'
            }
        ]
    },
    {
        v: '0.6.1',
        date: '04.09.23',
        changes: [
            {
                text: 'тепер при створенні поставки перший постачальник не обирається автоматично'
            },
            {
                text: 'тепер при створенні поставки, якщо у вас 1 склад, він обирається автоматично'
            }
        ]
    },
    {
        v: '0.6',
        date: '03.09.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'можливість натиснути на робочі зміну та переглянути повну інформацію про всі операції протягом цієї зміни'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'товари в меню «Продаж» тепер відображають свою кількість на складі'
            },
            {
                text: 'в операціях поставок, списань та інвентаризацій тепер показано точний час проведення'
            },
            {
                text: 'підтримка декількох номерів телефона для клієнтів'
            }
        ]
    },
    {
        v: '0.5.1',
        date: '31.08.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'можливість натискати на пункт «Каса» у продажах і проводити операції з касою'
            },
            {
                text: 'завершено дизайн вікна оформлення замовлення'
            },
            {
                text: 'завершено базовий функціонал розділу меню «Робочі зміни»'
            }
        ]
    },
    {
        v: '0.5',
        date: '29.08.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'можливість додавати клієнта до продажу'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: 'можливість змінювати ціну продажу'
            }
        ]
    },
    {
        v: '0.4.1',
        date: '26.08.23',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'можливість перегляду інформації про поставку'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'завершено розділ меню «Списання»'
            }
        ]
    },
    {
        v: '0.4',
        date: '23.08.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'завершено базовий функціонал розділу меню «Продаж»'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: 'можливість натискати на постачальника та переглядати інформацію про нього і всі його останні поставки за датою'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: "всі повідомлення сайту тепер з'являються у вигляді спливаючих вікон та мають 3 категорії: «Успіх», «Інформація» та «Помилка»"
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'поява кнопки «Зараз» на поставках, списаннях та інвентаризаціях'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'можливість вказувати супутні витрати для поставки'
            },
            {
                text: "«сума оплати» та «дата оплати» у поставці стали взаємопов'язаними"
            }
        ]
    },
    {
        v: '0.3',
        date: '18.08.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'товари тепер можуть мати картинки'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'завершено розділи меню «Інвентаризація» та «Клієнти»'
            }
        ]
    },
    {
        v: '0.2',
        date: '10.08.23',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'тепер, якщо у вас кілька складів, можна задавати різні ціни продажу для одного товару для кожного складу'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'завершено розділ меню «Залишки»'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'додано валідацію вхідних даних по всьому сайту'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text:  'вимкнення можливості виділення контенту на сайті'
            }
        ]
    },
    {
        v: '0.1',
        date: '07.08.23',
        changes: [
            {
                type: CHANGELOG_TYPES.success,
                text: 'перший реліз'
            },
            {
                type: CHANGELOG_TYPES.success,
                text: 'зміна назви з «Kvitka» на «Butonica»'
            },
            {
                type: CHANGELOG_TYPES.success,
                text: 'поява логотипу'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: 'завершено розділи меню «Компанія», «Торгові точки», «Каси», «Працівники», «Категорії», «Товари», «Постачальники» та «Поставки»'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'завершений вигляд хедеру та бокового меню'
            },
            {
                text: 'колір наведення в таблиці змінено із помаранчевого на блідо-блакитний'
            }
        ]
    }
]

document.querySelector('#version').textContent = 'butonica v' + changelogs[0].v

const showChangelog = () => {
    hideBodyOverflow()

    const logs = changelogModal.querySelector('.logs')
    logs.innerHTML = ''

    for (const changelog of changelogs) {
        const version = createSpan(changelog.v)
        const date = createSpan(changelog.date)
        const logTitle = document.createElement('div')
        logTitle.classList = 'log-title'
        logTitle.append(version, date)

        const logContent = document.createElement('ul')
        logContent.classList = 'log-content'

        for (const change of changelog.changes) {
            const li = document.createElement('li')
            li.classList = change.type || 'marker'
            li.textContent = change.text
            logContent.append(li)
        }

        const log = document.createElement('div')
        log.classList = 'log'
        log.append(logTitle, logContent)
        logs.append(log)
    }

    changelogModal.style.display = 'flex'
    changelogModal.querySelector('.changelog-modal-content').scroll(0, 0)
}

window.onload = () => setTimeout(() => {
    document.querySelector('#loader-page-load').remove()
    document.body.animate([
        { opacity: '0' },
        { opacity: '1' }
    ], 200)
}, 1000)

const noInternetModal = document.querySelector('.no-internet-modal')

const noInternetPhrases = [
    "Маєш проблеми зі зв'язком?",
    "Очікуємо, поки між нами знову буде зв'язок",
    "Проблеми зі зв'язком – але не в житті",
    "Коли вимкнуть світло, ми не втратимо зв'язок",
    'Butonica сумує від нашого дисконекту'
]

window.onoffline = () => {
    hideBodyOverflow()
    noInternetModal.querySelector('h1').textContent = noInternetPhrases[getRandom(0, noInternetPhrases.length - 1)] + ' 💔'
    noInternetModal.style.display = 'flex'
}

window.ononline = () => {
    document.body.style.overflow = ''
    noInternetModal.style.display = ''
    showMessage('success', 'Ви знову в мережі 🔥')
}
