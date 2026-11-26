Американский британский переводчик
Создайте полнофункциональное JavaScript-приложение, аналогичное этому: https://american-british-translator.freecodecamp.rocks/ . Работа над этим проектом потребует написания кода с использованием одного из следующих методов:

Клонируйте [этот репозиторий GitHub](https://github.com/freeCodeCamp/boilerplate-project-american-british-english-translator/) и завершите свой проект локально.
Для завершения проекта используйте любой конструктор сайтов на ваш выбор. Обязательно подключите все файлы из нашего репозитория на GitHub.
Вся логика может быть применена к/components/translator.js
Пройдите /api/translateмаршрут в/routes/api.js
Создайте все модульные/функциональные тесты в tests/1_unit-tests.jsиtests/2_functional-tests.js
См. файлы JavaScript для получения информации /componentsо различных вариантах написания и терминах, которые должно переводить ваше приложение.
Для автоматического запуска тестов установите NODE_ENVпараметр testбез кавычек в .envфайле.
Для запуска тестов в консоли используйте команду npm run test.
Напишите следующие тесты в tests/1_unit-tests.js:

Перевести Mangoes are my favorite fruit.на британский английский
Перевести I ate yogurt for breakfast.на британский английский
Перевести We had a party at my friend's condo.на британский английский
Перевести Can you toss this in the trashcan for me?на британский английский
Перевести The parking lot was full.на британский английский
Перевести Like a high tech Rube Goldberg machine.на британский английский
Перевести To play hooky means to skip class or work.на британский английский
Перевести No Mr. Bond, I expect you to die.на британский английский
Перевести Dr. Grosh will see you now.на британский английский
Перевести Lunch is at 12:15 today.на британский английский
Перевести We watched the footie match for a while.на американский английский
Перевести Paracetamol takes up to an hour to work.на американский английский
Перевести First, caramelise the onions.на американский английский
Перевести I spent the bank holiday at the funfair.на американский английский
Перевести I had a bicky then went to the chippy.на американский английский
Перевести I've just got bits and bobs in my bum bag.на американский английский
Перевести The car boot sale at Boxted Airfield was called off.на американский английский
Перевести Have you met Mrs Kalyani?на американский английский
Перевести Prof Joyner of King's College, London.на американский английский
Перевести Tea time is usually around 4 or 4.30.на американский английский
Выделить перевод вMangoes are my favorite fruit.
Выделить перевод вI ate yogurt for breakfast.
Выделить перевод вWe watched the footie match for a while.
Выделить перевод вParacetamol takes up to an hour to work.
Напишите следующие тесты в tests/2_functional-tests.js:

Перевод с использованием текстовых и языковых полей: POST-запрос к/api/translate
Перевод текста с некорректным полем локали: POST-запрос к/api/translate
Перевод с отсутствующим текстовым полем: POST-запрос к/api/translate
Перевод с отсутствующим полем локали: POST-запрос к/api/translate
Перевод с пустым текстом: POST-запрос к/api/translate
Перевод текста, не требующего перевода: POST-запрос к/api/translate


Тесты:
Ожидание :1. Вам следует указать свой собственный проект, а не пример URL-адреса.
Ожидание :2. Вы можете POSTотправить запрос /api/translateс телом, содержащим textтекст для перевода, и localeлибо с помощью `<script> american-to-british`, либо с помощью british-to-american`<script>`. Возвращаемый объект должен содержать отправленный текст textи translationпереведенный текст.
Ожидание :3. /api/translateМаршрут должен учитывать способ написания времени в американском и британском английском. Например, "10:30" пишется как "10.30" в британском английском и "10:30" в американском английском. Элемент spanдолжен охватывать всю строку времени, т.е. <span class="highlight">10:30</span>.
Ожидание :4. /api/translateМаршрут также должен учитывать способы сокращения титулов/обращений в американском и британском английском. Например, доктор Райт сокращается как "Dr Wright" в британском английском и "Dr. Wright" в американском английском. См. информацию /components/american-to-british-titles.jsо различных типах титулов, которые должно обрабатывать ваше приложение.
Ожидание :5. Заключите переведенные слова или термины в <span class="highlight">...</span>теги, чтобы они отображались зеленым цветом.
Ожидание :6. Если одно или несколько обязательных полей отсутствуют, вернуть значение { error: 'Required field(s) missing' }.
Ожидание :7. Если textпусто, вернуть{ error: 'No text to translate' }
Ожидание :8. Если localeне соответствует ни одной из двух указанных локалей, вернуть { error: 'Invalid value for locale field' }.
Ожидание :9. Если textперевод не требуется, верните "Everything looks good to me!"значение translation.
Ожидание :10. Все 24 контрольные работы пройдены успешно.
Ожидание :11. Все 6 функциональных тестов пройдены успешно.
