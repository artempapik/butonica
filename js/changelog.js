const CHANGELOG_TYPES = {
    success: 'success',
    fire: 'fire',
    exclamation: 'exclamation',
    bug: 'bug'
}

const changelogs = [
    {
        v: '2.1.0',
        date: '13.03.24',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'перегляд інформації про товар тепер відображає історію зміни його закупівельної ціни (тільки для директора й адміна)'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'у розділ «Компанія» додано кнопку для швидкого копіювання ваших контактних даних'
            },
            {
                text: 'оптимізація бази: при перегляді товарів тепер не завантажуються всі картинки'
            }
        ]
    },
    {
        v: '2.0.2',
        date: '11.03.24',
        changes: [
            {
                text: 'тепер кожне замовлення відображає інформацію, чи є воно online-замовленням'
            },
            {
                text: 'невеликий фікс у перегляді замовлень за тиждень у календарі замовлень'
            }
        ]
    },
    {
        v: '2.0.1',
        date: '09.03.24',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'перехід до Інстаграму та номеру клієнта, а також до телефону постачальника доступні прямо з відповідних таблиць'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'тепер замовлення в робочих змінах відображаються разом із номером'
            },
            {
                text: '«всі замовлення» тепер сортуються не тільки за статусом, а й за часом у залежності від статусу'
            }
        ]
    },
    {
        v: '2.0',
        date: '07.03.24',
        changes: [
            {
                type: CHANGELOG_TYPES.success,
                text: 'функціонал «Календар замовлень» реалізовано! Переглядайте усі ваші замовлення у зручному вигляді за день або тиждень у вигляді карток'
            }
        ]
    },
    {
        v: '1.9.1',
        date: '04.03.24',
        changes: [
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'у розділах «Працівники», «Клієнти», «Постачальники» та «Замовлення» номери телефонів доступні для набору прямо з Butonica'
            },
            {
                type: CHANGELOG_TYPES.bug,
                text: 'фікс багу із нескинутими фільтрами у «замовленнях в очікуванні», «залишках» і «товарах»'
            },
            {
                text: 'покращено відображення «виконаних замовлень» у мобільному режимі'
            }
        ]
    },
    {
        v: '1.9',
        date: '02.03.24',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'тепер ви можете переглядати замовлення в очікуванні за обраним типом – «прийняті» або «зібрані»'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: 'тепер ви можете шукати замовлення в очікуванні за номером – для цього просто натисніть кнопку 🔍 у першому стовчику таблиці та введіть префікс номера'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'перегляд замовлень у очікуванні за датою тепер не робить запитів до серверу – фільтрація проходить швидше'
            }
        ]
    },
    {
        v: '1.8.4',
        date: '29.02.24',
        changes: [
            {
                type: CHANGELOG_TYPES.bug,
                text: 'декілька фіксів розмірів картинок для товарів і букетів на пристроях Apple, додано тіні'
            },
            {
                text: 'тепер вимкнення анімацій впливає на початковий екран і плавність прокрутки'
            },
            {
                text: 'після натиснення клавіші Escape спливаючий калькулятор тепер приховується'
            }
        ]
    },
    {
        v: '1.8.3',
        date: '25.02.24',
        changes: [
            {
                type: CHANGELOG_TYPES.success,
                text: 'меню «Продаж» повністю адаптовано до телефонного режиму'
            },
            {
                text: 'дрібні правки верстки у списаннях та меню завантаження зображень у телефонному режимі'
            }
        ]
    },
    {
        v: '1.8.2',
        date: '22.02.24',
        changes: [
            {
                type: CHANGELOG_TYPES.fire,
                text: 'покращення вбудованого календаря – можливість переглядати замовлення на завтра та спрощення навігації'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: 'розмір та якість зображень були збільшені'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'тепер для кожної таблиці при завантаженні, пошуку, фільтрації та сортуванні відтворюється анімація'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'Butonica тепер дає змогу вимикати анімації'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'тепер не можна створити інтернет-замовлення без товарів'
            },
            {
                type: CHANGELOG_TYPES.exclamation,
                text: 'при натисканні на замовлення тепер видно, чи оплачено воно'  
            },
            {
                type: CHANGELOG_TYPES.bug,
                text: 'фікс невеликих багів із режимом очікування та вибору типу операції в касі в меню «Продаж»'
            },
            {
                text: 'меню завантаження зображення осучаснено'
            },
            {
                text: 'замітки перенесені у панель користувача'
            }
        ]
    },
    {
        v: '1.8.1',
        date: '15.02.24',
        changes: [
            {
                text: 'тепер, якщо в замовленні час «від» та «до» співпадають, він не дублюється'
            },
            {
                text: 'деяки іконки були замінені на монохромні з метою оптимізації та покращення зовнішнього вигляду'
            },
            {
                text: 'дрібні правки верстки в розділах «Товари», «Букети та композиції», «Залишки», «Витрати магазину», «Клієнти» та «Працівники»'
            },
            {
                text: "тепер у таблиці клієнтів замість email'у відображається instagram"
            }
        ]
    },
    {
        v: '1.8',
        date: '11.02.24',
        changes: [
            {
                type: CHANGELOG_TYPES.success,
                text: 'Butonica тепер доступна у вигляді PWA (Progressive Web Application)! Тепер ви можете встановити сервіс на домашній екран і користуватися ним як мобільним додатком'
            },
            {
                type: CHANGELOG_TYPES.fire,
                text: 'новий тестовий компонент «калькулятор», який дозволяє швидше та зручніше вводити числові дані. Наявний на сторінці створення та редагування товару'
            },
            {
                text: 'тепер всі працівники сортуються спочатку за посадою, а потім – за властивістю «активний»'
            },
            {
                text: 'нові анімації кнопок виходу з системи та перегляду розділу «Changelog»'
            },
            {
                text: 'невеликі правки верстки в замовленнях'
            }
        ]
    },
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
                text: 'зміна кольорової гамми графіків для відповідання стилістиці бутоніки; зміна шрифтів, додавання тіней та підписи під необхідні типи графіків'
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
