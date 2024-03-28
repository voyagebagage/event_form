export const isMonday = (date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

export const disabledDate = (current) => {
  // Can not select Mondays (1)
  return (
    current && (current.isBefore(new Date(), "day") || current.day() === 1)
  );
};

// Function to disable time
export const disabledTime = (current) => {
  let disabledHours = [];
  disabledHours = [...Array(24).keys()].filter((hour) => hour < 8);
  disabledHours.push(23);

  if (current && (current.day() === 2 || current.day() === 4)) {
    // If it's Tuesday or Thursday, disable hours from 19 to 23 (7 PM to 11 PM)
    disabledHours.push(19, 20, 21, 22);
  }

  return {
    disabledHours: () => disabledHours,
    disabledMinutes: () =>
      [...Array(60).keys()].filter(
        (minute) =>
          minute !== 0 && minute !== 30 && minute !== 15 && minute !== 45
      ),
    disabledSeconds: () => [],
  };
};
