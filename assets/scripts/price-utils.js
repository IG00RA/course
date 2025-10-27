document.addEventListener("DOMContentLoaded", function () {
  fetchConsumablesData(currencySymbol, currencyKey);
  fetchTariffsData(currencySymbol, currencyKey);
});
function formatPrice(price, currencySymbol) {
  return currencySymbol === "грн" ? `${price} ${currencySymbol}` : `${currencySymbol} ${price}`;
}

function fetchConsumablesData(currencySymbol, currencyKey) {
  const storedLang = localStorage.getItem("i18nextLng") || "uk-UA";
  const localeFetch = storedLang.includes("ru") ? "ru" : "uk-UA";

  fetch(`https://${BACK_HOST}/api/consumables?locale=${localeFetch}&populate=*`)
    .then((response) => response.json())
    .then((result) => {
      const items = result.data;
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

      document.querySelectorAll(".calculate__list-item").forEach((itemEl) => {
        const pillSpan = itemEl.querySelector(".calculate__pill span[data-i18n]");
        const priceSpan = itemEl.querySelector(".calculate__pill").nextElementSibling;
        const iconContainer = itemEl.querySelector(".calculate__pill");

        if (pillSpan && priceSpan) {
          const i18nKey = pillSpan.getAttribute("data-i18n");
          if (mapping[i18nKey]) {
            const keys = mapping[i18nKey].keys;
            let names = [];
            let prices = [];
            let foundIconUrl = null;

            keys.forEach((k) => {
              const itemData = dataByKey[k];
              if (itemData) {
                names.push(itemData.Name);
                prices.push(formatPrice(itemData[currencyKey] || itemData.Price, currencySymbol));

                if (itemData.icon && itemData.icon.url) {
                  foundIconUrl = `https://${BACK_HOST}${itemData.icon.url}`;
                }
              }
            });

            if (names.length === 0) {
              itemEl.style.display = "none";
              return;
            }

            pillSpan.textContent = names.join(nameSeparator);
            priceSpan.textContent = prices.join(" + ");

            if (foundIconUrl) {
              const existingImg = iconContainer.querySelector("img, i");
              const newImg = document.createElement("img");
              newImg.className = existingImg?.className || "calculate__icon";
              newImg.src = foundIconUrl;
              newImg.alt = names.join(", ");
              newImg.loading = "lazy";

              if (existingImg) {
                existingImg.replaceWith(newImg);
              } else {
                iconContainer.insertBefore(newImg, pillSpan);
              }
            }
          }
        }
      });

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
        totalElement.textContent = totalLabel + formatPrice(total, currencySymbol);
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
  const storedLang = localStorage.getItem("i18nextLng") || "uk-UA";
  const localeFetch = storedLang.includes("ru") ? "ru" : "uk-UA";

  fetch(`https://${BACK_HOST}/api/tariffs?locale=${localeFetch}&populate=*`)
    .then((response) => response.json())
    .then((result) => {
      const tariffs = result.data;
      const tariffByKey = {};
      tariffs.forEach((tariff) => {
        tariffByKey[tariff.key] = tariff;
      });

      document.querySelectorAll(".tariff__card").forEach((card) => {
        const titleEl = card.querySelector(".tariff__card-title[data-i18n]");
        if (!titleEl) return;

        const dataI18n = titleEl.getAttribute("data-i18n");
        const parts = dataI18n.split(".");
        if (parts.length < 3) return;
        const key = parts[1];

        const tariffData = tariffByKey[key];
        if (!tariffData) {
          card.style.display = "none";
          return;
        }

        titleEl.textContent = tariffData.Name;

        const priceEl = card.querySelector(".text-headline-1");
        if (priceEl) {
          priceEl.textContent = formatPrice(tariffData[currencyKey], currencySymbol);
        }

        const listEl = card.querySelector(".tariff__card-list");
        if (listEl && Array.isArray(tariffData.TariffsItems)) {
          listEl.innerHTML = "";
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
