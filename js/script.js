for (const src of [
    'delivery.png',
    'pickup.png',
    'cancel.png',
    'empty-box.webp',
    'empty-flower.webp',
    'calendar.png',
    'period.png',
    'check.png',
    'decline.png'
]) {
    const img = new Image()
    img.src = 'img/' + src
}

const Environment = {
    DEV: 'https://localhost:7099',
    PROD: 'https://botanice.user30503.realhost-free.net'
}

const BASE_URL = Environment.PROD
const EMPTY_IMAGE_URL = 'img/empty-flower.webp'

let imageData, currentPage

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
    if (e.target === header) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

const animations = [
    { opacity: '1', transform: 'translateY(0)' }, 
    { opacity: '.3', transform: 'translateY(1.5rem)' }
]

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
            { top: '0', opacity: '0' },
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
        const submenuAnimate = submenu.animate(animations, 150)
        submenuAnimate.onfinish = () => {
            submenu.style.display = ''
            expandIcon.innerHTML = 'expand_more'
        }
    } else {
        submenu.style.display = 'flex'
        expandIcon.innerHTML = 'expand_less'
    }
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
            <button class="save" onpointerup="updateCompanyInfo()">Зберегти</button>
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
                    <td>Дії</td>
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
                    <td>Дії</td>
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
                    <td>Дії</td>
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
                    <td>Дії</td>
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
                    <td>Дії</td>
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
                    <td>Дії</td>
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
                    <td>Дії</td>
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
                    <td>Дії</td>
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
                    <td>Дії</td>
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
                <input type="date" onchange="getAllOrdersByDate(event)">
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
                        <span class="material-symbols-outlined">history_toggle_off</span>
                    </td>
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
                        <span class="material-symbols-outlined">history_toggle_off</span>
                    </td>
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
                    <td>Дії</td>
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
                    <td>Дії</td>
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
                    <td>Дії</td>
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
                    <td>Дії</td>
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
                        <select onchange="getStatisticsValues(event.target.selectedIndex)">
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
                    </div>
                </div>
            </div>
        </div>
        <ul class="general-statistics-info">
            <li>
                <span class="stat-title">Прибуток:</span>
                <span class="stat-value">
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
            <canvas id="expenses-pie-chart"></canvas>
            <canvas id="income-pie-chart"></canvas>
            <canvas id="income-by-label-pie-chart"></canvas>
            <canvas id="expenses-income-pie-chart"></canvas>
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
    document.body.style.overflow = ''
}

const hideModalEnableButton = (modal, button) => {
    hideModal(modal)
    button.style.disabled = false
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
            const modalAnimate = modal.querySelector('div').animate(animations, 150)
            modalAnimate.onfinish = () => hideModal(modal)
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
        notesModal
    ]) {
        if (e.target === modal) {
            const modalAnimate = modal.querySelector(e.target.tagName === 'ASIDE' ? 'ul' : 'div').animate(animations, 150)
            modalAnimate.onfinish = () => hideModal(modal)
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
    }).catch(() => {
        payButton.disabled = false
        showMessage('error', 'Невірний логін або пароль')
    })
}

const profileInfo = document.querySelector('.profile-info')

const animateProfileInfo = () => {
    const profileAnimate = profileInfo.animate([
        { opacity: '1', transform: 'translateY(0)' }, 
        { opacity: '0', transform: 'translateY(-.6rem)' }
    ], 200)

    profileAnimate.onfinish = () => profileInfo.style.display = ''
}

const openProfile = () => {
    if (profileInfo.style.display === 'flex') {
        animateProfileInfo()
        return
    }

    profileInfo.style.display = 'flex'
}

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

    animateProfileInfo()
}

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

const toggleScreensaver = () => {
    const screensaver = document.querySelector('#screensaver')
    const toggleScreensaverButton = document.querySelector('.profile-info div:nth-child(3)')

    if (screensaver) {
        screensaver.remove()
        toggleScreensaverButton.style.fontWeight = ''
        toggleScreensaverButton.style.color = ''
        return
    }

    const root = document.querySelector(':root')
    root.style.setProperty('--screensaver-delay', -(getRandom(1, 20) + getRandom(1, 10) / 10) + 's')
    root.style.setProperty('--screensaver-move-x', getRandom(6, 12) + getRandom(1, 10) / 10 + 's')
    root.style.setProperty('--screensaver-move-y', getRandom(8, 14) + getRandom(1, 10) / 10 + 's')

    toggleScreensaverButton.style.fontWeight = 'bold'
    toggleScreensaverButton.style.color = 'rgb(0, 71, 171)'
    document.body.insertAdjacentHTML('beforeend', screensaverMarkup)
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
    if (!notes.length) {
        notesModal.querySelector('li').style.display = 'flex'
        notesModal.style.display = 'flex'
        return
    }

    hideBodyOverflow()

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

const hideNoteCreation = () => {
    notesModal.querySelector('li').style.display = ''
    notesModal.querySelector('textarea').value = ''
}

const createNote = () => notesModal.querySelector('li').style.display = 'flex'

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
    hideNoteCreation()
}

const cancelNote = () => {
    if (notes.length) {
        hideNoteCreation()
    }
}

const loaderPage = document.querySelector('#loader-page')

const showPageLoad = () => loaderPage.style.display = 'flex'
const hidePageLoad = () => loaderPage.style.display = ''
