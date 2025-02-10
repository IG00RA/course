document.addEventListener("DOMContentLoaded", function () {
  fetchDisplayedPrice().then(({ currencySymbol, currencyKey }) => {
    fetchConsumablesData(currencySymbol, currencyKey);
    fetchTariffsData(currencySymbol, currencyKey);
  });
});

function fetchDisplayedPrice() {
  return fetch(`https://${BACK_HOST}/api/displayed-price`)
    .then((response) => response.json())
    .then((result) => {
      const currency = result.data?.Displayed_price || "UAH";
      return {
        currencySymbol: currency === "USD" ? "$ " : "₴ ",
        currencyKey: currency === "USD" ? "Price_USD" : "Price",
      };
    })
    .catch((error) => {
      console.error("Помилка завантаження відображеної валюти:", error);
      return { currencySymbol: "₴ ", currencyKey: "Price" };
    });
}

function fetchConsumablesData(currencySymbol, currencyKey) {
  // Зчитуємо поточну мову з localStorage (за замовчуванням "uk-UA")
  const storedLang = localStorage.getItem("i18nextLng") || "uk-UA";

  // Формуємо значення locale для API: якщо мова містить "ru", використовуємо "ru", інакше — "uk-UA"
  const localeFetch = storedLang.includes("ru") ? "ru" : "uk-UA";
  // Робимо запит до API з актуальною локаллю
  fetch(`https://${BACK_HOST}/api/consumables?locale=${localeFetch}&populate=*`)
    .then((response) => response.json())
    .then((result) => {
      const items = result.data;
      // Створюємо об'єкт для швидкого доступу по ключу
      const dataByKey = {};
      items.forEach((item) => {
        dataByKey[item.key] = item;
      });

      const mapping = {
        "calculate.kings": { keys: ["king", "self-reg"] },
        "calculate.mentor": { keys: ["mentor"] },
        "calculate.creo": { keys: ["kreo"] },
        "calculate.autobay": { keys: ["autoload"] },
        "calculate.treker": { keys: ["track"] },
        "calculate.spay": { keys: ["spy"] },
        "calculate.antik": { keys: ["anty"] },
        "calculate.proxi": { keys: ["proxy"] },
      };

      const nameSeparator = storedLang.includes("ru") ? " и " : " і ";
      // Проходимо по кожному пункту списку
      document.querySelectorAll(".calculate__list-item").forEach((item) => {
        // Знаходимо елемент із назвою за допомогою data-i18n всередині .calculate__pill
        const pillSpan = item.querySelector(".calculate__pill span[data-i18n]");
        // Знаходимо елемент з ціною як наступного сусіда після .calculate__pill
        const priceSpan = item.querySelector(".calculate__pill").nextElementSibling;
        if (pillSpan && priceSpan) {
          const i18nKey = pillSpan.getAttribute("data-i18n");
          if (mapping[i18nKey]) {
            const keys = mapping[i18nKey].keys;
            let names = [];
            let prices = [];
            keys.forEach((k) => {
              if (dataByKey[k]) {
                names.push(dataByKey[k].Name);
                prices.push(dataByKey[k][currencyKey] || dataByKey[k].Price);
              }
            });
            if (names.length === 0) {
              item.style.display = "none";
              return;
            }

            pillSpan.textContent = names.join(nameSeparator);
            priceSpan.textContent = currencySymbol + prices.join(" + " + currencySymbol);
          }
        }
      });

      // Обчислюємо загальну суму (складаємо лише числові значення)
      let total = 0;
      items.forEach((item) => {
        const price = parseFloat(item[currencyKey] || item.Price);
        if (!isNaN(price)) {
          total += price;
        }
      });
      const totalElement = document.querySelector(".calculate__cost");
      if (totalElement) {
        const totalLabel = storedLang.includes("ru") ? "Вместе > " : "Разoм > ";
        totalElement.textContent = totalLabel + total + currencySymbol;
      }
    })
    .catch((error) => console.error("Помилка завантаження даних:", error))
    .finally(() => {
      document.querySelectorAll("section.calculate").forEach((el) => {
        el.style.display = "flex";
      });
    });
}

function fetchTariffsData(currencySymbol, currencyKey) {
  // Зчитуємо поточну мову з localStorage (за замовчуванням "uk-UA")
  const storedLang = localStorage.getItem("i18nextLng") || "uk-UA";

  // Формуємо значення locale для API: якщо мова містить "ru", використовуємо "ru", інакше — "uk-UA"
  const localeFetch = storedLang.includes("ru") ? "ru" : "uk-UA";
  fetch(`https://${BACK_HOST}/api/tariffs?locale=${localeFetch}&populate=*`)
    .then((response) => response.json())
    .then((result) => {
      const tariffs = result.data;

      // Створюємо об'єкт для швидкого доступу за ключем (наприклад, "free", "start", "base", "pro")
      const tariffByKey = {};
      tariffs.forEach((tariff) => {
        tariffByKey[tariff.key] = tariff;
      });

      // Оновлюємо кожну тарифну картку
      document.querySelectorAll(".tariff__card").forEach((card) => {
        // Знаходимо заголовок тарифної картки (очікується data-i18n у форматі "tariff.<key>.title")
        const titleEl = card.querySelector(".tariff__card-title[data-i18n]");
        if (!titleEl) return;

        // Отримуємо ключ тарифу з data-i18n (наприклад, "tariff.free.title" → "free")
        const dataI18n = titleEl.getAttribute("data-i18n");
        const parts = dataI18n.split(".");
        if (parts.length < 3) return;
        const key = parts[1];
        // Отримуємо дані тарифу за ключем, якщо немає даних для тарифу приховуємо його структуру
        const tariffData = tariffByKey[key];
        if (!tariffData) {
          card.style.display = "none";
          return;
        }
        // Оновлюємо заголовок тарифу
        titleEl.textContent = tariffData.Name;

        // Оновлюємо ціну тарифу (елемент з класом "text-headline-1")
        const priceEl = card.querySelector(".text-headline-1");
        if (priceEl) {
          priceEl.textContent = currencySymbol + (tariffData[currencyKey] || tariffData.Price);
        }
        // Оновлюємо список пунктів тарифу
        const listEl = card.querySelector(".tariff__card-list");
        if (listEl && Array.isArray(tariffData.TariffsItems)) {
          // Очищуємо поточний вміст списку
          listEl.innerHTML = "";
          // Для кожного пункту тарифу створюємо <li>
          tariffData.TariffsItems.forEach((item) => {
            const li = document.createElement("li");
            li.className = "tariff__card-list-item text-body-3";
            li.textContent = item.TariffsItem;
            listEl.appendChild(li);
          });
        }
      });
    })
    .catch((error) => {
      console.error("Помилка завантаження даних тарифів:", error);
    })
    .finally(() => {
      document.querySelectorAll(".tariff.relative").forEach((el) => {
        el.style.display = "flex";
      });
    });
}
