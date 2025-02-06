const submitButton = document?.getElementById("register");
const loader = submitButton?.querySelector(".loader");
const buttonText = submitButton?.querySelector(".button-text");

let referrer = document.referrer;
if (referrer) {
  referrer = referrer;
} else {
  referrer = "Не вказано";
}

function redirectToChatClick() {
  const params = getQueryParams();
  let message = "<b>Пользователь перешёл в чат:</b>\n";
  message += getParamString(params);

  sendMessage(message);
  sendToGoogleScript({ message: "Пользователь перешёл в чат:", ...params });
  redirectTo(MANAGER_CHAT_URL, params.refId);
}

function redirectToBotClick() {
  const params = getQueryParams();
  let message = "<b>Пользователь перешёл в бот:</b>\n";
  message += getParamString(params);

  sendMessage(message);
  sendToGoogleScript({ message: "Пользователь перешёл в бот:", ...params });
  redirectTo(ACADEMY_BOT_URL, params.refId);
}

$("#register_form").submit((event) => {
  event.preventDefault();

  const username = document.getElementById("username");
  const phone = document.getElementById("phone");
  const nickname = document.getElementById("nickname");

  let errorMessages = [];

  username?.classList.remove("error");
  phone?.classList.remove("error");
  nickname?.classList.remove("error");

  const usernameError = document.getElementById("username-error");
  const phoneError = document.getElementById("phone-error");
  const nicknameError = document.getElementById("nickname-error");

  usernameError?.classList.remove("error-visible");
  phoneError?.classList.remove("error-visible");
  nicknameError?.classList.remove("error-visible");

  if (!username.value) {
    username?.classList.add("error");
    usernameError?.classList.add("error-visible");
    errorMessages.push("Ім'я не може бути порожнім");
  } else if (username.value.length > 100) {
    username?.classList.add("error");
    usernameError?.classList.add("error-visible");
    errorMessages.push("Ім'я не може бути довшим за 100 символів");
  }

  const phoneRegex = /^\+38\d{10}$/;
  if (!phone.value || !phoneRegex.test(phone.value)) {
    phone?.classList.add("error");
    phoneError?.classList.add("error-visible");
    errorMessages.push("Номер телефону повинен бути у форматі +38XXXXXXXXXX");
  }

  const nicknameRegex = /^@([a-zA-Z0-9_]{3,32})$/;
  if (!nickname.value) {
    nickname?.classList.add("error");
    nicknameError?.classList.add("error-visible");
    errorMessages.push("Нікнейм не може бути порожнім");
  } else if (!nicknameRegex.test(nickname.value)) {
    nickname?.classList.add("error");
    nicknameError?.classList.add("error-visible");
    errorMessages.push("Нікнейм має бути у форматі @nickname і довжиною від 3 до 32 символів");
  }

  if (errorMessages.length > 0) {
    return;
  }

  submitButton?.classList.add("disabled");
  buttonText?.classList.add("hidden");
  loader?.classList.remove("hidden");

  const form = $("#register_form").serializeArray();

  let message = "<b>Пользователь отправил форму:</b>\n";
  message += "ФИО: <b>" + form[0].value + "</b>\n";
  message += "Номер телефона: <b>" + form[1].value + "</b>\n";
  message += "Tg username: <b>" + form[2].value + "</b>\n";
  message += "Url: <b>" + referrer + "</b>\n";

  const params = getQueryParams();
  message += getParamString(params);

  sendToGoogleScript({
    message: "Пользователь отправил форму:",
    name: form[0].value,
    phone: form[1].value,
    username: form[2].value,
    url: referrer,
    ...params,
  });

  sendMessage(message, true);
});

function getQueryParams() {
  const searchParams = new URLSearchParams(window.location.search);
  const params = {};
  params.refId = searchParams.get("ref_id");
  params.sub1 = searchParams.get("sub1");
  params.sub2 = searchParams.get("sub2");
  params.sub3 = searchParams.get("sub3");
  params.sub4 = searchParams.get("sub4");
  params.sub5 = searchParams.get("sub5");
  params.sub6 = searchParams.get("sub6");
  params.sub7 = searchParams.get("sub7");
  params.sub8 = searchParams.get("sub8");
  params.fbp = searchParams.get("fbp");
  return params;
}

function getParamString(queryParams) {
  let message = "";

  for (let key in queryParams) {
    message += queryParams?.[key] ? `${key} <b>${queryParams[key]}</b>\n` : "";
  }

  return message;
}

function sendMessage(message, isRedirect = false) {
  fetch(`https://${BACK_HOST}/api/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  })
    .then((response) => {
      if (response.ok) {
        if (isRedirect) {
          const currentParams = window.location.search;
          const newUrl = `confirm.html${currentParams}`;
          window.location.href = newUrl;
        }
      } else {
        console.error("Failed to send message to Telegram");
        showError();
      }
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      showError();
    })
    .finally(() => {
      submitButton?.classList.remove("disabled");
      buttonText?.classList.remove("hidden");
      loader?.classList.add("hidden");
    });
}

function sendToGoogleScript(data) {
  fetch(`https://${BACK_HOST}/api/send-to-google-script`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Data sent to Google Script");
      } else {
        console.error("Failed to send data to Google Script");
      }
    })
    .catch((error) => {
      console.error("Error sending data to Google Script:", error);
    });
}

function showError() {
  const errorElement = document.getElementById("form-error");
  errorElement.style.display = "block";
}

function redirectTo(url, refId = undefined) {
  const params = refId ? `?start=${refId}` : "";

  window.location.href = url + params;
}
