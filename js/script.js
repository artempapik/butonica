const Environment = {
    DEV: 'https://localhost:7099',
    PROD: 'https://botanice.user30503.realhost-free.net'
}

const BASE_URL = Environment.PROD
const EMPTY_IMAGE_URL = 'img/empty-flower.png'

let imageData, currentPage, employeesNames

const uploadImage = e => {
    const image = e.target.files[0]
    toBase64(image).then(response => {
        e.target.parentNode.querySelector('input').value = ''
        e.target.parentNode.querySelector('img').src = response
        imageData = response
    }).catch(() => console.error('error converting image'))
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
        window.scrollTo({ top: 0, behavior: (localStorage.getItem('animations-disabled') || false) ? 'instant' : 'smooth' })
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
        if (!(localStorage.getItem('animations-disabled') || false)) {
            message.animate([
                { top: '3%', opacity: '1' },
                { top: '0', opacity: '0' }
            ], animationTime)
        }
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

    if (response.status === 201) {
        return response.url
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
    emptyImage.draggable = false
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

const notifications = document.querySelector('.notifications')
notifications.onpointerup = () => {
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
        <div class="company-container animate-item animate">
            <div class="content">
                <div class="upload-image">
                    <img src="img/empty-flower.png">
                    <span class="files-buttons">
                        <label for="company-files">
                            <span class="material-symbols-outlined">upload</span>
                        </label>
                        <span class="remove-image material-symbols-outlined" onpointerup="removeImage(event)">delete_sweep</span>
                    </span>
                    <input id="company-files" type="file" onchange="uploadImage(event)">
                </div>
                <div class="inputs">
                    <div class="form">
                        <h2>
                            <span class="required">*</span>
                            <span>Назва</span>
                        </h2>
                        <input class="company-name" maxlength="30">
                    </div>
                    <div class="form">
                        <h2>Контактні дані</h2>
                        <textarea class="company-contact-info" maxlength="100" rows="3"></textarea>
                    </div>
                </div>
            </div>
            <div class="company-buttons">
                <button onpointerup="copyToClipboard()">
                    <span class="material-symbols-outlined">content_copy</span>
                    <span>Скопіювати</span>
                </button>
                </button>
                <button class="save" onpointerup="updateCompanyInfo()">
                    <div class="loader-button"></div>
                    <span>Зберегти</span>
                </button>
            </div>
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
            <table class="animate">
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
            <table class="animate">
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
            <table class="animate">
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
                <h1>Категорії асортименту</h1>
            </div>
            <button onpointerup="createCategoryModal()">Створити</button>
        </div>
        <input type="search" oninput="searchCategory()" class="search-category" placeholder="Пошук категорії">
        <div class="category-table">
            <table class="animate">
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
            <table class="animate">
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
            <table class="animate">
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
                            <span class="material-symbols-outlined">calendar_month</span>
                            <span>за місяць</span>
                        </div>
                        <div class="type">
                            <span class="material-symbols-outlined">date_range</span>
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
            <table class="animate">
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
            <table class="animate">
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
                    <td>У букетах</td>
                    <td>У прийнятих замовленнях</td>
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
                <span class="material-symbols-outlined">inventory</span>
                <div class="inventory-date-filter">
                    <h1>Інвентаризація</h1>
                </div>
            </div>
            <button onpointerup="createInventoryModal()">Створити</button>
        </div>
        <div class="inventory-filters">
            <h4>Склади:</h4>
            <button onpointerup="showAllInventories()">Всі</button>
        </div>
        <div class="inventory-table">
            <table class="animate">
                <tr>
                    <td>Склад</td>
                    <td>
                        <span>Дата</span>
                        <span class="material-symbols-outlined">calendar_month</span>
                    </td>
                    <td>Результат</td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    sale: `
        <div class="sale-header">
            <span class="material-symbols-outlined" onpointerup="location.reload()">navigate_before</span>
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
                            <span class="enter-value" onpointerup="createCalculatorValueSpan(this)"></span>
                            <span>грн</span>
                        </div>
                    </div>
                    <div class="checkout" onpointerup="createSaleOrderModal()">Оформити замовлення</div>
                    <div class="checkout-clients">
                        <div class="add-client" onpointerup="createClientModal(false)">
                            <span class="material-symbols-outlined">add_circle</span>
                            <span>Новий</span>
                        </div>
                        <select class="select-client"></select>
                        <div class="clear-client">
                            <span>Очистити</span>
                            <span class="material-symbols-outlined">cancel</span>
                        </div>
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
        <input type="search" oninput="searchClient()" class="search-client" placeholder="ПІБ, instagram або номер">
        <div class="client-bonus">
            <span>Відсоток бонусів:</span>
            <div>
                <span class="enter-value" onpointerup="createCalculatorValueSpan(this)"></span>
                <span>%</span>
            </div>
            <button>
                <div class="loader-button"></div>
                <span onpointerup="setClientDiscount()">Обрати</span>
            </button>
        </div>
        <div class="client-table">
            <table class="animate">
                <tr>
                    <td>ПІБ</td>
                    <td>
                        <svg fill="rgb(240, 240, 240)" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></svg>
                        <span>Instagram<span>
                    </td>
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
                <h1>Списання</h1>
            </div>
            <button onpointerup="createWasteModal()">Створити</button>
        </div>
        <div class="waste-table">
            <table class="animate">
                <tr>
                    <td>
                        <span>Дата</span>
                        <span class="material-symbols-outlined">calendar_month</span>
                    </td>
                    <td>Склад</td>
                    <td>Списав</td>
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
                <h1>Робочі зміни</h1>
            </div>
        </div>
        <div class="shift-table">
            <table class="animate">
                <tr>
                    <td>Каса</td>
                    <td onpointerup="showShiftByEmployeeFilter()">
                        <span>Працівник</span>
                        <span class="material-symbols-outlined">filter_alt</span>
                    </td>
                    <td>
                        <span>Відкриття</span>
                        <span class="material-symbols-outlined">calendar_month</span>
                    </td>
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
                <div class="change-page">
                    <div class="arrows">
                        <span class="arrow-group">
                            <span class="material-symbols-outlined first-last-page" onpointerup="firstAllOrderPage(event)">first_page</span>
                            <span class="material-symbols-outlined last-page" onpointerup="previousAllOrderPage(event)">chevron_left</span>
                        </span>
                        <span class="arrow-group">
                            <span class="material-symbols-outlined" onpointerup="nextAllOrderPage(event)">chevron_right</span>
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
            <table class="animate">
                <tr>
                    <td>№</td>
                    <td>
                        <span class="material-symbols-outlined">history_toggle_off</span>
                    </td>
                    <td>
                        <span>Дата</span>
                        <span class="material-symbols-outlined">calendar_month</span>
                    </td>
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
                <div class="pending-type">
                    <div>
                        <span class="material-symbols-outlined">sync</span>
                        <span>Прийняті</span>
                    </div>
                    <div>
                        <span class="material-symbols-outlined">done</span>
                        <span>Зібрані</span>
                    </div>
                </div>
            </div>
            <button onpointerup="createInternetOrderModal()">Створити</button>
        </div>
        <div class="pending-order-table">
            <table class="animate">
                <tr>
                    <td class="animate-item animate">
                        <span class="material-symbols-outlined">search</span>
                    </td>
                    <td>
                        <span class="material-symbols-outlined">history_toggle_off</span>
                    </td>
                    <td>
                        <span>Дата</span>
                        <span class="material-symbols-outlined">calendar_month</span>
                    </td>
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
                            <span class="material-symbols-outlined last-page" onpointerup="previousCompletedOrderPage(event)">chevron_left</span>
                        </span>
                        <span class="arrow-group">
                            <span class="material-symbols-outlined" onpointerup="nextCompletedOrderPage(event)">chevron_right</span>
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
        </div>
        <div class="completed-order-table">
            <table class="animate">
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
    ordercalendar: `
        <div class="order-calendar-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">calendar_month</span>
                <h1>Календар замовлень</h1>
                <div class="order-calendar-months">
                    <div class="order-calendar-month">
                        <span class="material-symbols-outlined" onpointerup="getPreviousCalendarWeek()">chevron_left</span>
                        <span></span>
                    </div>
                    <span class="separator"></span>
                    <div class="order-calendar-month">
                        <span></span>
                        <span class="material-symbols-outlined" onpointerup="getNextCalendarWeek()">chevron_right</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="order-calendar-days">
            <span class="calendar-day">Тиждень</span>
            <span class="calendar-day">
                <span>пн</span>
                <span></span>
            </span>
            <span class="calendar-day">
                <span>вт</span>
                <span></span>
            </span>
            <span class="calendar-day">
                <span>ср</span>
                <span></span>
            </span>
            <span class="calendar-day">
                <span>чт</span>
                <span></span>
            </span>
            <span class="calendar-day">
                <span>пт</span>
                <span></span>
            </span>
            <span class="calendar-day">
                <span>сб</span>
                <span></span>
            </span>
            <span class="calendar-day">
                <span>нд</span>
                <span></span>
            </span>
        </div>
        <div class="order-calendar">
            <div class="order-calendar-category processed" ondrop="moveOrder(event, 0)" ondragover="event.preventDefault()">
                <div class="category">
                    <span class="material-symbols-outlined">sync</span>
                    <span>Прийняті</span>
                </div>
            </div>
            <div class="order-calendar-category completed" ondrop="moveOrder(event, 1)" ondragover="event.preventDefault()">
                <div class="category">
                    <span class="material-symbols-outlined">done</span>
                    <span>Зібрані</span>
                </div>
            </div>
            <div class="order-calendar-category delivered" ondrop="moveOrder(event, 2)" ondragover="event.preventDefault()">
                <div class="category">
                    <span class="material-symbols-outlined">local_shipping</span>
                    <span>Доставлені</span>
                </div>
            </div>
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
            <table class="animate">
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
                <span class="material-symbols-outlined">monetization_on</span>
                <div class="store-expenses-date-filter">
                    <h1>Витрати</h1>
                    <div class="store-expense-type">
                        <div>
                            <span class="material-symbols-outlined">fact_check</span>
                            <span>Робочих змін</span>
                        </div>
                        <div>
                            <span class="material-symbols-outlined">storefront</span>
                            <span>Магазину</span>
                        </div>
                    </div>
                </div>
            </div>
            <button onpointerup="createStoreExpenseModal()">Створити</button>
        </div>
        <div class="store-expense-table">
            <table class="animate">
                <tr>
                    <td>
                        <span>Дата</span>
                        <span class="material-symbols-outlined">calendar_month</span>
                    </td>
                    <td>Склад</td>
                    <td>Категорія</td>
                    <td>Сума</td>
                    <td>Коментар</td>
                    <td></td>
                </tr>
            </table>
        </div>
    `,
    storeexpensecategory: `
        <div class="store-expense-category-header">
            <div class="header-items">
                <div id="loader"></div>
                <span class="material-symbols-outlined">checklist_rtl</span>
                <h1>Категорії витрат</h1>
            </div>
            <button onpointerup="createStoreExpenseCategoryModal()">Створити</button>
        </div>
        <div class="store-expense-category-table">
            <table class="animate">
                <tr>
                    <td>Назва</td>
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
            <table class="animate">
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
                        <div class="stat-switcher-title">
                            <span class="material-symbols-outlined" onpointerup="previousStatPeriod()">chevron_left</span>
                            <div></div>
                            <div></div>
                            <span class="material-symbols-outlined" onpointerup="nextStatPeriod()">chevron_right</span>
                        </div>
                        <div class="stat-switcher">
                            <div class="active">місяць</div>
                            <div>рік</div>
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
                        <span class="stat-value positive-left">
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
                        <span class="stat-title">online-замовлення:</span>
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
            <div class="month-line-chart">
                <canvas id="income-by-shift-line-chart"></canvas>
            </div>
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

const menuButton = document.querySelector('.logo-panel span')
const menu = document.querySelector('aside')

const pressMenuButton = display => {
    hideBodyOverflow()
    menu.style.display = display
}

menuButton.onpointerup = () => menu.style.display ? pressMenuButton('') : pressMenuButton('flex')

let activeMenuItem

const fillSelectedMenuItem = e => {
    activeMenuItem = ''
    clearInterval(allOrderIntervalId)
    clearInterval(pendingOrderIntervalId)
    clearInterval(orderCalendarIntervalId)
    clearInterval(dailyStatisticsFactIntervalId)
    clearInterval(dailyStatisticsTimeIntervalId)

    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (!e) {
        activeMenuItem = 'pendingorder'
        return
    }

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

    if (localStorage.getItem('animations-disabled') || false) {
        main.querySelector('table')?.classList.remove('animate')
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

const indexToDayOfWeek = {
    0: 'нд',
    1: 'пн',
    2: 'вт',
    3: 'ср',
    4: 'чт',
    5: 'пт',
    6: 'сб'
}

const formatWeekDate = (date, onlyText = false, includeTime = true) => {
    if (!date) {
        return ''
    }
    
    const td = createTd()

    if (!date) {
        return td
    }
    
    date = new Date(date)
    const formattedDate = date.toLocaleDateString('ru')

    const dayOfWeekText = indexToDayOfWeek[date.getDay()]
    let dateText = `${formattedDate.substring(0, 2)} ${calendarMonthIndexToName[+formattedDate.substring(3, 5) - 1]}`

    if (!includeTime) {
        return dayOfWeekText + ' ' + dateText
    }
    
    const localTime = date.toLocaleTimeString()
    if (localTime !== '00:00:00' && localTime !== '12:00:00 AM') {
        dateText += `, ${padTime(date.getHours())}:${padTime(date.getMinutes())}`
    }

    if (onlyText) {
        return dayOfWeekText + ' ' + dateText
    }

    td.append(
        createSpan(dayOfWeekText),
        createSpan(dateText)
    )
    return td
}

const handlePriceInput = e => {
    if (!(e.keyCode === 8 || e.keyCode === 46 || e.charCode >= 48 && e.charCode <= 57)) {
        e.preventDefault()
    }
}

const hideBodyOverflow = () => {
    if (isMobile) {
        const scrollY = window.scrollY
        localStorage.setItem('scroll-y', scrollY)
        document.body.classList.add('fixed')
        document.body.style.top = -scrollY + 'px'
    }

    document.body.style.overflow = 'hidden'
}

const hideModal = modal => {
    if (isMobile) {
        document.body.classList.remove('fixed')
        window.scrollTo(0, localStorage.getItem('scroll-y'))
    }

    modal.style.display = ''

    if (!intervalId && modal !== calculatorModal && modal !== flavorTemplatesModal && !shiftInfoModal.style.display) {
        document.body.style.overflow = ''
    }

    if (modal === calculatorModal) {
        calculator.classList.remove('bottom')

        if (calculator.classList.contains('mode-search')) {
            calculator.classList.remove('mode-search')

            pendingOrderFilters.orderNumber = enterInput.textContent
            filterPendingOrders()

            const searchPendingOrderCell = document.querySelector('.pending-order-table tr:first-child td:first-child')

            if (!searchPendingOrderCell.textContent) {
                const searchIcon = document.createElement('span')
                searchIcon.classList = 'material-symbols-outlined'
                searchIcon.textContent = 'search'
                searchPendingOrderCell.append(searchIcon)
            }
        }
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
        storeExpenseCategoryModal,
        labelModal
    ]) {
        if (modal.style.display) {
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
        shiftEmployeesInfoModal,
        orderInfoModal,
        flavorInfoModal,
        flavorTemplatesModal,
        employeeInfoModal,
        storeExpenseInfoModal,
        notesModal,
        changelogModal,
        calculatorModal
    ]) {
        if (e.target === modal) {
            setTimeout(() => hideModal(modal), 1)

            if (e.target === notesModal) {
                const screensaver = document.querySelector('#screensaver')
                if (screensaver) {
                    screensaver.style.zIndex = 2
                }
            }

            if (recalculateAction && !previousSaleSpan.textContent) {
                previousSaleSpan.textContent = previousSalePrice
                recalculateAction()
                recalculateAction = null
                previousSaleSpan = null
                previousSalePrice = null
            }

            if (e.target === calculatorModal && recalculateAction) {
                recalculateAction = null
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

const getSubscriptionExpiresText = date => {
    const daysLeft = 30 - Math.floor((new Date() - date) / (1000 * 60 * 60 * 24))
    const subText = document.querySelector('.subscription-text span:last-child')
    subText.style.fontSize = daysLeft > 0 ? '' : '.8rem'
    subText.style.color = daysLeft > 0 ? 'rgb(30, 30, 30)' : 'rgb(220, 0, 0)'
    return daysLeft > 0 ? `${daysLeft} дн.` : 'НЕ СПЛАЧЕНО'
}

const hideStartPageLoad = (getDaily = false) => setTimeout(() => {
    const animationsDisabled = localStorage.getItem('animations-disabled') || false

    if (animationsDisabled) {
        const toggleAnimationsButton = document.querySelector('.profile-info div:nth-child(5)')
        const toggleAnimationsIcon = toggleAnimationsButton.querySelector('span')
        toggleAnimationsButton.style.color = 'rgb(150, 150, 150)'
        toggleAnimationsIcon.textContent = 'toggle_off'
        toggleAnimationsClass()
    }

    document.querySelector('#loader-page-load').remove()

    if (!animationsDisabled) {
        document.body.animate([
            { opacity: '0' },
            { opacity: '1' }
        ], 200)
    }

    if (loginInfo) {
        get(`Employee/${loginInfo.companyId}/names`).then(response => employeesNames = response)
    }

    if (getDaily) {
        getDailyStatistics()
    }
}, 300)

let dailyStatisticsFactIntervalId, dailyStatisticsTimeIntervalId

const getDailyStatistics = () => get(`Statistics/daily/${loginInfo.companyId}`).then(response => {
    if (!response || (loginInfo.title > 1 && response.employeeId !== loginInfo.employeeId)) {
        return
    }
    
    const statValues = main.querySelectorAll('.stat-value')

    if (!statValues.length) {
        return
    }

    const fillMainVal = (i, key, currency = true) => {
        const value = response[key] % 1 === 0 ? response[key] : response[key].toFixed(2)
        statValues.item(i).textContent = currency ? value + ' грн' : value
    }

    fillMainVal(0, 'revenue')
    fillMainVal(1, 'shiftRevenue')
    fillMainVal(2, 'internetOrdersRevenue')
    fillMainVal(3, 'cash')
    fillMainVal(4, 'terminalCash')
    fillMainVal(5, 'ordersCount', false)
    fillMainVal(6, 'internetOrdersCount', false)
    fillMainVal(7, 'salesCount', false)
    fillMainVal(8, 'receipt')
    fillMainVal(9, 'internetOrdersReceipt')

    if (loginInfo.title > 1) {
        statValues.item(0).textContent = statValues.item(1).textContent
        const statBlocks = main.querySelectorAll('.stat-block')

        for (const i of [1, 2, 9]) {
            statBlocks.item(i).style.display = 'none'
        }
    }

    const topSalesTable = main.querySelector('table')

    if (response.topSales.length) {
        for (const sale of response.topSales) {
            const tr = document.createElement('tr')
            tr.append(
                createTd(sale.name),
                createTd(sale.amount)
            )

            topSalesTable.append(tr)
        }
    } else {
        topSalesTable.append(createEmptyDataDiv())
    }

    const fact = main.querySelector('.fact')
    fact.textContent = randomFacts[getRandom(0, randomFacts.length - 1)]
    dailyStatisticsFactIntervalId = setInterval(() => fact.textContent = randomFacts[getRandom(0, randomFacts.length - 1)], 60 * 1000 * 15)

    const factDate = main.querySelector('.fact-date')
    factDate.textContent = new Date().toLocaleTimeString('ru').substring(0, 5)
    dailyStatisticsTimeIntervalId = setInterval(() => factDate.textContent = new Date().toLocaleTimeString('ru').substring(0, 5), 60 * 1000)

    main.querySelector('.main-statistics').style.display = 'flex'
}).catch(() => showMessage('error', getErrorMessage('сьогоднішню статистику')))

if (loginInfo) {
    get(`Company/start-subscription/${loginInfo.companyId}`).then(response => {
        loginInfo.startSubscription = response

        document.querySelector('.profile').textContent = getInitials(loginInfo.fullName)
        document.querySelector('.profile-info div span:last-child').textContent = loginInfo.fullName + ' — ' + employeeTitleToName[loginInfo.title]
        document.querySelector('.subscription-text span:last-child').textContent = getSubscriptionExpiresText(new Date(loginInfo.startSubscription))
        removeMenus(loginInfo.title)

        hideStartPageLoad(true)
    }).catch(() => showMessage('error', getErrorMessage('підписку')))
} else {
    hideStartPageLoad()
    loginModal.style.display = 'flex'

    loginModal.onkeyup = e => {
        if (e.key === 'Enter') {
            login()
        }
    }
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

        showMessage('success', '🌸 Вітаємо в Butonica,\n' + loggedUser.fullName)

        removeMenus(loggedUser.title)
        document.querySelector('.profile').textContent = getInitials(loggedUser.fullName)
        document.querySelector('.profile-info div span:last-child').textContent = loggedUser.fullName + ' — ' + employeeTitleToName[loggedUser.title]
        document.querySelector('.subscription-text span:last-child').textContent = getSubscriptionExpiresText(loggedUser.startSubscription)
        getDailyStatistics()
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

const openProfile = () => {
    profileInfo.style.display = profileInfo.style.display === 'flex' ? '' : 'flex'
    notificationsInfo.style.display = ''
}

document.onscroll = () => {
    notificationsInfo.style.display = ''
    profileInfo.style.display = ''
}

document.ondblclick = e => e.preventDefault()

document.onpointerdown = e => {
    if (e.button === 1) {
        e.preventDefault()
    }
}

const isMobile = 'ontouchstart' in window
const notificationsInfo = document.querySelector('.notifications-info')

document.onpointerup = e => {
    if (isMobile) {
        document.activeElement.blur()
    }

    if (e.target === header.querySelector('.notifications')) {
        notificationsInfo.style.display = notificationsInfo.style.display === 'flex' ? '' : 'flex'
    } else {
        notificationsInfo.style.display = ''
    }

    if (e.target.classList.contains('profile')) {
        return
    }

    profileInfo.style.display = ''
}

const confirmModal = document.querySelector('.confirm-modal')
const confirmModalText = confirmModal.querySelector('.text')

const showConfirm = (text, f) => {
    const yesButton = confirmModal.querySelector('button')

    hideBodyOverflow()
    confirmModalText.querySelectorAll('span').forEach(m => m.textContent = '')
    text = text.split('\n')
    confirmModalText.querySelector('span').textContent = text[0]

    if (text.length !== 1) {
        confirmModalText.querySelector('span:last-child').textContent = text[1]
    }

    yesButton.onpointerup = f
    confirmModal.style.display = 'flex'
}

const logout = () => showConfirm('Вийти з Butonica?', () => {
    localStorage.setItem('login-info', null)
    location.reload()
})

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const screensaverMarkup = `
    <div id="screensaver">
        <img src="img/parsley.png">
        <span class="logo-text">
            <span>Butonica</span>
            <span>Облік Твоєї квіткарні</span>
        </span>
    </div>
`

let intervalId

const toggleScreensaver = () => {
    const screensaver = document.querySelector('#screensaver')
    const toggleScreensaverButton = document.querySelector('.profile-info div:nth-child(4)')
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

const toggleAnimationsClass = () => {
    document.querySelectorAll('.animate-item').forEach(i => i.classList.toggle('animate'))
    main.querySelectorAll('.bg-animate').forEach(d => d.style.display = d.style.display === 'none' ? '' : 'none')

    document.querySelectorAll('[class$=modal-content]').forEach(i => {
        if (i.classList.contains('animate')) {
            i.classList.remove('animate')
            return
        }

        i.classList = 'animate ' + i.classList
    })
}

const toggleAnimations = () => {
    const toggleAnimationsButton = document.querySelector('.profile-info div:nth-child(5)')
    const toggleAnimationsIcon = toggleAnimationsButton.querySelector('span')
    toggleAnimationsClass()
    
    if (toggleAnimationsIcon.textContent === 'toggle_on') {
        toggleAnimationsButton.style.color = 'rgb(150, 150, 150)'
        localStorage.setItem('animations-disabled', ' ')
        showMessage('error', 'Анімації вимкнено 👀')
        toggleAnimationsIcon.textContent = 'toggle_off'
        return
    }

    toggleAnimationsButton.style.color = '#000'
    localStorage.setItem('animations-disabled', '')
    showMessage('success', 'Анімації ввімкнено ☄️')
    toggleAnimationsIcon.textContent = 'toggle_on'
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

const showNotesModal = () => {
    hideBodyOverflow()

    const screensaver = document.querySelector('#screensaver')
    if (screensaver) {
        screensaver.style.zIndex = 1
    }

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

const clocks = [...document.querySelectorAll('.clock-screensaver, .clock-modal')]
clocks[0].onpointerup = () => clocks[1].style.display = 'flex'

clocks[1].onpointerup = () => {
    clocks[1].animate([
        { opacity: '1', height: '100%' },
        { opacity: '0', height: '0' }
    ], 700)

    setTimeout(() => clocks[1].style.display = '', 690)
}

document.querySelector('#version').textContent = 'butonica v' + changelogs[0].v
const changelogModal = document.querySelector('.changelog-modal')

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

const internetPhrases = [
    "Зв'язок відновлено",
    'Ми знову в мережі',
    'Можна знову працювати',
    'Проблеми відсутні'
]

window.ononline = () => {
    document.body.style.overflow = ''
    noInternetModal.style.display = ''
    showMessage('success', internetPhrases[getRandom(0, internetPhrases.length - 1)] + ' 🔥')
}

const calculatorModal = document.querySelector('.calculator-modal')
const calculator = document.querySelector('#calculator')
let enterInput

const calculatorNumbers = calculator.querySelectorAll('span')

const keyToCalculatorNumber = {
    0: 9,
    1: 6,
    2: 7,
    3: 8,
    4: 3,
    5: 4,
    6: 5,
    7: 0,
    8: 1,
    9: 2
}

window.onkeyup = e => {
    if (calculatorModal.style.display !== 'flex') {
        return
    }

    calculatorNumbers.forEach(n => n.classList.remove('active'))

    if (e.key === 'Escape') {
        recalculateAction = null
        hideModal(calculatorModal)
    }

    if (e.key === 'Backspace') {
        if (!enterInput.textContent) {
            return
        }

        calculatorNumbers[calculatorNumbers.length - 1].classList.add('active')
        enterInput.textContent = enterInput.textContent.slice(0, -1)

        if (recalculateAction) {
            recalculateAction()
        }

        return
    }

    if (calculator.classList.contains('bottom') && enterInput.textContent.length > 1) {
        return
    }

    if (calculator.classList.contains('mode-search') && enterInput.textContent.length > 3) {
        return
    }

    if (recalculateAction && enterInput.textContent.length > 6) {
        return
    }

    if (enterInput.textContent.length > 8) {
        return
    }

    if ((e.key === '.' || e.key === ',') && !calculator.classList.contains('mode-search')) {
        calculatorNumbers[calculatorNumbers.length - 2].classList.add('active')
        enterInput.textContent += '.'
    }

    if (isNaN(Number(e.key)) || e.key === null || e.key === ' ') {
        return
    }

    calculatorNumbers[keyToCalculatorNumber[e.key]].classList.add('active')
    enterInput.textContent += e.key

    if (recalculateAction) {
        recalculateAction()
    }
}

calculatorNumbers.forEach(e => e.onpointerup = () => {
    calculatorNumbers.forEach(n => n.classList.remove('active'))

    if (e.textContent === 'backspace') {
        if (!enterInput.textContent) {
            return
        }

        enterInput.textContent = enterInput.textContent.slice(0, -1)

        if (recalculateAction) {
            recalculateAction()
        }

        return
    }

    if (calculator.classList.contains('bottom') && enterInput.textContent.length > 1) {
        return
    }

    if (calculator.classList.contains('mode-search') && enterInput.textContent.length > 3) {
        return
    }

    if (recalculateAction && enterInput.textContent.length > 6) {
        return
    }

    if (enterInput.textContent.length > 8) {
        return
    }

    enterInput.textContent += e.textContent

    if (recalculateAction) {
        recalculateAction()
    }
})

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(_ => {})
            .catch(e => console.log(e))
    })
}

const animateChange = item => (localStorage.getItem('animations-disabled') || false) ? {} : item.animate([
    { opacity: '.4' },
    { opacity: '1' }
], 200)

const createCalculatorValueSpan = span => {
    const spanRect = span.getBoundingClientRect()

    calculatorNumbers.forEach(n => n.classList.remove('active'))
    enterInput = span

    calculatorModal.style.display = 'flex'
    const calculatorRect = calculator.getBoundingClientRect()
    let leftCoord = spanRect.left - (calculatorRect.width - spanRect.width) / 2

    if (leftCoord + calculatorRect.width > document.body.clientWidth) {
        leftCoord = document.body.clientWidth - calculatorRect.width - 0.5
    } else if (leftCoord < 0) {
        leftCoord = 0.5
    }

    calculator.style.left = leftCoord + 'px'

    const top = spanRect.top - calculatorRect.height * 1.05
    if (top < 0) {
        calculator.classList.add('bottom')
        calculator.style.top = spanRect.top + 38 + 'px'
    } else {
        calculator.style.top = top + 'px'
    }

    animateCalculator()
}

const animateCalculator = () => (localStorage.getItem('animations-disabled') || false) ? {} : calculator.animate([
    { transform: 'scale(.7)', opacity: '.4' },
    { transform: 'scale(1)', opacity: '1' }
], 80)

const select2NoResults = (placeholder, width) => ({
    language: {
        noResults: () => 'Не знайдено'
    },
    placeholder,
    width
})

const select2NoSearch = placeholder => ({
    minimumResultsForSearch: -1,
    placeholder
})

// Notification.requestPermission().then(permission => console.log(permission))

// navigator.serviceWorker.ready.then(registration => registration.pushManager.subscribe({
//     userVisibleOnly: true,
//     applicationServerKey: 'BFmkGFeE0h2F6QF6MA3DoP35vJlCVu-op-YbrNNFMLe7hYj6p7kzjCGwWZuRll0_GRtLwTre6EV9U0nja-fQwW4'
// })
//     .then(subscription => console.log(subscription))
//     .catch(e => console.log(e)))
