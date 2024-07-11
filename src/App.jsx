import React, { cloneElement, useEffect, useState } from "react";
import { DatePicker } from "antd";
import { disabledDate, disabledTime } from "./utils/functions";

function App() {
  const [result, setResult] = React.useState("");
  const [user, setUser] = React.useState({});
  //userId states
  const [userId, setUserId] = useState(null);
  //chack states
  const [check, setCheck] = useState(false);
  // loading states
  const [isLoading, setIsLoading] = useState(true);
  // const [startDate, setStartDate] = useState(null);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [formFields, setFormFields] = useState({});
  const [partnership, setPartnership] = React.useState({
    new: true,
    regular: false,
  });
  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    const tUserId = window?.Telgram?.WebApp?.WebAppInitData?.user?.id;
    const tUser = window?.Telgram?.WebApp?.WebAppInitData?.user;
    if (tUserId || tUser) {
      setCheck(true);
      setUser(tUser);
      setUserId(tUserId);

      // localStorage.setItem("tUserId", tUserId);
      console.log("tUserId", tUserId, user);
    }
    setIsLoading(false);
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");

    const formData = new FormData(event.target);

    formData.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY); //to be able to send to web3forms
    formData.append("todoToday", "https://todo.today/my-account/");

    for (const [key, value] of formData) {
      setFormFields((prev) => ({ ...prev, [key]: value }));
    }
    // generate the sum up note to be sent to telegram and be copied from the user
    const note = generateCopyText(event);
    formData.append("sum_up", note);

    const responseWeb3form = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });
    formData.delete("access_key"); // no need to send it to telegram

    // Send a message to Telegram
    const message = note;
    const myToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const telegramApi = `https://api.telegram.org/bot${myToken}/sendMessage`;

    const responseTelegram = await fetch(telegramApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: import.meta.env.VITE_CHAT_ID,
        text: message,
        parse_mode: "Markdown", // Or 'HTML'
      }),
    });

    const data1 = await responseWeb3form.json(); // subbmitting to web3form
    const data2 = await responseTelegram.json(); // subbmitting to telegram

    if (data1.success && data2.ok) {
      setResult("Submitted");
      setResult("🙏🏼");
      setModalOpen(true);
      event.target.reset();
      setResult("");
    } else {
      console.log("Error web3form ", data1);
      console.log("Error telegram ", data2);
      setResult(data1.message || data2.message);
    }
  };

  const generateCopyText = (event) => {
    const dealType =
      !partnership.new && partnership.regular && formFields?.deal === "regular"
        ? "50/50"
        : "70/30";

    return `
      👉 Let us know your full program 48 hours prior 📣
      👉 Register and Add you event 👇
      🔔 ${formFields.todoToday || ""} 🔔
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      ✨ ${formFields.eventName || event?.target.eventName?.value} 
      👤 ${formFields.name || event?.target.name?.value}
      📅 ${
        formFields?.dateTime?.split?.split("-").reverse().join("/") ||
        event?.target.dateTime?.value
          ?.split(" ")[0]
          ?.split("-")
          .reverse()
          .join("/")
      }
      🕒 ${
        formFields.dateTime?.split(" ")[1] ||
        event?.target.dateTimea?.value?.split(" ")[1]
      }
      📍 ${formFields.area || event?.target.area?.value}
      🤝 ${dealType} deal
      💲 ${formFields.price || event?.target.price?.value}
      🔗 ${
        formFields.fbLink || event?.target.fbLink?.value
          ? formFields.fbLink || event?.target.fbLink?.value
          : " Not Provided"
      }
      📋 ${formFields.requirement || event?.target.requirement?.value}
      📞 ${formFields.contact_method || event?.target.requirement?.value}
    `.trim();
  };
  console.log(
    "telegram",
    window?.telegramApi,
    window.Telgram?.WebApp,
    window.Telgram
  );
  const copyToClipboard = () => {
    const textToCopy = generateCopyText();
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        alert(`Text copied to clipboard :${textToCopy}`); // Display an alert or you can use a state to show a message within the modal
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err); // Handle errors here
      });
  };

  const handleChangeNew = (event) => {
    if (
      event.target.name === "new" &&
      event.target.value === ("new_crowd" || "new_new-crow" || "famous")
    ) {
      setPartnership((prev) => ({ new: false, regular: prev.regular }));
    } else {
      setPartnership((prev) => ({ new: true, regular: prev.regular }));
    }
  };
  const handleChangeRegular = (event) => {
    if (event.target.name === "type_time") {
      setPartnership((prev) => ({ new: prev.new, regular: !prev.regular }));
    }
  };
  const handleChangeService = (event) => {
    if (event.target.value === "rental") {
      setPartnership(() => ({ new: true, regular: false }));
    }
  };
  console.log("user", user, userId, isLoading);
  return !isLoading ? (
    <>
      <div className="bg-green-900 text-white sm:p-10">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold py-4 text-center font-unbounded">
            ✨ Event Form ✨
          </h1>
          <div className="max-w-md mx-auto bg-green-800 p-8 border border-green-700 rounded">
            <>
              {check && <p> check 👤 {user?.first_name || "user name"}</p>}
              <p>{("initData", userId || "user id")}</p>
              <p>
                {("user", JSON.stringify(user && { user }, null, 2) || "user")}
              </p>
            </>

            <form onSubmit={onSubmit}>
              {/* Text Input */}
              <div className="flex-col">
                <label
                  htmlFor="name"
                  className="block mb-2 text-xl tracking-wide font-lato">
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="focus:outline-none focus:ring-2 focus:ring-yellow-200 w-full p-2 mb-8 bg-green-700 border border-green-600 rounded text-white "
                  placeholder="Your Name"
                  required
                />
              </div>

              {/* Select Dropdown */}
              <label
                htmlFor="new"
                className="block mb-2 text-xl tracking-wide font-lato">
                Are you new on the Island ?
              </label>
              <select
                id="new"
                name="new"
                className="w-full p-2 mb-8 bg-green-700 border border-green-600 rounded text-white"
                onChange={handleChangeNew}>
                <option value="new" defaultChecked>
                  New
                </option>
                <option value="new_crowd">No, I have a crowd</option>
                <option value="new_new-crowd">Yes, but I have a crowd</option>
                <option value="famous">No, but I am famous</option>
              </select>

              <div className="bg-green-700 rounded-md p-4 mb-4">
                <legend className="block mb-6 text-xl">
                  Do you want to run a ?
                </legend>
                <p className="text-center">
                  <label
                    htmlFor="type_time_one_time"
                    className="inline-flex items-center mr-4 mb-4 ">
                    <input
                      type="radio"
                      id="type_time_one_time"
                      name="type_time"
                      value="one_time"
                      className="text-green-600 bg-green-700"
                      onChange={handleChangeRegular}
                      defaultChecked
                    />
                    <span className="ml-2">One Time Event</span>
                  </label>
                  <label
                    htmlFor="type_time_regular"
                    className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      id="type_time_regular"
                      name="type_time"
                      value="regular"
                      className="text-green-600 bg-green-700"
                      onChange={handleChangeRegular}
                    />
                    <span className="ml-2">Regular</span>
                  </label>
                </p>
              </div>
              {!partnership.new && partnership.regular && (
                <div className="bg-green-900 rounded-md p-4 mb-4">
                  <legend className="block mb-6 tracking-wide font-lato text-xl">
                    What deal would you like ?
                  </legend>
                  <label
                    htmlFor="deal_50/50"
                    className="inline-flex items-center mr-4 mb-4">
                    <input
                      type="radio"
                      id="deal_50/50"
                      name="deal"
                      value="regular"
                      className="text-green-600 bg-green-700"
                      defaultChecked
                    />
                    <span className="ml-2">
                      50/50 we take care of ptomotion, we share cost
                    </span>
                  </label>
                  <label
                    htmlFor="deal_70/30"
                    className="inline-flex items-center mr-4 mb-4">
                    <input
                      type="radio"
                      id="deal_70/30"
                      name="deal"
                      value="one_time"
                      className="text-green-600 bg-green-700"
                      //  onChange={handleChangeRegular}
                    />
                    <span className="ml-2">
                      70/30 you pay/provide everything
                    </span>
                  </label>
                </div>
              )}

              <label
                htmlFor="service"
                className="block mt-8 mb-2 text-xl tracking-wide font-lato">
                Type of workshop:
              </label>
              <select
                id="service"
                name="service"
                className="w-full p-2 mb-8 bg-green-700 border border-green-600 rounded text-white"
                onChange={handleChangeService}>
                <option value="yoga" defaultChecked>
                  Yoga
                </option>
                <option value="dayWorkshop">Workshop, not yoga</option>
                <option value="music-performance-dj_set">
                  Evening Dance, Music Event
                </option>
                <option value="rental">Retreat/ Rental</option>
              </select>
              <label
                htmlFor="event_name"
                className="block mb-2 text-xl font-lato tracking-wide">
                Event Name:
              </label>
              <input
                type="text"
                id="event_name"
                name="eventName"
                className="w-full p-2 mb-10 bg-green-700 border border-green-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-200 "
                placeholder="Event Name"
                required
              />
              <label
                htmlFor="when"
                className="block mb-2 text-xl tracking-wide font-lato">
                📅 When ?
              </label>

              <div className="flex gap-2 mb-12">
                {/* <input
                  type="date"
                  name="day"
                  id="day"
                  min={new Date().toISOString().split("T")[0]}
                  // step="1"
                  className="w-1/3 bg-green-700 border border-green-600 rounded text-sm  p-2"
                  required
                /> */}
                {/* <input
                  type="time"
                  name="time"
                  id="time"
                  className="w-1/3 bg-green-700 border border-green-600 rounded text-md  p-2"
                  required
                /> */}

                <DatePicker
                  name="dateTime"
                  id="dateTime"
                  format="YYYY-MM-DD HH:mm"
                  disabledDate={disabledDate}
                  disabledTime={disabledTime}
                  showTime={{ hideDisabledOptions: true }}
                  inputReadOnly={true}
                  panelRender={(panel) => {
                    const customPanel = cloneElement(panel, {
                      style: {
                        ...panel.props.style,
                        position: "absolute",
                        top: 0,
                        left: -28,
                        zIndex: 100000000,
                        fontSize: "12px",
                        maxWidth: window.innerWidth - 10,
                        backgroundColor: "white",
                      },
                    });
                    return <>{customPanel}</>;
                  }}
                  className="w-1/2 hover:bg-green-700 bg-green-700 border border-green-600 rounded text-md text-white p-2"
                  required
                />
                <input
                  type="text"
                  name="price"
                  id="price"
                  placeholder="price thb"
                  className="w-1/2 bg-green-700 border border-green-600 rounded p-2"
                  required
                />
              </div>

              {/* Radio Buttons */}
              <fieldset className="mb-4">
                <div className="bg-green-700 rounded-md p-4 mb-4">
                  <legend className="block mb-6 text-xl tracking-wide font-lato">
                    Which Area ?
                  </legend>
                  <p className="text-center">
                    <label
                      htmlFor="area_theatre"
                      className="inline-flex items-center mr-4 mb-4">
                      <input
                        type="radio"
                        id="area_theatre"
                        name="area"
                        value="theatre"
                        className="text-green-600 bg-green-700 "
                        defaultChecked
                      />
                      <span className="ml-2">Amphitheatre</span>
                    </label>
                    <label
                      htmlFor="area_restaurant"
                      className="inline-flex items-center mr-4">
                      <input
                        type="radio"
                        id="area_restaurant"
                        name="area"
                        value="restaurant"
                        className="text-green-600 bg-green-700"
                      />
                      <span className="ml-2">Restaurant</span>
                    </label>
                    <label
                      htmlFor="area_sauna"
                      className="inline-flex items-center mr-4">
                      <input
                        type="radio"
                        id="area_sauna"
                        name="area"
                        value="sauna"
                        className="text-green-600 bg-green-700"
                      />
                      <span className="ml-2">Sauna</span>
                    </label>
                  </p>
                </div>
              </fieldset>

              {/* Textarea */}
              <label
                htmlFor="message"
                className="block mb-2 text-xl tracking-wide font-lato">
                Things you&apos;ll need:
              </label>
              <textarea
                id="requirement"
                name="requirement"
                rows="4"
                className="w-full p-2 mb-4 bg-green-700 border border-green-600 rounded text-white"
                placeholder="Sound System + 1 mic + ..."></textarea>

              {/*  contact */}
              <fieldset className="mb-4 mt-4 flex flex-col justify-center">
                <legend className="block mb-4  text-xl tracking-wide font-lato ">
                  Preferred Contact Method:
                </legend>
                <select
                  id="preferred_contact_method"
                  name="preferred_contact_method"
                  className="w-full p-2 mb-8 bg-green-700 border border-green-600 rounded text-white"
                  onChange={handleChangeNew}>
                  <option value="telegram" defaultChecked>
                    Telegram
                  </option>
                  <option value="messenger">Messenger</option>
                  <option value="whats_app">What&apos;s App</option>
                  <option value="ig">IG</option>
                </select>
                <label
                  htmlFor="contact_telegram"
                  className="inline-flex items-center justify-between">
                  <span className="ml-2 mr-2 font-lato">Telegram*</span>
                  <input
                    type="text"
                    id="contact_telegram_input"
                    name="contact_method"
                    className="w-2/3 p-2 mb-4 bg-green-700 border border-green-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-200"
                    placeholder="Your @id telegram or number"
                  />
                </label>
                <label
                  htmlFor="contact_email"
                  className="inline-flex items-center justify-between">
                  <span className="ml-2 mr-2 font-lato">Email</span>
                  <input
                    type="text"
                    id="contact_email_input"
                    name="contact_method"
                    className="w-2/3 p-2 mb-4 bg-green-700 border border-green-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-200"
                    placeholder="you@email.com"
                  />
                </label>
                <label
                  htmlFor="contact_messenger"
                  className="inline-flex items-center  justify-between">
                  <span className="ml-2 mr-2 font-lato">Messenger</span>
                  <input
                    type="text"
                    id="contact_messenger_input"
                    name="contact_method"
                    className="w-2/3 p-2 mb-4 bg-green-700 border border-green-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-200"
                    placeholder="Your @id fb or url"
                  />
                </label>
                <label
                  htmlFor="contact_ig"
                  className="inline-flex items-center justify-between">
                  <span className="ml-2 mr-2 font-lato">IG</span>
                  <input
                    type="text"
                    id="contact_ig_input"
                    name="contact_method"
                    className="w-2/3 p-2 mb-4 bg-green-700 border border-green-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-200"
                    placeholder="Your @id IG or number"
                  />
                </label>
                <label
                  htmlFor="contact_whats_app"
                  className="inline-flex items-center justify-between">
                  <span className="ml-2 mr-2 font-lato">What&apos;s App</span>
                  <input
                    type="text"
                    id="contact_whats_app_input"
                    name="contact_method"
                    className="w-2/3 p-2 mb-4 bg-green-700 border border-green-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-200"
                    placeholder="+6664589543"
                  />
                </label>
              </fieldset>

              {/* Checkboxes */}
              {/* <fieldset className="mb-4">
                <legend className="block mb-2">Interests:</legend>
                <label
                  htmlFor="interest_yoga"
                  className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    id="interest_yoga"
                    name="interests"
                    value="yoga"
                    className="text-green-600 bg-green-700"
                  />
                  <span className="ml-2">Yoga</span>
                </label>
                <label
                  htmlFor="interest_meditation"
                  className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    id="interest_meditation"
                    name="interests"
                    value="meditation"
                    className="text-green-600 bg-green-700"
                  />
                  <span className="ml-2">Meditation</span>
                </label>
                <label
                  htmlFor="interest_art"
                  className="inline-flex items-center">
                  <input
                    type="checkbox"
                    id="interest_art"
                    name="interests"
                    value="art"
                    className="text-green-600 bg-green-700"
                  />
                  <span className="ml-2">Art</span>
                </label>
              </fieldset> */}
              {/* Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex  justify-center items-center">
                  <div className="bg-green-800 p-5 border border-green-700 rounded">
                    <h2 className="text-white text-lg font-bold mb-4">
                      Form Submitted
                    </h2>
                    <div className="mb-4 flex flex-col">
                      <span>
                        👉 Let us know your full program 48 hours prior 📣
                      </span>
                      ------------------------------
                      <p className="flex flex-col item-center justify-center">
                        <span>👇 Register and Add you event 👇</span>
                        <span>
                          👉
                          <a
                            href={formFields.todoToday}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 visited:text-purple-900 underline text-xl text-justify-center
                          ">
                            Phangan Today
                          </a>
                          👈
                        </span>
                      </p>
                      -------------------------------
                      <span>
                        ✨ {formFields.eventName} - 👤 {formFields.name}
                      </span>
                      <span>
                        📅{" "}
                        {formFields.dateTime
                          ?.split(" ")[0]
                          ?.split("-")
                          .reverse()
                          .join("/")}
                      </span>
                      <span>🕒 {formFields.dateTime?.split(" ")[1]}</span>
                      {formFields.service === "music-performance-dj_set" && (
                        <span>🔊 🎧 🎶</span>
                      )}
                      {formFields.service === "yoga" && <span> 🧘‍♀️ </span>}
                      {formFields.service === "dayWorkshop" && (
                        <span> ✨ </span>
                      )}
                      {formFields.service === "rental" && <span> 🏘 </span>}
                      <span>📍 {formFields.area}</span>
                      <span>
                        🤝{" "}
                        {!partnership.new &&
                        partnership.regular &&
                        formFields?.deal === "regular"
                          ? "50/50"
                          : "70/30"}{" "}
                        deal
                      </span>
                      <span>💲 {formFields.price}</span>
                      <span>🔗 {formFields.fbLink}</span>
                      <span>{formFields.contact_method}</span>
                      <span>📋 {formFields.requirement}</span>
                    </div>

                    {/* Copy Text Button */}
                    <button
                      onClick={copyToClipboard}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
                      Copy Text
                    </button>
                    <button
                      onClick={closeModal}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Close
                    </button>
                  </div>
                </div>
              )}
              {/* Submit Button */}
              <button
                type="submit"
                className="font-unbounded w-full mt-1 p-3 bg-green-700 hover:bg-green-600 rounded text-white text-xl font-bold tracking-widest">
                {result ? result : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <span>{result}</span>
    </>
  ) : (
    <div className="flex h-screen justify-center items-center bg-gradient-to-b from-green-600 via-green-900 to-green-900">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );
}

export default App;
